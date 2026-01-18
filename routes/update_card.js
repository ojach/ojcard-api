import { jwtVerify } from "jose";

export default async function updateCard(c) {
  const db = c.env.DB;

  // --- JWT 検証 ---
  const auth = c.req.header("Authorization");
  if (!auth) return c.json({ error: "no_token" }, 401);

  const token = auth.replace("Bearer ", "").trim();
  let payload;

  try {
    payload = (
      await jwtVerify(token, new TextEncoder().encode(c.env.JWT_SECRET))
    ).payload;
  } catch (e) {
    return c.json({ error: "invalid_token" }, 401);
  }

  const userId = payload.user_id;

  // --- JSON 受け取り ---
  const body = await c.req.json();

  const {
    type,
    name,
    name_roman,
    title,

    icon_url,
    show_icon,

    company_logo_url,
    company_name,
    show_company,

    personal_page_url,
    sns_link,
  } = body;

  // --- バリデーション（最低限） ---
  if (!name || !name_roman || !title) {
    return c.json({ error: "missing_required_fields" }, 400);
  }

  // type は business / casual のみ
  const cardType = (type === "casual") ? "casual" : "business";

  // show_xxx は 0/1 の整数に統一
  const showIcon = show_icon ? 1 : 0;
  const showCompany = show_company ? 1 : 0;

  // --- 既存カードの有無チェック ---
  const exists = await db.prepare(
    "SELECT user_id FROM card WHERE user_id = ?"
  )
  .bind(userId)
  .first();

  if (!exists) {
    // INSERT
    await db.prepare(
      `INSERT INTO card (
        user_id,
        type,
        name, name_roman, title,
        icon_url, show_icon,
        company_logo_url, company_name, show_company,
        personal_page_url, sns_link
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      userId,
      cardType,
      name, name_roman, title,
      icon_url, showIcon,
      company_logo_url, company_name, showCompany,
      personal_page_url, sns_link
    )
    .run();
  } else {
    // UPDATE
    await db.prepare(
      `UPDATE card SET
        type = ?,
        name = ?, name_roman = ?, title = ?,
        icon_url = ?, show_icon = ?,
        company_logo_url = ?, company_name = ?, show_company = ?,
        personal_page_url = ?, sns_link = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?`
    )
    .bind(
      cardType,
      name, name_roman, title,
      icon_url, showIcon,
      company_logo_url, company_name, showCompany,
      personal_page_url, sns_link,
      userId
    )
    .run();
  }

  return c.json({ status: "updated" });
}
