import { Response } from "express";
import jwt from "jsonwebtoken";

class AppHelper {
  public static success(
    res: Response,
    code: number,
    message: string,
    data: any = null,
  ): void {
    res.status(code).json({
      success: true,
      statusCode: code,
      message,
      data,
    });
  }

  public static error(res: Response, code: number, message: string): void {
    res.status(code).json({
      success: false,
      statusCode: code,
      message,
      data: null,
    });
  }

  public static sendToken(
    res: Response,
    code: number,
    message: string,
    user: any,
  ): void {
    const token = this.generateJwt(user?.user_id as any);

    // Set httpOnly, secure cookie
    res.cookie("access_token", token, {
      httpOnly: true, // Cannot be accessed via JavaScript
      secure: process.env.NODE_ENV === "production", // HTTPS only in production
      sameSite: "lax", // CSRF protection
      maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days
      path: "/",
    });

    // Don't send token in response body for security
    res.status(code).json({
      success: true,
      statusCode: code,
      message,
      data: user?._doc || user,
    });
  }

  public static optionalGenerator(firstName: string, lastName: string): string {
    return `${firstName} ${lastName}`;
  }

  private static generateJwt(payload: Record<string, any>): string {
    const tokenSecrete = process.env.JWT_SECRET as any;
    const tokenExpires = process.env.JWT_EXPIRES as any;
    return jwt.sign({ user_id: payload }, tokenSecrete, {
      expiresIn: tokenExpires,
    });
  }
}

export { AppHelper };
