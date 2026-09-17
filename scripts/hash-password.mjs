import bcrypt from "bcryptjs";

const plainText = process.argv[2];

if (!plainText) {
  console.error("사용법: node scripts/hash-password.mjs <비밀번호>");
  process.exit(1);
}

const hash = await bcrypt.hash(plainText, 10);

// Next.js expands `$VAR`/`${VAR}` in .env files, which mangles a raw bcrypt
// hash (it starts with `$2b$10$...`). Escape every `$` so it survives.
const escapedForEnvFile = hash.replaceAll("$", "\\$");

console.log(`해시: ${hash}`);
console.log(`.env 파일에 붙여넣을 값 (달러 기호 이스케이프됨): ${escapedForEnvFile}`);
