import bcrypt from "bcryptjs";
import sendVerificationEmail from "./send_verification_email.js";

export default async function createUser(c) {
  const db = c.env.DB;

  const { email, password } = await c.req.json();

  if (!email || !password) {
    return c.json({ error: "missing_fields" }, 400);
  }

  const exists = await db.prepare(
    "SELECT id FROM users WHERE email = ?"
  ).bind(email).first();

  if (exists) {
    return c.json({ error: "email_exists" }, 409);
  }

  const hash = await bcrypt.hash(password, 10);

  const result = await db.prepare(
    "INSERT INTO users (email, password_hash,email_verified) VALUES (?, ?)"
  ).bind(email, hash)
  .run();

  return c.json({ user_id: result.lastRowId, status: "created" });
}
