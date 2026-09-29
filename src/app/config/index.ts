import dotenv from "dotenv";
import fs from "fs";
import path from "path";

const envCandidates = [
  path.join(process.cwd(), ".env"),
  path.join(process.cwd(), "src", ".env"),
];

const envPath = envCandidates.find((candidate) => fs.existsSync(candidate));

if (envPath) {
  dotenv.config({ path: envPath, quiet: true });
}

// Export the configuration object with the necessary environment variables. The PORT variable defaults to 3000 if not set, and MONGO_URI is required (you can adjust this as needed).
export default {
  PORT: process.env.PORT || 3000,
  MONGO_URI: (process.env.MONGO_URI as string) || "",
  BCRYPT_SALT_ROUNDS: process.env.BCRYPT_SALT_ROUNDS
    ? parseInt(process.env.BCRYPT_SALT_ROUNDS)
    : 10, // Default to 10 if not set
  DEFAULT_USER_PASSWORD:
    (process.env.DEFAULT_USER_PASSWORD as string) || "123456", // Default password if not set,
  DEVELOPMENT_MODE: process.env.NODE_ENV === "development", // Check if the environment is development,its return true if NODE_ENV is set to 'development', otherwise false
  JWT_SECRET: process.env.JWT_SECRET as string,
  JWT_EXPIRES_IN: (process.env.JWT_EXPIRES_IN as string) || "5d",
  JWT_REFRESH_EXPIRES_IN:
    (process.env.JWT_REFRESH_EXPIRES_IN as string) || "7d",
  DOMAIN: process.env.DOMAIN as string,
  FRONTEND_URL: process.env.FRONTEND_URL as string,
  SMTP_HOST: (process.env.SMTP_HOST as string) || "smtp.gmail.com",
  SMTP_PORT: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587,
  SMTP_SECURE: process.env.SMTP_SECURE === "true",
  SMTP_FAMILY: process.env.SMTP_FAMILY
    ? parseInt(process.env.SMTP_FAMILY, 10)
    : 4,
  SMTP_USER: process.env.SMTP_USER as string,
  SMTP_PASS: process.env.SMTP_PASS as string,
  EMAIL_USER: process.env.EMAIL_USER as string,
  EMAIL_APP_NAME: process.env.EMAIL_APP_NAME as string,
  CLOUD_NAME: process.env.CLOUD_NAME as string,
  API_KEY: process.env.API_KEY as string,
  API_SECRET: process.env.API_SECRET as string,
  SUPER_ADMIN_ID: process.env.SUPER_ADMIN_ID as string,
  SUPER_ADMIN_PASSWORD: process.env.SUPER_ADMIN_PASSWORD as string,
  SUPER_ADMIN_EMAIL: process.env.SUPER_ADMIN_EMAIL as string,
};
