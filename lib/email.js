// Email service using Resend (resend.com - free 3000 emails/month)
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM = "Truuk <noreply@truuk.in>";

async function sendEmail({ to, subject, html }) {
  if (!RESEND_API_KEY) {
    console.log("Email (no API key):", { to, subject });
    return { success: true };
  }
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: FROM, to, subject, html }),
    });
    const d = await r.json();
    return { success: r.ok, data: d };
  } catch (err) {
    console.error("Email error:", err);
    return { success: false };
  }
}

const emailBase = (content) => `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#06080f;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <div style="background:#0c1120;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.06);">
      <div style="background:#f97316;padding:24px 32px;display:flex;align-items:center;gap:12px;">
        <div style="width:36px;height:36px;background:rgba(255,255,255,0.2);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:800;color:#fff;">T</div>
        <span style="font-size:20px;font-weight:700;color:#fff;">Truuk</span>
      </div>
      <div style="padding:32px;">${content}</div>
      <div style="padding:20px 32px;border-top:1px solid rgba(255,255,255,0.06);font-size:12px;color:#475569;text-align:center;">
        © 2024 Truuk · Performance Marketing Platform · <a href="https://truuk.prithviads.com" style="color:#f97316;">truuk.prithviads.com</a>
      </div>
    </div>
  </div>
</body>
</html>`;

const h2 = (t) => `<h2 style="font-size:24px;font-weight:700;color:#f1f5f9;margin:0 0 12px;">${t}</h2>`;
const p = (t) => `<p style="font-size:15px;color:#94a3b8;line-height:1.7;margin:0 0 16px;">${t}</p>`;
const btn = (t, url) => `<a href="${url}" style="display:inline-block;background:#f97316;color:#fff;padding:14px 28px;border-radius:10px;font-size:15px;font-weight:600;text-decoration:none;margin:8px 0;">${t}</a>`;
const badge = (t, color="#f97316") => `<span style="background:${color}20;color:${color};padding:4px 12px;border-radius:6px;font-size:12px;font-weight:600;">${t}</span>`;
const divider = () => `<hr style="border:none;border-top:1px solid rgba(255,255,255,0.06);margin:24px 0;">`;

