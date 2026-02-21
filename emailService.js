import sgMail from "@sendgrid/mail";

// Set the SendGrid API key from environment variables.
// The dotenv.config() in your server.js makes this available.
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
} else {
  console.warn("SENDGRID_API_KEY not found in .env file. Email sending will be disabled.");
}

/**
 * Sends an email using SendGrid.
 * @param {object} options - The email options.
 * @param {string} options.to - The recipient's email address.
 * @param {string} options.subject - The subject of the email.
 * @param {string} options.text - The plain text body of the email.
 * @param {string} options.html - The HTML body of the email.
 */
export async function sendEmail({ to, subject, text, html }) {
  const msg = {
    to,
    from: process.env.EMAIL_FROM, // Use the configured "from" email from .env
    subject,
    text,
    html,
  };

  await sgMail.send(msg);
}