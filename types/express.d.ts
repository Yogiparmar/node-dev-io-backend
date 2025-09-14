import { IUserModel } from "../model/user/interface";

declare global {
  namespace Express {
    interface Request {
      user?: IUserModel;
    }
  }
}
