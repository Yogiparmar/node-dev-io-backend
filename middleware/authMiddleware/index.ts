import { NextFunction, Request, Response } from "express";

import jwt from "jsonwebtoken";

import { AppHelper } from "../../helper";
import { UserModel } from "../../model/user";
import { IUserModel } from "../../model/user/interface";

const userCache = new Map<string, { user: IUserModel; expires: number }>();

export class AuthMiddleware {
  static async authenticateUser(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { access_token } = req.cookies;
      if (!access_token) {
        return AppHelper.error(res, 401, "Unauthorized access");
      }

      const decoded = jwt.verify(access_token, process.env.JWT_SECRET!) as {
        user_id: string;
      };

      const cached = userCache.get(decoded.user_id);
      if (cached && cached.expires > Date.now()) {
        (req as Request & { user?: IUserModel }).user = cached.user;
        return next();
      }

      const user = await UserModel.findOne({ user_id: decoded.user_id });
      if (!user) return AppHelper.error(res, 401, "User not found");

      userCache.set(decoded.user_id, {
        user,
        expires: Date.now() + 10 * 60 * 1000,
      });

      (req as Request & { user?: IUserModel }).user = user;
      next();
    } catch (error) {
      console.error("AUTHENTICATION_FAIL_ERROR:", error);
      return AppHelper.error(res, 401, "Invalid or expired token");
    }
  }
}
