import { Response } from "express";

class AppHelper {
  public static success(
    res: Response,
    code: number,
    message: string,
    data: any = null
  ): void {
    if (data?.user && data.user.password) {
      data.user.password = undefined;
    }

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
    user: any
  ): void {
    const cookieExpires = Number(process.env.COOKIE_EXPIRES);
    const access_token = user?.generateToken?.();

    if (user && user.password) {
      user.password = undefined;
    }

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      expires: new Date(Date.now() + cookieExpires * 24 * 60 * 60 * 1000),
    };

    res
      .status(code)
      .cookie("access_token", access_token, options as any)
      .json({
        success: true,
        statusCode: code,
        message,
        data: { ...user?._doc, access_token },
      });
  }

  public static optionalGenerator(firstName: string, lastName: string): string {
    return `${firstName} ${lastName}`;
  }
}

export { AppHelper };
