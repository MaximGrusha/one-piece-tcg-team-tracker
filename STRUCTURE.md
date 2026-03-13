# Treasure Rare — Project Structure

## Stack

| Шар | Технологія |
|-----|------------|
| Framework | Next.js 15 (App Router) |
| Мова | TypeScript (strict) |
| База даних | Neon PostgreSQL (serverless) |
| ORM | Prisma 7 + `@prisma/adapter-pg` |
| Auth | NextAuth.js v5 (Credentials, role-based) |
| Стилі | Tailwind CSS 4 |
| Шрифти | Outfit (display) + DM Sans (body) — Google Fonts |
| Деплой | Vercel |
| Prices API | OPTCG API (https://optcgapi.com/) — безкоштовний |
| Валідація | Zod |

---

## Файлова структура

```
treasure-rare/
│
├── prisma/
│   └── schema.prisma             # Схема БД (User, Card, Set, Borrow, PriceHistory, ActivityLog)
│
├── generated/
│   └── prisma/                   # Згенерований Prisma Client (НЕ комітити)
│       ├── client.ts
│       └── enums.ts
│
├── src/
│   ├── app/                      # Next.js App Router
│   │   │
│   │   ├── layout.tsx            # Root layout (шрифти, метадані)
│   │   ├── globals.css           # Tailwind + CSS-змінні + компоненти
│   │   │
│   │   ├── login/
│   │   │   └── page.tsx          # Сторінка входу (Credentials form)
│   │   │
│   │   ├── (main)/               # Route group — для авторизованих
│   │   │   ├── layout.tsx        # Перевірка сесії + shell (header, nav)
│   │   │   │
│   │   │   ├── page.tsx          # Головна: вибір сету + грід карток
│   │   │   │
│   │   │   ├── card/
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx  # Деталі картки (зображення, ціна, позика)
│   │   │   │
│   │   │   ├── search/
│   │   │   │   └── page.tsx      # Пошук по всіх сетах
│   │   │   │
│   │   │   └── borrows/
│   │   │       └── page.tsx      # Мої позики (active + history)
│   │   │
│   │   ├── admin/                # Route group — тільки Admin
│   │   │   ├── layout.tsx        # Перевірка role === "ADMIN"
│   │   │   ├── page.tsx          # Дашборд (статистика, activity log)
│   │   │   ├── cards/
│   │   │   │   └── page.tsx      # Управління картками (import, qty, delete)
│   │   │   ├── sets/
│   │   │   │   └── page.tsx      # Управління сетами (sync, import)
│   │   │   ├── users/
│   │   │   │   └── page.tsx      # Управління юзерами (create, deactivate)
│   │   │   └── borrows/
│   │   │       └── page.tsx      # Всі позики (force-return)
│   │   │
│   │   └── api/
│   │       ├── auth/
│   │       │   └── [...nextauth]/
│   │       │       └── route.ts  # NextAuth handlers
│   │       │
│   │       ├── users/
│   │       │   ├── route.ts      # GET (admin list), POST (admin create)
│   │       │   └── [id]/
│   │       │       └── route.ts  # PATCH, DELETE (admin)
│   │       │
│   │       ├── sets/
│   │       │   ├── route.ts      # GET all sets
│   │       │   ├── sync/
│   │       │   │   └── route.ts  # POST — sync від OPTCG API (admin)
│   │       │   └── [code]/
│   │       │       └── import/
│   │       │           └── route.ts  # POST — import всіх карток сету (admin)
│   │       │
│   │       ├── cards/
│   │       │   ├── route.ts      # GET (фільтри: set, rarity, color, search, avail)
│   │       │   └── [id]/
│   │       │       └── route.ts  # GET, PATCH (admin: qty/notes), DELETE (admin)
│   │       │
│   │       ├── borrows/
│   │       │   ├── route.ts      # GET (свої / всі для admin), POST (create)
│   │       │   └── [id]/
│   │       │       └── return/
│   │       │           └── route.ts  # PATCH — повернення
│   │       │
│   │       ├── prices/
│   │       │   └── refresh/
│   │       │       └── route.ts  # POST — force refresh (admin)
│   │       │
│   │       └── cron/
│   │           └── update-prices/
│   │               └── route.ts  # GET — Vercel Cron (щодня о 06:00)
│   │
│   ├── lib/
│   │   ├── prisma.ts             # Prisma singleton (PrismaPg adapter)
│   │   ├── auth.ts               # NextAuth config + getSession helpers
│   │   ├── optcg.ts              # OPTCG API client (fetchSet, fetchCard, fetchPrices)
│   │   └── zod-schemas.ts        # Zod-схеми для валідації API-запитів
│   │
│   ├── components/
│   │   ├── ui/                   # Базові UI-компоненти
│   │   │   ├── Button.tsx
│   │   │   ├── Badge.tsx         # RarityBadge, ColorBadge
│   │   │   ├── Modal.tsx
│   │   │   ├── Toast.tsx
│   │   │   ├── Spinner.tsx
│   │   │   └── Input.tsx
│   │   │
│   │   ├── cards/
│   │   │   ├── CardGrid.tsx      # Грід карток (auto-fill, responsive)
│   │   │   ├── CardTile.tsx      # Тайл картки (image + info + actions)
│   │   │   ├── CardDetail.tsx    # Деталі картки (modal або сторінка)
│   │   │   └── CardFilters.tsx   # Фільтри: rarity, color, availability, price
│   │   │
│   │   ├── sets/
│   │   │   └── SetSelector.tsx   # Dropdown-селектор сету (grouped OP/ST)
│   │   │
│   │   ├── borrows/
│   │   │   ├── BorrowSheet.tsx   # Bottom sheet для мобайла (позичити)
│   │   │   ├── BorrowRow.tsx     # Рядок в списку позик
│   │   │   └── BorrowHistory.tsx # Список active + returned
│   │   │
│   │   └── layout/
│   │       ├── Header.tsx        # Sticky header з лого + юзер + logout
│   │       ├── BottomNav.tsx     # Мобільна навігація (Home, Search, Borrows, Profile)
│   │       └── AdminSidebar.tsx  # Сайдбар для адмін-панелі
│   │
│   ├── hooks/
│   │   ├── useCards.ts           # TanStack Query хук для карток
│   │   ├── useBorrows.ts         # Хук для позик
│   │   └── useSet.ts             # Хук для поточного сету
│   │
│   └── types/
│       └── index.ts              # Глобальні TypeScript-типи
│
├── middleware.ts                 # Auth middleware (захист роутів)
├── vercel.json                   # Cron job config
├── .env.local                    # Локальні env-змінні (НЕ комітити)
├── .env.example                  # Шаблон env-змінних (комітити)
├── .gitignore
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Prisma Schema (основні моделі)

```prisma
model User {
  id          String   @id @default(cuid())
  email       String   @unique
  name        String
  displayName String
  password    String   // bcrypt
  role        Role     @default(MEMBER)
  borrows     Borrow[]
  createdAt   DateTime @default(now())
}

model Set {
  id        String   @id @default(cuid())
  code      String   @unique   // "OP01", "ST05"
  name      String             // "Romance Dawn"
  type      SetType            // BOOSTER | STARTER | PROMO
  cards     Card[]
  createdAt DateTime @default(now())
}

model Card {
  id              String    @id @default(cuid())
  cardId          String    @unique  // "OP01-001"
  name            String
  setCode         String
  set             Set       @relation(fields: [setCode], references: [code])
  rarity          String    // "C" | "UC" | "R" | "SR" | "SEC" | "TR" | "L" | ...
  color           String
  type            String    // Leader | Character | Event | Stage
  imageUrl        String?
  totalQuantity   Int       @default(0)
  marketPrice     Float?
  lastPriceUpdate DateTime?
  notes           String?
  borrows         Borrow[]
  priceHistory    PriceHistory[]
  createdAt       DateTime  @default(now())
}

model Borrow {
  id         String       @id @default(cuid())
  cardId     String
  card       Card         @relation(fields: [cardId], references: [id])
  userId     String
  user       User         @relation(fields: [userId], references: [id])
  quantity   Int
  status     BorrowStatus @default(ACTIVE)
  borrowedAt DateTime     @default(now())
  returnedAt DateTime?
  notes      String?
}

model PriceHistory {
  id     String   @id @default(cuid())
  cardId String
  card   Card     @relation(fields: [cardId], references: [id])
  price  Float
  date   DateTime @default(now())
}

model ActivityLog {
  id        String   @id @default(cuid())
  userId    String
  action    String   // "borrow" | "return" | "add_card" | "import_set" | ...
  details   String   // JSON
  createdAt DateTime @default(now())
}

enum Role        { ADMIN MEMBER }
enum SetType     { BOOSTER STARTER PROMO }
enum BorrowStatus { ACTIVE RETURNED }
```

---

## Env Variables

```bash
# .env.local (розробка)
DATABASE_URL=postgresql://...         # Neon connection string
NEXTAUTH_SECRET=<openssl rand -base64 32>
NEXTAUTH_URL=http://localhost:3000

# Vercel Dashboard (продакшн) — ті самі ключі + NEXTAUTH_URL = https://your-app.vercel.app
```

---

## Ролі і доступ

| Роут / Дія | MEMBER | ADMIN |
|------------|--------|-------|
| Перегляд карток | ✅ | ✅ |
| Позичити картку | ✅ | ✅ |
| Повернути свою позику | ✅ | ✅ |
| Бачити всі позики | ❌ | ✅ |
| Додати / Редагувати / Видалити картку | ❌ | ✅ |
| Імпорт сету з OPTCG API | ❌ | ✅ |
| Управління юзерами | ❌ | ✅ |
| Force-return чужих позик | ❌ | ✅ |
| Оновлення цін | ❌ | ✅ |

---

## OPTCG API — ключові ендпоінти

```
GET https://optcgapi.com/api/sets/
→ Список всіх сетів (code, name, cardCount)

GET https://optcgapi.com/api/sets/{set_code}/
→ Всі картки сету (id, name, rarity, color, type, imageUrl, price)

GET https://optcgapi.com/api/sets/card/{card_id}/
→ Деталі однієї картки + ціна
```

---

## Vercel Cron (vercel.json)

```json
{
  "crons": [
    {
      "path": "/api/cron/update-prices",
      "schedule": "0 6 * * *"
    }
  ]
}
```
