import { Response } from "express";

import dotenv from "dotenv";

dotenv.config();

const optionalGenerator = (firstName: string, lastName: string) => {
  return `${firstName} ${lastName}`;
};

const sendToken = (code: number, message: string, res: Response, data: any) => {
  const cookieExpires = process.env.COOKIE_EXPIRES as any;
  const access_token = data?.generateToken();

  const options: any = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    expires: new Date(Date.now() + cookieExpires * 24 * 60 * 60 * 1000),
  };

  if (data && data?.password) data.password = undefined;

  res
    .status(code)
    .cookie("access_token", access_token, options)
    .json({
      success: true,
      message,
      values: { ...data?._doc, access_token },
    });
};

export { optionalGenerator, sendToken };
