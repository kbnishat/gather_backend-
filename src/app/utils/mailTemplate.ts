type ResetPasswordTemplatePayload = {
  appName: string;
  name: string;
  url: string;
};

export const getResetPasswordTemplate = ({
  appName,
  name,
  url,
}: ResetPasswordTemplatePayload) => {
  return `
      <div style="background:#f4f6fb;padding:24px 12px;font-family:Arial,sans-serif;color:#111827;">
        <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
          <div style="background:#111827;padding:20px 24px;">
            <h2 style="margin:0;color:#ffffff;font-size:20px;">${appName}</h2>
          </div>
          <div style="padding:24px;">
            <p style="margin:0 0 14px;font-size:16px;">Hello ${name},</p>
            <p style="margin:0 0 14px;line-height:1.6;">
              We received a request to reset your password. Click the button below to set a new password.
            </p>
            <div style="margin:22px 0;">
              <a href="${url}" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:600;">
                Reset Password
              </a>
            </div>
            <p style="margin:0 0 10px;line-height:1.6;">
              This link expires in <strong>5 minutes</strong>.
            </p>
            <p style="margin:0;line-height:1.6;">
              If you did not request this, you can safely ignore this email.
            </p>
          </div>
          <div style="padding:16px 24px;background:#f9fafb;border-top:1px solid #e5e7eb;font-size:12px;color:#6b7280;">
            Sent by ${appName}
          </div>
        </div>
      </div>
    `;
};
