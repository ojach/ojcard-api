import bcrypt from "bcryptjs";
import sendVerificationEmail from "./send_verification_email.js";

export default async function createUser(c) {
  const db = c.env.DB;
  const { email, password } = await c.req.json();

  // --- 必須チェック ---
  if (!email || !password) {
    return c.json({ error: "missing_fields" }, 400);
  }

  // --- 既存チェック ---
  const exists = await db
    .prepare("SELECT id FROM users WHERE email = ?")
    .bind(email)
    .first();

  if (exists) {
    return c.json({ error: "email_exists" }, 409);
  }

  // --- パスワードハッシュ ---
  const hash = await bcrypt.hash(password, 10);

  // --- DBにユーザー作成（email_verified=0） ---
  const result = await db
    .prepare(
      `INSERT INTO users (email, password_hash, email_verified)
       VALUES (?, ?, 0)`
    )
    .bind(email, hash)
    .run();

  const userId = result.lastRowId;

  // --- 認証メール送信 ---
  await sendVerificationEmail(c.env, email, userId);

  // --- レスポンス ---
  return c.json({ ok: true, user_id: userId, status: "created" });
}
