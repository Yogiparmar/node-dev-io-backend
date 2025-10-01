import mongoose, { Schema } from "mongoose";

import { IUserModel } from "./interface";

const UserSchema: Schema = new Schema<IUserModel>(
  {
    avatar: {
      url: { type: String },
      public_id: { type: String },
      format: { type: String },
      asset_id: { type: String },
    },
    user_id: { type: String, required: true, unique: true },
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    full_name: { type: String },
    user_name: { type: String },
    email_address: { type: String, required: true },
    user_bio: { type: String },
    user_preference: {
      type: [String],
      default: [],
    },
    user_type: { type: String },
    password: { type: String, select: false },
    created_by: { type: String },
    updated_by: { type: String },
    verificationCode: Number,
    verificationCodeExpiredAt: Date,
    signInCode: Number,
    signInCodeExpiredAt: Date,
    resetPasswordToken: String,
    resetPasswordTokenExpiredAt: Date,
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    toJSON: {
      transform: (_, ret: any) => {
        delete ret._id;
        delete ret.__v;
        delete ret.password;
        delete ret.verificationCode;
        delete ret.verificationCodeExpiredAt;
        delete ret.signInCode;
        delete ret.signInCodeExpiredAt;
        delete ret.resetPasswordToken;
        delete ret.resetPasswordTokenExpiredAt;
        return ret;
      },
    },
  }
);

export const UserModel =
  mongoose.models.User || mongoose.model<IUserModel>("User", UserSchema);
