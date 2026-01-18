export default async function getCard(c) {
  const db = c.env.DB;

  // URLパラメータから username を取得
  const username = c.req.param("username");
  if (!username) return c.json({ error: "missing_username" }, 400);

  // users から user_id を取得
  const user = await db.prepare(
    "SELECT id FROM users WHERE username = ?"
  )
  .bind(username)
  .first();

  if (!user) {
    return c.json({ error: "user_not_found" }, 404);
  }

  const userId = user.id;

  // card 情報を取得
  const card = await db.prepare(
    `SELECT
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
      sns_link
     FROM card
     WHERE user_id = ?`
  )
  .bind(userId)
  .first();

  if (!card) {
    return c.json({ error: "card_not_found" }, 404);
  }

  // show_icon / show_company を boolean に変換
  const result = {
    type: card.type,
    name: card.name,
    name_roman: card.name_roman,
    title: card.title,

    icon_url: card.icon_url,
    show_icon: card.show_icon === 1,

    company_logo_url: card.company_logo_url,
    company_name: card.company_name,
    show_company: card.show_company === 1,

    personal_page_url: card.personal_page_url,
    sns_link: card.sns_link
  };

  return c.json({ status: "ok", card: result });
}
