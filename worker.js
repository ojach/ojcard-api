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
