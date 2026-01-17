import { NextFunction, Request, Response } from "express";
import { AppHelper } from "../../helper";

export class RoleMiddleware {
  /**
   * Middleware to check if user has required role(s)
   * @param roles - Single role or array of allowed roles
   */
  static requireRole(roles: string | string[]) {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const user = req.user;

        if (!user) {
          return AppHelper.error(res, 401, "Unauthorized access");
        }

        const userRole = user.user_type;

        if (!userRole) {
          return AppHelper.error(res, 401, "User role not found");
        }

        // Convert roles to array for consistent checking
        const allowedRoles = Array.isArray(roles) ? roles : [roles];

        // Check if user's role is in allowed roles
        if (!allowedRoles.includes(userRole)) {
          return AppHelper.error(
            res,
            403,
            "Insufficient permissions to access this resource",
          );
        }

        // User has required role, proceed
        next();
      } catch (error) {
        console.error("ROLE_CHECK_ERROR:", error);
        return AppHelper.error(res, 500, "Internal server error");
      }
    };
  }
}
