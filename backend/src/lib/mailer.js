import nodemailer from 'nodemailer';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'diosoft.mobile@gmail.com';
const APP_URL = process.env.APP_URL || 'https://app4chef.com';

function createTransport() {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) return null;
  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
}

export async function notifyNewChef({ name, email }) {
  const transport = createTransport();
  if (!transport) {
    console.log(`[mailer] skipped — no SMTP config. New chef: ${name} <${email}>`);
    return;
  }
  try {
    await transport.sendMail({
      from: `"App4Chef" <${process.env.SMTP_USER}>`,
      to: ADMIN_EMAIL,
      subject: `New chef registered: ${name}`,
      html: `
        <h2>New App4Chef Registration</h2>
        <p>A new chef account was created:</p>
        <ul>
          <li><strong>Name:</strong> ${name}</li>
          <li><strong>Email:</strong> ${email}</li>
          <li><strong>Time:</strong> ${new Date().toISOString()}</li>
        </ul>
        <p><a href="${APP_URL}/admin">Open App4Chef Admin Panel</a></p>
      `,
    });
    console.log(`[mailer] notification sent for ${email}`);
  } catch (err) {
    console.error('[mailer] failed to send email:', err.message);
  }
}

// ── Research-form: admin notification ─────────────────────────────────────────
export async function notifyAdminNewResearchResponse(r) {
  const transport = createTransport();
  if (!transport) {
    console.log(`[mailer] skipped — no SMTP. New research response from ${r.email}`);
    return;
  }
  const safe = (v) => (v ? String(v).replace(/</g, '&lt;') : '<em style="color:#999">—</em>');
  try {
    await transport.sendMail({
      from: `"App4Chef Research" <${process.env.SMTP_USER}>`,
      to: ADMIN_EMAIL,
      subject: `📋 New research response: ${r.name || r.email} (${r.country || '?'})`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:680px;margin:auto;color:#1a1916">
          <h2 style="color:#D4A853">New research response</h2>
          <p><strong>${safe(r.name)}</strong> &lt;${safe(r.email)}&gt; — ${safe(r.country)}, ${safe(r.city)}</p>
          <p style="background:#f5f3ee;padding:10px;border-radius:6px;font-size:14px">
            <strong>Role:</strong> ${safe(r.role)} &nbsp; · &nbsp;
            <strong>Business:</strong> ${safe(r.business_type)} &nbsp; · &nbsp;
            <strong>Team size:</strong> ${safe(r.team_size)}<br>
            <strong>Events/week:</strong> ${safe(r.events_per_week)} &nbsp; · &nbsp;
            <strong>Avg ticket:</strong> ${safe(r.avg_ticket)} &nbsp; · &nbsp;
            <strong>Experience:</strong> ${safe(r.years_experience)}
          </p>

          <h3 style="margin-top:24px;color:#1a1916">How they work today</h3>
          <p><strong>Recipe costing method:</strong><br>${safe(r.recipe_costing_method)}</p>
          <p><strong>Quote building method:</strong><br>${safe(r.quote_building_method)}</p>
          <p><strong>Tools used:</strong> ${safe(r.tools_used)}</p>
          <p><strong>Hours/week on costing:</strong> ${safe(r.hours_per_week)} &nbsp; · &nbsp;
             <strong>Pricing confidence (1–10):</strong> ${safe(r.pricing_confidence)}</p>

          <h3 style="margin-top:24px;color:#B8892E">⭐ The pain (highest-signal answers)</h3>
          <p><strong>Biggest frustration:</strong><br>${safe(r.biggest_frustration)}</p>
          <p><strong>Last mistake:</strong><br>${safe(r.last_mistake)}</p>
          <p><strong>Magic wand:</strong><br>${safe(r.magic_wand)}</p>
          <p><strong>What's stopping them:</strong><br>${safe(r.whats_stopping)}</p>

          <h3 style="margin-top:24px;color:#1a1916">Buying intent</h3>
          <p><strong>Tried software:</strong> ${safe(r.tried_software)}</p>
          <p><strong>Stopped because:</strong> ${safe(r.stopped_reason)}</p>
          <p><strong>Must-have feature for €50/mo:</strong><br>${safe(r.must_have_feature)}</p>
          <p><strong>Monthly budget:</strong> ${safe(r.monthly_budget)} &nbsp; · &nbsp;
             <strong>Decision maker:</strong> ${safe(r.decision_maker)}</p>

          <p style="margin-top:24px;background:#1a1916;color:#D4A853;padding:12px;border-radius:6px">
            Trial code issued: <strong>${safe(r.trial_code)}</strong> &nbsp; · &nbsp;
            Allow follow-up: <strong>${r.allow_followup ? 'YES' : 'no'}</strong> &nbsp; · &nbsp;
            Beta tester: <strong>${safe(r.beta_tester)}</strong>
          </p>

          <p style="margin-top:24px"><a href="${APP_URL}/admin/research" style="background:#D4A853;color:#1a1916;padding:10px 18px;border-radius:6px;text-decoration:none;font-weight:700">View in admin panel →</a></p>
        </div>
      `,
    });
    console.log(`[mailer] admin notified of research response from ${r.email}`);
  } catch (err) {
    console.error('[mailer] research notify failed:', err.message);
  }
}

// ── Research-form: chef thank-you with redemption link ────────────────────────
const THANK_YOU = {
  en: {
    subject: 'Your 6-month free App4Chef access — thank you!',
    title: 'Thank you for sharing your insights',
    body: 'Your feedback is incredibly valuable. As promised, here is your <strong>6-month free access code</strong> to App4Chef:',
    redeemHint: 'Click below to redeem — you will be asked to create an account if you don\'t have one.',
    cta: 'Redeem my 6 months free',
    footer: 'Questions? Just reply to this email. — The App4Chef team',
  },
  fr: {
    subject: 'Vos 6 mois App4Chef gratuits — merci !',
    title: 'Merci pour vos retours',
    body: 'Vos retours sont très précieux. Comme promis, voici votre <strong>code d\'accès gratuit de 6 mois</strong> à App4Chef :',
    redeemHint: 'Cliquez ci-dessous pour l\'activer — il vous sera demandé de créer un compte si vous n\'en avez pas.',
    cta: 'Activer mes 6 mois gratuits',
    footer: 'Une question ? Répondez à cet email. — L\'équipe App4Chef',
  },
  ro: {
    subject: 'Cele 6 luni App4Chef gratuite — mulțumim!',
    title: 'Mulțumim pentru răspunsuri',
    body: 'Răspunsurile dumneavoastră sunt extrem de valoroase. Conform promisiunii, iată <strong>codul de acces gratuit pentru 6 luni</strong> la App4Chef:',
    redeemHint: 'Apăsați butonul de mai jos pentru a-l activa — vi se va cere să creați un cont dacă nu aveți deja unul.',
    cta: 'Activează 6 luni gratuite',
    footer: 'Întrebări? Răspundeți la acest email. — Echipa App4Chef',
  },
  hu: {
    subject: '6 hónap ingyenes App4Chef hozzáférés — köszönjük!',
    title: 'Köszönjük a válaszait',
    body: 'A visszajelzései rendkívül értékesek. Az ígéretünknek megfelelően itt van a <strong>6 hónap ingyenes hozzáférési kódja</strong> az App4Chef-hez:',
    redeemHint: 'Kattintson alább a beváltáshoz — ha még nincs fiókja, létre kell hoznia egyet.',
    cta: '6 hónap ingyenes beváltása',
    footer: 'Kérdés? Válaszoljon erre az emailre. — Az App4Chef csapata',
  },
};

export async function sendChefThankYou({ email, name, language, trial_code }) {
  const transport = createTransport();
  if (!transport) {
    console.log(`[mailer] skipped chef thank-you — no SMTP. ${email} / code ${trial_code}`);
    return;
  }
  const t = THANK_YOU[language] || THANK_YOU.en;
  const redeemUrl = `${APP_URL}/redeem?code=${encodeURIComponent(trial_code)}`;
  try {
    await transport.sendMail({
      from: `"App4Chef" <${process.env.SMTP_USER}>`,
      to: email,
      subject: t.subject,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#1a1916;line-height:1.6">
          <div style="background:#1a1916;padding:24px;text-align:center;border-radius:10px 10px 0 0">
            <h1 style="color:#D4A853;font-size:24px;margin:0">App4Chef</h1>
          </div>
          <div style="background:#fff;padding:32px;border:1px solid #e8e4da;border-top:none;border-radius:0 0 10px 10px">
            <h2 style="color:#1a1916;margin-top:0">${t.title}${name ? `, ${name.split(' ')[0]}` : ''}!</h2>
            <p>${t.body}</p>
            <div style="background:#f5f3ee;border:2px dashed #D4A853;padding:16px;border-radius:8px;text-align:center;margin:24px 0">
              <div style="font-size:11px;color:#6b6860;letter-spacing:1px;text-transform:uppercase;margin-bottom:6px">Code</div>
              <div style="font-family:'Courier New',monospace;font-size:22px;font-weight:700;color:#1a1916;letter-spacing:2px">${trial_code}</div>
            </div>
            <p style="font-size:14px;color:#6b6860">${t.redeemHint}</p>
            <p style="text-align:center;margin:28px 0">
              <a href="${redeemUrl}" style="background:#D4A853;color:#1a1916;font-weight:700;padding:14px 28px;border-radius:8px;text-decoration:none;display:inline-block">${t.cta} →</a>
            </p>
            <p style="font-size:13px;color:#6b6860;margin-top:32px;padding-top:20px;border-top:1px solid #e8e4da">${t.footer}</p>
          </div>
        </div>
      `,
    });
    console.log(`[mailer] thank-you sent to ${email} with code ${trial_code}`);
  } catch (err) {
    console.error('[mailer] chef thank-you failed:', err.message);
  }
}
