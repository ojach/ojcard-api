import { jwtVerify } from "jose";

export default async function setUsername(c) {
  const db = c.env.DB;

  // --- JWT からユーザーID取得 ---
  const authHeader = c.req.header("Authorization");
  if (!authHeader) return c.json({ error: "no_token" }, 401);

  const token = authHeader.replace("Bearer ", "").trim();

  let payload;
  try {
    payload = (await jwtVerify(token, new TextEncoder().encode(c.env.JWT_SECRET))).payload;
  } catch (e) {
    return c.json({ error: "invalid_token" }, 401);
  }

  const userId = payload.user_id;

  // --- username 取得 ---
  const { username } = await c.req.json();
  if (!username) return c.json({ error: "missing_username" }, 400);

  // バリデーション
  const valid = /^[a-zA-Z0-9_]{1,20}$/;
  if (!valid.test(username)) {
    return c.json({ error: "invalid_format" }, 400);
  }

  // --- 重複チェック ---
  const exists = await db.prepare("SELECT id FROM users WHERE username = ?").bind(username).first();
  if (exists) {
    return c.json({ error: "already_taken" }, 409);
  }

  // --- 保存 ---
  await db.prepare("UPDATE users SET username = ? WHERE id = ?")
          .bind(username, userId)
          .run();

  return c.json({ status: "username_set", username });
}