export const emails = {
  // Welcome email after signup
  welcome: async ({ to, name, orgName, plan }) => sendEmail({
    to,
    subject: `Welcome to Truuk, ${name}! 🎉`,
    html: emailBase(`
      ${h2(`Welcome to Truuk, ${name}!`)}
      ${p(`Your account for <strong style="color:#fff;">${orgName}</strong> has been created and is pending review.`)}
      ${p(`We're reviewing your account and will activate it within 24 hours. You'll receive an email as soon as you're approved.`)}
      ${badge("Pending Review", "#f59e0b")}
      ${divider()}
      ${p(`Plan selected: <strong style="color:#fff;">${plan}</strong>`)}
      ${p(`Once approved, you'll have full access to campaign management, publisher tracking, conversion reports and more.`)}
      ${btn("Visit Truuk", "https://truuk.prithviads.com")}
    `)
  }),

  // Account approved
  approved: async ({ to, name, orgName, plan }) => sendEmail({
    to,
    subject: `Your Truuk account is approved! ✅`,
    html: emailBase(`
      ${h2(`You're approved, ${name}!`)}
      ${p(`Great news — your <strong style="color:#fff;">${orgName}</strong> account has been activated.`)}
      ${badge("Active", "#10b981")}
      ${divider()}
      ${p(`You can now log in and start creating campaigns, adding publishers and tracking conversions.`)}
      ${btn("Go to Dashboard →", "https://truuk.prithviads.com/dashboard")}
      ${divider()}
      ${p(`<strong style="color:#fff;">Quick start:</strong><br>1. Create your first campaign<br>2. Add publishers or share the marketplace link<br>3. Send your tracking URL to the advertiser`)}
    `)
  }),

  // Payment successful
  paymentSuccess: async ({ to, name, orgName, plan, amount, invoiceId, expiresAt }) => sendEmail({
    to,
    subject: `Payment confirmed — ${plan} plan active ✅`,
    html: emailBase(`
      ${h2(`Payment Confirmed!`)}
      ${p(`Thank you, ${name}. Your payment for <strong style="color:#fff;">${orgName}</strong> has been received.`)}
      <div style="background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.2);border-radius:12px;padding:20px;margin:16px 0;">
        <div style="font-size:13px;color:#94a3b8;margin-bottom:4px;">Amount Paid</div>
        <div style="font-size:32px;font-weight:700;color:#10b981;">₹${amount}</div>
        <div style="font-size:12px;color:#475569;margin-top:4px;">+ GST · Invoice #${invoiceId}</div>
      </div>
      ${p(`Plan: <strong style="color:#fff;">${plan}</strong> · Active until <strong style="color:#fff;">${new Date(expiresAt).toLocaleDateString("en-IN", { day:"2-digit", month:"long", year:"numeric" })}</strong>`)}
      ${btn("Go to Dashboard →", "https://truuk.prithviads.com/dashboard")}
    `)
  }),

  // Payment failed
  paymentFailed: async ({ to, name, orgName, plan }) => sendEmail({
    to,
    subject: `Action required: Payment failed for Truuk`,
    html: emailBase(`
      ${h2(`Payment Failed`)}
      ${p(`Hi ${name}, we couldn't process your payment for <strong style="color:#fff;">${orgName}</strong>.`)}
      ${badge("Action Required", "#ef4444")}
      ${divider()}
      ${p(`Your account will remain active for 3 more days. Please update your payment method to continue using Truuk.`)}
      ${btn("Update Payment →", "https://truuk.prithviads.com/settings/billing")}
      ${divider()}
      ${p(`If you're facing any issues, reply to this email or contact us at <a href="mailto:hello@truuk.in" style="color:#f97316;">hello@truuk.in</a>`)}
    `)
  }),

  // Renewal reminder (3 days before)
  renewalReminder: async ({ to, name, orgName, plan, expiresAt, amount }) => sendEmail({
    to,
    subject: `Your Truuk subscription renews in 3 days`,
    html: emailBase(`
      ${h2(`Renewal Reminder`)}
      ${p(`Hi ${name}, your <strong style="color:#fff;">${orgName}</strong> subscription renews in <strong style="color:#f97316;">3 days</strong>.`)}
      <div style="background:rgba(249,115,22,0.08);border:1px solid rgba(249,115,22,0.2);border-radius:12px;padding:20px;margin:16px 0;">
        <div style="font-size:13px;color:#94a3b8;">Renewal Date</div>
        <div style="font-size:20px;font-weight:700;color:#fff;">${new Date(expiresAt).toLocaleDateString("en-IN", { day:"2-digit", month:"long", year:"numeric" })}</div>
        <div style="font-size:13px;color:#94a3b8;margin-top:8px;">Amount: <span style="color:#f97316;font-weight:600;">₹${amount} + GST</span></div>
      </div>
      ${p(`Plan: <strong style="color:#fff;">${plan}</strong>`)}
      ${btn("Manage Billing →", "https://truuk.prithviads.com/settings/billing")}
    `)
  }),

  // Account suspended
  suspended: async ({ to, name, orgName, reason }) => sendEmail({
    to,
    subject: `Your Truuk account has been suspended`,
    html: emailBase(`
      ${h2(`Account Suspended`)}
      ${p(`Hi ${name}, your <strong style="color:#fff;">${orgName}</strong> account has been suspended.`)}
      ${reason ? p(`Reason: <strong style="color:#fff;">${reason}</strong>`) : ""}
      ${p(`Your data is safe and will be retained for 30 days. Please contact us to resolve this.`)}
      ${btn("Contact Support →", "mailto:hello@truuk.in")}
    `)
  }),

  // New org signup alert to super admin
  newOrgAlert: async ({ orgName, ownerName, ownerEmail, plan }) => sendEmail({
    to: process.env.SUPER_ADMIN_EMAIL || "admin@truuk.in",
    subject: `New signup: ${orgName} — ${plan} plan`,
    html: emailBase(`
      ${h2(`New Organization Signup`)}
      ${p(`A new organization has signed up for Truuk.`)}
      <div style="background:rgba(249,115,22,0.08);border:1px solid rgba(249,115,22,0.2);border-radius:12px;padding:20px;margin:16px 0;">
        <div style="margin-bottom:8px;"><span style="color:#94a3b8;font-size:13px;">Organization:</span> <strong style="color:#fff;">${orgName}</strong></div>
        <div style="margin-bottom:8px;"><span style="color:#94a3b8;font-size:13px;">Owner:</span> <strong style="color:#fff;">${ownerName}</strong></div>
        <div style="margin-bottom:8px;"><span style="color:#94a3b8;font-size:13px;">Email:</span> <strong style="color:#fff;">${ownerEmail}</strong></div>
        <div><span style="color:#94a3b8;font-size:13px;">Plan:</span> ${badge(plan)}</div>
      </div>
      ${btn("Review in Super Admin →", "https://truuk.prithviads.com/super-admin")}
    `)
  }),
};
