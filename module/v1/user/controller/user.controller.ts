import { Request, Response } from "express";
import { AppHelper } from "../../../../helper";
import { UserService } from "../service/user.service";

const userService = new UserService();

class UserController {
  public updateUserDetails = async (req: Request, res: Response) => {
    const { user_id } = req.user!;
    const updatedUser = await userService.updateUserDetails(
      user_id,
      req.body,
      req.file
    );
    return AppHelper.success(res, 200, "User details updated successfully", {
      user: updatedUser,
    });
  };

  public getUser = async (req: Request, res: Response) => {
    const user = await userService.getUser(req);
    return AppHelper.success(res, 200, "User fetched successfully", { user });
  };

  public changePassword = async (req: Request, res: Response) => {
    const { user_id } = req.user!;
    const { current_password, new_password } = req.body;
    await userService.changePassword(user_id, current_password, new_password);
    return AppHelper.success(res, 200, "Password changed successfully");
  };
}

export const userController = new UserController();
