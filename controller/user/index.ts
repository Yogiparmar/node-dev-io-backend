import { Request, Response } from "express";

import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import fs from "fs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

import { UserModel } from "../../model/user";

import { negativeHandler } from "../../helper/negative";
import { positiveHandler } from "../../helper/positive";
import { sendForgotPasswordMail } from "../../helper/sendEmail";
import { optionalGenerator, sendToken } from "../../helper/sendToken";

import { SendResponse } from "../../helper/sendResponse";
import { IUserModel } from "../../model/user/interface";

interface decoded {
  user_id: string;
  iat: number;
  exp: number;
}

interface CloudinaryUploadResult {
  public_id: string;
  [key: string]: unknown | any;
}

interface mediaData {
  url: string | null | any;
  format: string;
  asset_id: string;
  public_id: string;
}

dotenv.config();

const cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
const api_key = process.env.CLOUDINARY_API_KEY;
const api_secret = process.env.CLOUDINARY_API_SECRETE;

cloudinary.config({
  cloud_name: cloud_name,
  api_key: api_key,
  api_secret: api_secret,
});

const SignUpUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { first_name, last_name, email_address, password } = req.body;

    if (!first_name || !last_name || !email_address || !password)
      return negativeHandler(400, "Please provide all required fields.", res);

    const existingUser = await UserModel.findOne({ email_address });
    if (existingUser)
      return negativeHandler(400, "User already exists with same email.", res);

    const user_id = uuidv4();
    const hashedPassword = await bcrypt.hash(password, 10);
    const now = new Date();

    const newUser = await UserModel.create({
      user_id,
      first_name,
      last_name,
      full_name: optionalGenerator(first_name, last_name),
      email_address,
      password: hashedPassword,
      created_at: now,
      updated_at: now,
    });

    await newUser.save();

    sendToken(201, "User and organization created successfully", res, newUser);
  } catch (error: any) {
    console.log("SIGN_UP_FAIL_ERROR :- ", error);
    return negativeHandler(500, "Something went wrong.", res);
  }
};

const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email_address, password } = req.body;

    if (!email_address || !password)
      return negativeHandler(400, "Please provide all required fields.", res);

    const user = await UserModel.findOne({ email_address }).select("+password");

    if (!user)
      return negativeHandler(403, "Provided credentials are Invalid.", res);

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid)
      return negativeHandler(403, "Provided credentials are Invalid.", res);

    sendToken(201, "User login successful", res, user);
  } catch (error: any) {
    console.log("SIGN_IN_FAIL_ERROR :- ", error);
    return negativeHandler(500, "Something went wrong.", res);
  }
};

const sendForgotPasswordCode = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email_address } = req.body;

    if (!email_address)
      return negativeHandler(400, "Please provide all required fields.", res);

    const user = await UserModel.findOne({ email_address });
    if (!user)
      return negativeHandler(403, "Provided credentials are Invalid.", res);

    const verificationCode = Math.floor(100000 + Math.random() * 900000);

    const result = await sendForgotPasswordMail(
      "verification_Code",
      user?.email_address,
      verificationCode,
      null
    );

    debugger;

    if (result?.id) {
      await UserModel.findOneAndUpdate(
        { email_address },
        {
          verificationCode,
          verificationCodeExpiredAt: new Date(Date.now() + 3 * 60 * 60 * 1000),
        }
      );
      return positiveHandler(200, "Verification code Sended Successfully", res);
    } else {
      return negativeHandler(500, "Something went wrong.", res);
    }
  } catch (error: any) {
    console.log("FORGOT_PASSWORD_FAIL_ERROR :- ", error);
    return negativeHandler(500, "Something went wrong.", res);
  }
};

const verifyForgotPasswordCode = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email_address, verification_code } = await req.body;

    if (!email_address || !verification_code)
      return negativeHandler(400, "Please provide all required fields.", res);

    const user = await UserModel.findOne({ email_address });

    if (!user)
      return negativeHandler(403, "Provided credentials are Invalid.", res);

    const isCodeValid =
      user.verificationCode === Number(verification_code) &&
      user.verificationCodeExpiredAt &&
      Date.now() < new Date(user.verificationCodeExpiredAt).getTime();

    if (!isCodeValid)
      return negativeHandler(402, "Provided code are invalid or expired.", res);

    const tokenSecrete = process.env.JWT_SECRET as any;
    const tokenExpires = process.env.JWT_EXPIRES as any;

    const resetToken = jwt.sign({ user_id: user?.user_id }, tokenSecrete, {
      expiresIn: tokenExpires,
    });
    const resetTokenExpiry = new Date(Date.now() + 3 * 60 * 60 * 1000);
    const resetUrl = `http://localhost:3000/reset-password/?reset_token=${resetToken}`;

    await UserModel.findOneAndUpdate(
      { email_address },
      {
        resetPasswordToken: resetToken,
        resetPasswordTokenExpiredAt: resetTokenExpiry,
        verificationCode: null,
        verificationCodeExpiredAt: null,
      }
    );

    const result = await sendForgotPasswordMail(
      "reset_Link",
      user?.email_address,
      null,
      resetUrl
    );

    debugger;

    if (result?.id)
      return positiveHandler(
        200,
        "Reset password link sended successfully",
        res
      );
    else return negativeHandler(500, "Something went wrong.", res);
  } catch (error: any) {
    console.log("FORGOT_CODE_VERIFICATION_FAIL_ERROR :- ", error);
    return negativeHandler(500, "Something went wrong.", res);
  }
};

