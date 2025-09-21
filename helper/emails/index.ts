import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { Resend } from "resend";

dotenv.config();

export class EmailHelper {
  private resend: Resend;

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY!);
  }

  private generateOtp(): number {
    return Math.floor(100000 + Math.random() * 900000);
  }

  private generateJwt(payload: Record<string, any>): string {
    const tokenSecrete = process.env.JWT_SECRET as any;
    const tokenExpires = process.env.JWT_EXPIRES as any;
    return jwt.sign({ user_id: payload }, tokenSecrete, {
      expiresIn: tokenExpires,
    });
  }

  public async sendOTP(
    type: "verification_Code" | "sign_in_code",
    email: string
  ): Promise<any> {
    const code = this.generateOtp();
    const result = await this.sendMail(type, email, code, null);
    return { code, result };
  }

  public async sendLink(user_id: string, email: string): Promise<any> {
    const token = this.generateJwt(user_id as any);
    const resetUrl = `http://localhost:3000/reset-password/?reset_token=${token}`;
    const result = await this.sendMail("reset_Link", email, null, resetUrl);
    return { token, result };
  }

  private async sendMail(
    type: "verification_Code" | "reset_Link" | "sign_in_code",
    email: string,
    code: number | null = null,
    resetUrl: string | null = null
  ): Promise<any> {
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

      const { data, error } = await this.resend.emails.send({
        from: "Task Management System <onboarding@resend.dev>",
        to: email,
        subject,
        text,
        html,
      });

      if (error) throw new Error(error.message);

      return data;
    } catch (err) {
      console.error("Failed to send email:", err);
      throw err;
    }
  }
}
