// -------------------------------------------------------------
//  OJapp Card - ALL IN ONE Worker
// -------------------------------------------------------------

import { Hono } from "hono";
import { cors } from "hono/cors";
import { serveStatic } from "hono/cloudflare-pages";

// API Modules
import createUser from "./routes/create_user.js";
import login from "./routes/login.js";
import setUsername from "./routes/set_username.js";
import updateCard from "./routes/update_card.js";
import getCard from "./routes/get_card.js";
import verifyEmail from "./routes/verify_email.js";

// -------------------------------------------------------------
//  Worker App
// -------------------------------------------------------------
const app = new Hono();

// CORS
app.use("/card/api/*", cors({
  origin: "https://ojapp.app",
  allowMethods: ["GET", "POST", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
}));

// -------------------------------------------------------------
// API Routes
// -------------------------------------------------------------
app.get("/card/api/hello", (c) => c.text("OK"));
app.post("/card/api/create_user", (c) => createUser(c));
app.post("/card/api/login", (c) => login(c));
app.post("/card/api/set_username", (c) => setUsername(c));
app.post("/card/api/update_card", (c) => updateCard(c));
app.get("/card/api/get_card/:username", (c) => getCard(c));
app.get("/card/api/verify_email", (c) => verifyEmail(c));

// -------------------------------------------------------------
// ★ 追加：メール送信 API（Resend）
// -------------------------------------------------------------
app.post("/card/api/send_test_email", async (c) => {
  const { email } = await c.req.json();

  const result = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${c.env.RESEND_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: "OJapp <noreply@ojapp.app>",
      to: email,
      subject: "メール認証",
      html: "<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color:#222; line-height:1.6; padding:24px;">
  <h2 style="margin-bottom:16px;">OJapp Card - メール認証</h2>

  <p>OJapp Card へようこそ！</p>

  <p>アカウントを有効化するには、下のボタンをクリックしてください。</p>

  <a href="{{verify_url}}" 
     style="display:inline-block; margin-top:24px; padding:12px 20px; background:#4B8BFF; color:#fff; text-decoration:none; border-radius:6px;">
    メールアドレスを認証する
  </a>

  <p style="margin-top:24px; font-size:13px; color:#555;">
    ※ このリンクは 30 分間 有効です。<br>
    ※ ご本人に覚えがない場合は、このメールは無視してください。
  </p>

  <hr style="margin:32px 0; border:none; border-top:1px solid #ddd;">

  <p style="font-size:12px; color:#888;">
    OJapp Card<br>
    <a href="https://ojapp.app" style="color:#888;">https://ojapp.app</a>
  </p>
</div>
"
    })
  });

  const data = await result.json();
  return c.json({ ok: true, data });
});

// -------------------------------------------------------------
// 静的ファイル配信
// -------------------------------------------------------------
app.get("/card/view/*", serveStatic({ root: "" }));
app.get("/card/view", serveStatic({ root: "", path: "index.html" }));
app.get("/card/view/", serveStatic({ root: "", path: "index.html" }));

// -------------------------------------------------------------
// @ リダイレクト
// -------------------------------------------------------------
app.get("/card/:atusername", (c) => {
  const username = c.req.param("atusername").replace(/^@/, "");
  return c.redirect(`https://ojapp.app/card/view/?u=${username}`, 302);
});

// -------------------------------------------------------------
// 404
// -------------------------------------------------------------
app.all("/card/*", (c) => c.text("Not Found", 404));

// -------------------------------------------------------------
// Cloudflare Worker のエントリポイント
// -------------------------------------------------------------
export default app;
