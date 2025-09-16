import dotenv from "dotenv";
import { Resend } from "resend";

dotenv.config();

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

const sendForgotPasswordMail = async (
  type: "verification_Code" | "reset_Link" | "sign_in_code",
  email: string,
  code: number | null,
  resetUrl: string | null
) => {
  try {
    const subject =
      type === "verification_Code"
        ? "Your Verification Code"
        : type === "sign_in_code"
        ? "Your Sign In Code"
        : "Reset Password Link";

    const text =
      type === "verification_Code"
        ? `Your verification code is: ${code}`
        : type === "sign_in_code"
        ? `Your sign in code is: ${code}`
        : `Reset your password here: ${resetUrl}`;

    const html =
      type === "verification_Code"
        ? `<p>Your verification code is: <strong>${code}</strong></p>`
        : type === "sign_in_code"
        ? `<p>Your sign in code is: <strong>${code}</strong></p>`
        : `<p>Click the link to reset your password: <a href="${resetUrl}">${resetUrl}</a></p>`;

    const { data, error } = await resend.emails.send({
      from: "Task Management System <onboarding@resend.dev>",
      to: email,
      subject,
      text,
      html,
    });

    if (error) {
      console.error("Error sending email:", error);
      throw new Error(error.message);
    }

    return data;
  } catch (err) {
    console.error("Failed to send email:", err);
    throw err;
  }
};

export { sendForgotPasswordMail };
