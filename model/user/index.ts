import mongoose, { Schema } from "mongoose";

import bcrypt from "bcrypt";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

import { IUserModel } from "./interface";

dotenv.config();

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
    resetPasswordToken: String,
    resetPasswordTokenExpiredAt: Date,
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

UserSchema.methods.generateToken = function () {
  const tokenSecrete = process.env.JWT_SECRET as any;
  const tokenExpires = process.env.JWT_EXPIRES as any;

  return jwt.sign({ user_id: this.user_id }, tokenSecrete, {
    expiresIn: tokenExpires,
  });
};

UserSchema.methods.comparePassword = async function (incomingPassword: string) {
  return await bcrypt.compare(incomingPassword, this.password);
};

export const UserModel =
  mongoose.models.User || mongoose.model<IUserModel>("User", UserSchema);
