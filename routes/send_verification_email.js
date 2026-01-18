import verifyHtml from "../templates/verify_email.html";
import verifyText from "../templates/verify_email.txt";
import { SignJWT } from "jose";

export default async function sendVerificationEmail(env, email, userId) {

  // JWT 作成（30分有効）
  const token = await new SignJWT({ uid: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("30m")
    .sign(new TextEncoder().encode(env.JWT_SECRET));

  const verifyUrl = `https://ojapp.app/card/api/verify_email?token=${token}`;

  // テンプレ埋め込み
  const html = verifyHtml.replace("{{verify_url}}", verifyUrl);
  const text = verifyText.replace("{{verify_url}}", verifyUrl);

  // メール送信
  const result = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "OJapp <noreply@ojapp.app>",
      to: email,
      subject: "【OJapp Card】メール認証",
      html,
      text,
    }),
  });

  return await result.json();
}

