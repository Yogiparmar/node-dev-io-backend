import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { Response } from "express";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { AppHelper, EmailHelper } from "../../../../helper";
import { UserModel } from "../../../../model/user";

dotenv.config();

interface Decoded {
  user_id: string;
  iat: number;
  exp: number;
}

export class AuthService {
  public async signup(data: any) {
    const { first_name, last_name, email_address, password } = data;

    if (!first_name || !last_name || !email_address || !password) {
      throw new Error("Please provide all required fields.");
    }

    const existingUser = await UserModel.findOne({ email_address });
    if (existingUser) throw new Error("User already exists with same email.");

    const user_id = uuidv4();
    const hashedPassword = await this.hashPassword(password);

    const newUser = await UserModel.create({
      user_id,
      first_name,
      last_name,
      full_name: AppHelper.optionalGenerator(first_name, last_name),
      email_address,
      password: hashedPassword,
      created_at: new Date(),
      updated_at: new Date(),
    });

    return newUser;
  }

  public async login(data: any) {
    const { email_address, password } = data;

    if (!email_address || !password) {
      throw new Error("Please provide all required fields.");
    }

    const user = await UserModel.findOne({ email_address }).select("+password");
    if (!user) throw new Error("Provided credentials are Invalid.");

    const isValid = await this.comparePassword(password, user.password);
    if (!isValid) throw new Error("Provided credentials are Invalid.");

    return user;
  }

  public async sendForgotPasswordCode(email: string) {
    if (!email) throw new Error("Please provide email address");

    const user = await UserModel.findOne({ email_address: email });
    if (!user) throw new Error("Invalid credentials");

    const emailHelper = new EmailHelper();
    const { code: verificationCode, result } = await emailHelper.sendOTP(
      "verification_Code",
      user.email_address
    );

    if (!result?.id) throw new Error("Failed to send verification code");

    await UserModel.findOneAndUpdate(
      { email_address: email },
      {
        verificationCode,
        verificationCodeExpiredAt: new Date(Date.now() + 3 * 60 * 60 * 1000),
      }
    );

    return true;
  }

  public async sendSignInCode(email: string) {
    if (!email) throw new Error("Please provide email address");

    const user = await UserModel.findOne({ email_address: email });
    if (!user) throw new Error("Invalid credentials");

    const emailHelper = new EmailHelper();
    const { code: signInCode, result } = await emailHelper.sendOTP(
      "sign_in_code",
      user.email_address
    );

    if (!result?.id) throw new Error("Failed to send sign in code");

    await UserModel.findOneAndUpdate(
      { email_address: email },
      {
        signInCode,
        signInCodeExpiredAt: new Date(Date.now() + 3 * 60 * 60 * 1000),
      }
    );

    return true;
  }

  public async verifyForgotPasswordCode(email: string, code: number) {
    const user = await UserModel.findOne({ email_address: email });
    if (!user) throw new Error("Invalid credentials");

    const isValid =
      user.verificationCode === Number(code) &&
      user.verificationCodeExpiredAt &&
      Date.now() < new Date(user.verificationCodeExpiredAt).getTime();

    if (!isValid) throw new Error("Invalid or expired code");

    const emailHelper = new EmailHelper();
    const { token, result } = await emailHelper.sendLink(
      user.user_id,
      user.email_address
    );

    if (!result?.id) throw new Error("Failed to send reset password link");

    await UserModel.findOneAndUpdate(
      { email_address: email },
      {
        resetPasswordToken: token,
        resetPasswordTokenExpiredAt: new Date(Date.now() + 3 * 60 * 60 * 1000),
        verificationCode: null,
        verificationCodeExpiredAt: null,
      }
    );

    return token;
  }

  public async verifySignInCode(email: string, code: number) {
    const user = await UserModel.findOne({ email_address: email });
    if (!user) throw new Error("Invalid credentials");

    const isValid =
      user.signInCode === Number(code) &&
      user.signInCodeExpiredAt &&
      Date.now() < new Date(user.signInCodeExpiredAt).getTime();

    if (!isValid) throw new Error("Invalid or expired code");

    await UserModel.findOneAndUpdate(
      { email_address: email },
      { signInCode: null, signInCodeExpiredAt: null }
    );

    return user;
  }

  public async resetPassword(token: string, newPassword: string) {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as Decoded;

    const hashed = await this.hashPassword(newPassword);

    const updated = await UserModel.findOneAndUpdate(
      { user_id: decoded.user_id },
      {
        resetPasswordToken: null,
        resetPasswordTokenExpiredAt: null,
        password: hashed,
      }
    );

    return updated;
  }

  public async getUser(userId: string) {
    const user = await UserModel.findOne({ user_id: userId });
    if (!user) throw new Error("User not found");
    return user;
  }

  public async logout(res: Response): Promise<void> {
    res.clearCookie("access_token", {
      httpOnly: true,
      sameSite: "strict",
    });
    return;
  }

  private async hashPassword(password: string) {
    return bcrypt.hash(password, 10);
  }

  private async comparePassword(plain: string, hashed: string) {
    return bcrypt.compare(plain, hashed);
  }
}

export default new AuthService();
