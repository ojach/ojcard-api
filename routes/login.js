import bcrypt, { compare } from "bcryptjs";
import { SignJWT } from "jose";

export default async function login(c) {
  const env = c.env;
  const { email, password } = await c.req.json();

  if (!email || !password) {
    return c.json({ error: "missing_fields" }, 400);
  }

  const user = await env.DB.prepare(
    "SELECT id, password_hash FROM users WHERE email = ?"
  ).bind(email).first();

  if (!user) return c.json({ error: "invalid_credentials" }, 401);

  const ok = await compare(password, user.password_hash);
  if (!ok) return c.json({ error: "invalid_credentials" }, 401);

  const secretKey = new TextEncoder().encode(env.JWT_SECRET);
  const token = await new SignJWT({ user_id: user.id })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("30d")
    .sign(secretKey);

  return c.json({ token });
}
