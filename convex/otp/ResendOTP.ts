import { Email } from "@convex-dev/auth/providers/Email";
import { alphabet, generateRandomString } from "oslo/crypto";
import { Resend as ResendAPI } from "resend";
import { VerificationCodeEmail } from "./VerificationCodeEmail";
import { AUTH_EMAIL, AUTH_RESEND_KEY } from "@cvx/env";

export const ResendOTP = Email({
  id: "email",
  apiKey: AUTH_RESEND_KEY,
  maxAge: 60 * 20,
  async generateVerificationToken() {
    return generateRandomString(8, alphabet("0-9"));
  },
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
      from: AUTH_EMAIL ?? "Convex SaaS <onboarding@resend.dev>",
      to: [normalizedEmail],
      subject: `Your FaceBloat verification code`,
      react: VerificationCodeEmail({ code: token, expires }),
    });

    if (error) {
      throw new Error(JSON.stringify(error));
    }
  },
});
