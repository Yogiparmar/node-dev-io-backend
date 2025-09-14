import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

import { UserModel } from "../model/user";

import { negativeHandler } from "../helper/negative";
import { IUserModel } from "../model/user/interface";

dotenv.config();

const authenticateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { access_token } = req.cookies;

    if (!access_token) {
      return negativeHandler(401, "Unauthorized access.", res);
    }

    const tokenSecrete = process.env.JWT_SECRET as string;
    const decoded = jwt.verify(access_token, tokenSecrete) as {
      user_id: string;
    };

    const user = await UserModel.findOne({ user_id: decoded.user_id });
    if (!user) return negativeHandler(401, "User not found.", res);

    const reqWithUser = req as Request & { user?: IUserModel };
    reqWithUser.user = user;

    next();
  } catch (error) {
    console.error("AUTHENTICATION_FAIL_ERROR:", error);
    return negativeHandler(401, "Invalid or expired token.", res);
  }
};

export { authenticateUser };
