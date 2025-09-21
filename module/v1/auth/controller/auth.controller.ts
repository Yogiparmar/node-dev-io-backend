import { Request, Response } from "express";
import { AppHelper } from "../../../../helper";
import { AuthService } from "../service/auth.service";

const authService = new AuthService();

export class AuthController {
  public signUpUser = async (req: Request, res: Response) => {
    const user = await authService.signup(req.body);
    return AppHelper.sendToken(
      res,
      201,
      "User and organization created successfully",
      user
    );
  };

  public loginUser = async (req: Request, res: Response) => {
    const userData = await authService.login(req.body);
    return AppHelper.sendToken(res, 200, "User login successful", userData);
  };

  public sendForgotPasswordCode = async (req: Request, res: Response) => {
    await authService.sendForgotPasswordCode(req.body.email_address);
    return AppHelper.success(res, 200, "Verification code sent successfully");
  };

  public verifyForgotCode = async (req: Request, res: Response) => {
    const resetLink = await authService.verifyForgotPasswordCode(
      req.body.email_address,
      req.body.verification_code
    );
    return AppHelper.success(res, 200, "Reset password link sent successfully");
  };

  public resetPassword = async (req: Request, res: Response) => {
    const reset_token = String(req.query.reset_token || "");
    await authService.resetPassword(reset_token, req.body.new_password);
    return AppHelper.success(res, 200, "Password updated successfully");
  };

  public sendSignInCode = async (req: Request, res: Response) => {
    await authService.sendSignInCode(req.body.email_address);
    return AppHelper.success(res, 200, "Sign in code sent successfully");
  };

  public verifySignInCode = async (req: Request, res: Response) => {
    const userData = await authService.verifySignInCode(
      req.body.email_address,
      req.body.sign_in_code
    );
    return AppHelper.sendToken(res, 200, "User login successful", userData);
  };

  public logoutUser = async (_: Request, res: Response) => {
    await authService.logout(res);
    return AppHelper.success(res, 200, "User logout successful");
  };
}

export const authController = new AuthController();
