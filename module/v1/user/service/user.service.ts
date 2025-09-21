import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import { Request } from "express";
import fs from "fs";
import jwt from "jsonwebtoken";
import { UserModel } from "../../../../model/user";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRETE,
});

interface CloudinaryUploadResult {
  public_id: string;
  [key: string]: unknown | any;
}

interface MediaData {
  url: string | null | any;
  format: string;
  asset_id: string;
  public_id: string;
}

export class UserService {
  public async updateUserDetails(
    userId: string,
    data: any,
    file?: Express.Multer.File
  ) {
    const user = await UserModel.findOne({ user_id: userId });
    if (!user) throw new Error("User not found");

    let imagData: MediaData | null = null;

    if (file) {
      const result = await this.uploadToCloudinary(file.path);
      imagData = {
        url: result.url,
        format: result.format,
        public_id: result.public_id,
        asset_id: result.asset_id,
      };
      fs.unlink(file.path, () => {});
      if (user.avatar?.public_id) {
        await cloudinary.uploader.destroy(user.avatar.public_id);
      }
    }

    const updatedUser = await UserModel.findOneAndUpdate(
      { user_id: userId },
      {
        avatar: imagData || {},
        ...data,
      },
      { new: true }
    );

    return updatedUser;
  }

  public async getUser(req: Request) {
    const { access_token } = req.cookies;

    if (!access_token) throw new Error("Unauthorize access.");

    const decoded = await this.verifyToken(access_token);
    if (!decoded?.user_id) throw new Error("Unauthorize access.");

    const user = await UserModel.findOne({ user_id: decoded?.user_id });
    if (!user) throw new Error("User not found");
    return user;
  }

  private async uploadToCloudinary(
    filePath: string
  ): Promise<CloudinaryUploadResult> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "node-tms-userAvatars", resource_type: "auto" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result as CloudinaryUploadResult);
        }
      );
      fs.createReadStream(filePath).pipe(uploadStream);
    });
  }

  public async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ) {
    const user = await UserModel.findOne({ user_id: userId }).select(
      "+password"
    );
    if (!user) throw new Error("User not found");

    const isValid = await this.comparePassword(currentPassword, user.password);
    if (!isValid) throw new Error("Invalid current password");

    const hashed = await this.hashPassword(newPassword);
    return UserModel.findOneAndUpdate(
      { user_id: userId },
      { password: hashed }
    );
  }

  private async verifyToken(access_token: string) {
    const tokenSecrete = process.env.JWT_SECRET! as string;
    const decoded = jwt.verify(access_token, tokenSecrete) as {
      user_id: string;
    };
    return decoded;
  }

  private async hashPassword(password: string) {
    return bcrypt.hash(password, 10);
  }

  private async comparePassword(plain: string, hashed: string) {
    return bcrypt.compare(plain, hashed);
  }
}

export default new UserService();
