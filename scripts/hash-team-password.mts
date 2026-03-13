import bcrypt from "bcryptjs";

const password = "crew-2026";

async function main() {
  const hash = await bcrypt.hash(password, 10);
  console.log("Plain password:", password);
  console.log("BCrypt hash:", hash);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

