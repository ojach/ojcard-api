export default async function sendTestEmail(c) {
  try {
    const body = await c.req.json();
    const email = body.email;

    if (!email) {
      return c.json({ error: "email required" }, 400);
    }

    // Email Workers API を叩く
    const response = await c.env.SEND_EMAIL.fetch("https://api.mailchannels.net/tx/v1/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email }],
            from: { email: "noreply@ojapp.app", name: "OJapp" },
            subject: "Test Email from OJapp",
          },
        ],
        content: [
          {
            type: "text/plain",
            value: "This is a test email from OJapp Card!",
          },
        ],
      }),
    });

    return c.json({ status: "sent" });
  } catch (err) {
    return c.json({ error: err.message }, 500);
  }
}

