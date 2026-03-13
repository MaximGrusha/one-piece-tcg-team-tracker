import { z } from "zod";

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const CreateCardSchema = z.object({
  name: z.string().min(1).max(200),
  setCode: z.string().min(1).max(20),
  imageUrl: z
    .string()
    .url()
    .optional()
    .or(z.literal(""))
    .or(z.null())
    .transform((v) => v || null),
  rarity: z.enum([
    "COMMON",
    "UNCOMMON",
    "RARE",
    "SUPER_RARE",
    "SECRET_RARE",
    "LEADER",
  ]),
  color: z.enum([
    "RED",
    "BLUE",
    "GREEN",
    "PURPLE",
    "BLACK",
    "YELLOW",
    "MULTICOLOR",
  ]),
  totalQuantity: z.number().int().positive().max(999),
  notes: z.string().max(500).optional().or(z.null()).transform((v) => v ?? null),
});

export const UpdateCardSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  imageUrl: z
    .string()
    .url()
    .optional()
    .or(z.literal(""))
    .or(z.null())
    .transform((v) => (v === "" ? null : v)),
  rarity: z
    .enum(["COMMON", "UNCOMMON", "RARE", "SUPER_RARE", "SECRET_RARE", "LEADER"])
    .optional(),
  color: z
    .enum(["RED", "BLUE", "GREEN", "PURPLE", "BLACK", "YELLOW", "MULTICOLOR"])
    .optional(),
  totalQuantity: z.number().int().min(0).max(999).optional(),
  availableQuantity: z.number().int().min(0).max(999).optional(),
  notes: z.string().max(500).nullable().optional(),
});

export const CreateBorrowSchema = z.object({
  items: z
    .array(
      z.object({
        cardId: z.string().min(1),
        quantity: z.number().int().positive(),
      })
    )
    .min(1),
});

export const CreateUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
  displayName: z.string().min(1).max(60),
  role: z.enum(["ADMIN", "MEMBER"]).default("MEMBER"),
});

export const UpdateUserSchema = z.object({
  displayName: z.string().min(1).max(60).optional(),
  role: z.enum(["ADMIN", "MEMBER"]).optional(),
  password: z.string().min(8).max(100).optional(),
});
