import nodemailer from 'nodemailer';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'diosoft.mobile@gmail.com';

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
      from: `"ChefCost" <${process.env.SMTP_USER}>`,
      to: ADMIN_EMAIL,
      subject: `New chef registered: ${name}`,
      html: `
        <h2>New ChefCost Registration</h2>
        <p>A new chef account was created:</p>
        <ul>
          <li><strong>Name:</strong> ${name}</li>
          <li><strong>Email:</strong> ${email}</li>
          <li><strong>Time:</strong> ${new Date().toISOString()}</li>
        </ul>
        <p><a href="https://chefcost.up.railway.app">Open ChefCost Admin Panel</a></p>
      `,
    });
    console.log(`[mailer] notification sent for ${email}`);
  } catch (err) {
    console.error('[mailer] failed to send email:', err.message);
  }
}