const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { new_password } = req.body;
    const reset_token = String(req.query.reset_token || "");

    if (!new_password || !reset_token)
      return negativeHandler(500, "Something went wrong.", res);

    const tokenSecrete = process.env.JWT_SECRET as any;
    const decoded = jwt.verify(reset_token, tokenSecrete) as decoded;
    const hashedPassword = await bcrypt.hash(new_password, 10);

    if (decoded?.user_id) {
      await UserModel.findOneAndUpdate(
        { user_id: decoded?.user_id },
        {
          resetPasswordToken: null,
          resetPasswordTokenExpiredAt: null,
          password: hashedPassword,
        }
      );

      return positiveHandler(200, "Password updated successfully.", res);
    } else {
      return negativeHandler(500, "Something went wrong check.", res);
    }
  } catch (error: any) {
    console.log("RESET_PASSWORD_FAIL_ERROR :- ", error);
    return negativeHandler(500, "Something went wrong.", res);
  }
};

const changePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { current_password, new_password } = req.body;
    const { user_id } = req.user as IUserModel;

    if (!current_password || !new_password)
      return negativeHandler(400, "Please provide all required fields.", res);

    const user = await UserModel.findOne({ user_id }).select("+password");

    if (!user)
      return negativeHandler(403, "Provided credentials are Invalid.", res);

    const isPasswordValid = await user.comparePassword(current_password);

    if (!isPasswordValid)
      return negativeHandler(403, "Provided credentials are Invalid.", res);

    const hashedPassword = await bcrypt.hash(new_password, 10);

    const updatedUser = await UserModel.findOneAndUpdate(
      { user_id },
      {
        password: hashedPassword,
      }
    );

    return SendResponse(res, 200, "Password changed successfully", {
      user: updatedUser,
    });
  } catch (error: any) {
    console.log("UPDATE_PASSWORD_FAIL_ERROR :- ", error);
    return negativeHandler(500, "Something went wrong.", res);
  }
};

const updateUserDetails = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { first_name, last_name, user_name, email_address } = req.body;
    const { user_id } = req.user as IUserModel;

    const user = await UserModel.findOne({ user_id });

    if (!user)
      return negativeHandler(403, "Provided credentials are Invalid.", res);

    const profileImageFile = req.file;
    const imagData: mediaData = {
      url: "",
      format: "",
      asset_id: "",
      public_id: "",
    };

    if (profileImageFile) {
      const result = await new Promise<CloudinaryUploadResult>(
        (resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: "node-tms-userAvatars",
              resource_type: "auto",
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result as CloudinaryUploadResult);
            }
          );

          const stream = fs.createReadStream(profileImageFile.path);
          stream.pipe(uploadStream);
        }
      );

      imagData.url = result?.url;
      imagData.format = result?.format;
      imagData.public_id = result?.public_id;
      imagData.asset_id = result?.asset_id;

      fs.unlink(profileImageFile.path, (error: any) => {
        if (error)
          console.error(
            "FAILED_TO_DELETE_UPLOADED_IMAGE_FROM_LOCAL :- ",
            error
          );
        else console.log("FILE REMOVAL SUCCESSFUL");
      });

      if (user.avatar?.public_id) {
        await cloudinary.uploader.destroy(user.avatar.public_id);
      }
    }

    const updatedUser = await UserModel.findOneAndUpdate(
      {
        user_id,
      },
      {
        avatar: profileImageFile
          ? imagData
          : {
              url: "",
              format: "",
              public_id: "",
              asset_id: "",
            },
        first_name,
        last_name,
        user_name,
        email_address,
      },
      { new: true }
    );

    return SendResponse(res, 200, "User details updated successfully", {
      user: updatedUser,
    });
  } catch (error) {
    console.log("UPDATE_USER_DETAILS_FAIL_ERROR :- ", error);
    return negativeHandler(500, "Something went wrong.", res);
  }
};

const logoutUser = async (req: Request, res: Response): Promise<void> => {
  try {
    res.clearCookie("access_token", {
      httpOnly: true,
      sameSite: "strict",
    });

    return positiveHandler(200, "User logout successful", res);
  } catch (error: any) {
    console.log("LOGOUT_FAIL_ERROR :- ", error);
    return negativeHandler(500, "Something went wrong.", res);
  }
};

const getUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { access_token } = req.cookies;

    if (!access_token) {
      return negativeHandler(500, "Something went wrong.", res);
    }

    const tokenSecrete = process.env.JWT_SECRET as string;
    const decoded = jwt.verify(access_token, tokenSecrete) as {
      user_id: string;
    };

    const user = await UserModel.findOne({ user_id: decoded.user_id });
    if (!user) return negativeHandler(401, "User not found.", res);

    return SendResponse(res, 200, "User fetched successfully", {
      user: user,
    });
  } catch (error: any) {
    console.log("GET_USER_FAIL_ERROR :- ", error);
    return negativeHandler(500, "Something went wrong.", res);
  }
};

export {
  changePassword,
  getUser,
  loginUser,
  logoutUser,
  resetPassword,
  sendForgotPasswordCode,
  SignUpUser,
  updateUserDetails,
  verifyForgotPasswordCode,
};
