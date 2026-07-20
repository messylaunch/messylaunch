// Login email delivery via Resend's plain HTTP API (no SDK dependency).
// Only used when RESEND_API_KEY is set; otherwise auth runs in dev mode.

export async function sendLoginEmail(to: string, link: string) {
  const from = process.env.AUTH_EMAIL_FROM ?? "Messy Launch <onboarding@resend.dev>";
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: "Your Messy Launch login link 🚀",
      html: `
        <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:24px">
          <h2 style="margin:0 0 8px">Ready for liftoff</h2>
          <p style="color:#555;line-height:1.6">Click the button below to log in to Messy Launch.
          This link works once and expires in 15 minutes.</p>
          <a href="${link}" style="display:inline-block;margin:16px 0;padding:12px 24px;background:#e05500;color:#fff;
             text-decoration:none;border-radius:10px;font-weight:600">Log in to Messy Launch</a>
          <p style="color:#999;font-size:13px">If you didn't request this, you can safely ignore it.</p>
        </div>`,
    }),
  });
  if (!res.ok) throw new Error(`Resend failed: ${res.status} ${await res.text()}`);
}
