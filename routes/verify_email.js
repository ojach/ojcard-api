export default async function verifyEmail(c) {
  const db = c.env.DB;
  const token = c.req.query("token");

  if (!token) {
    return c.json({ error: "missing_token" }, 400);
  }

  // トークン一致検索
  const user = await db.prepare(`
    SELECT id, verify_token, email_verified
    FROM users
    WHERE verify_token = ?
  `).bind(token).first();

  if (!user) {
    return c.json({ error: "invalid_token" }, 400);
  }

  // すでに認証済み
  if (user.email_verified) {
    return c.json({ status: "already_verified" });
  }

  // 認証処理
  await db.prepare(`
    UPDATE users
    SET email_verified = 1,
        verify_token = NULL,
        verified_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(user.id).run();

  return c.json({ status: "verified" });
}
