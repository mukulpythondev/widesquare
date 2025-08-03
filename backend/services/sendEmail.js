// utils/sendEmail.js
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({ to, subject, html }) {
  return resend.emails.send({
    from: 'Widesquare <noreply@widesquare.in>', // or your preferred sender
    to,
    subject,
    html,
  });
}
