import { Document } from "mongoose";

interface IAvatar {
  ur: string;
  public_id: string;
  format: string;
  asset_id: string;
}

export interface IUserModel extends Document {
  avatar?: IAvatar;
  user_id: string;
  first_name: string;
  last_name: string;
  full_name?: string;
  user_name?: string;
  email_address: string;
  user_type?: string;
  user_preference?: string[];
  password: string;
  user_bio?: string;
  created_by?: string;
  updated_by?: string;
  verificationCode?: number;
  verificationCodeExpiredAt?: Date;
  signInCode?: number;
  signInCodeExpiredAt?: Date;
  resetPasswordToken?: string;
  resetPasswordTokenExpiredAt?: Date;
  created_at: Date;
  updated_at: Date;
}
