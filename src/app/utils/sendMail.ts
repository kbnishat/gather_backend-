import nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport/index.js";
import config from "../config/index.js";
import { getResetPasswordTemplate } from "./mailTemplate.js";
export const sendMail = async (
  to: string,
  subject: string,
  name: string,
  url: string,
) => {
  // Create a transporter using configurable SMTP settings.
  const transporter = nodemailer.createTransport({
    host: config.SMTP_HOST,
    port: config.SMTP_PORT,
    secure: !config.DEVELOPMENT_MODE,
    auth: {
      user: config.SMTP_USER,
      pass: config.SMTP_PASS,
    },
  } as SMTPTransport.Options);

  // Define the email options
  const mailOptions = {
    from: config.EMAIL_USER,
    to,
    subject,
    html: getResetPasswordTemplate({
      appName: config.EMAIL_APP_NAME,
      name,
      url,
    }),
  };
  // Send the email
  await transporter.sendMail(mailOptions);
};
