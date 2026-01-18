export default async function sendVerificationEmail(env, email, userId) {

  // JWT の中に userId を入れて 30分期限にする
  const token = await new SignJWT({ uid: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("30m")
    .sign(env.JWT_SECRET);

  const verifyUrl = `https://ojapp.app/card/api/verify_email?token=${token}`;

  // HTMLテンプレに埋め込み
  const html = YOUR_HTML_TEMPLATE.replace("{{verify_url}}", verifyUrl);
  const text = YOUR_TEXT_TEMPLATE.replace("{{verify_url}}", verifyUrl);

  const result = await env.RESEND.emails.send({
    from: "OJapp <noreply@ojapp.app>",
    to: email,
    subject: "【OJapp Card】メールアドレスの認証",
    html,
    text
  });

  return result;
}
