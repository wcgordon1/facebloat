import { Email } from "@convex-dev/auth/providers/Email";
import { Resend as ResendAPI } from "resend";
import { VerificationCodeEmail } from "./VerificationCodeEmail";
import { AUTH_EMAIL, AUTH_RESEND_KEY } from "@cvx/env";

export const ResendOTP = Email({
  id: "resend-otp",
  apiKey: AUTH_RESEND_KEY,
  maxAge: 60 * 15, // 15 minutes
  async sendVerificationRequest({
    identifier: email,
    provider,
    token,
    expires,
  }) {
    const normalizedEmail = email.trim().toLowerCase();
    const isDevEnv =
      (process.env.SITE_URL && process.env.SITE_URL.includes("localhost")) ||
      (process.env.CONVEX_URL &&
        process.env.CONVEX_URL.includes("lovable-kangaroo-594"));
    if (isDevEnv) {
      console.log(
        `[DEV][OTP] Sending verification token`,
        JSON.stringify({ email: normalizedEmail, token, expires: expires.toISOString() }),
      );
    }
    const resend = new ResendAPI(provider.apiKey);
    const { error } = await resend.emails.send({
      // TODO: Update with your app name and email address
      from: AUTH_EMAIL ?? "Facebloat <auth@mail.facebloat.com>",
      to: [normalizedEmail],
      subject: `Your FaceBloat verification code`,
      react: VerificationCodeEmail({ code: token, expires }),
    });

    if (error) {
      throw new Error(JSON.stringify(error));
    }
  },
});
