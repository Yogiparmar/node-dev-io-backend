import express from "express";

import {
  changePassword,
  getUser,
  loginUser,
  logoutUser,
  resetPassword,
  sendForgotPasswordCode,
  SignUpUser,
  updateUserDetails,
  verifyForgotPasswordCode,
} from "../../controller/user";

import { authenticateUser } from "../../middleware/auth";
import { upload } from "../../middleware/multer";

const router = express.Router();

router.route("/user/sign-up").post(SignUpUser);
router.route("/user/sign-in").post(loginUser);
router.route("/user/forgot-password").post(sendForgotPasswordCode);
router
  .route("/user/verify-forgot-password-code")
  .post(verifyForgotPasswordCode);
router.route("/user/reset-password").post(resetPassword);
router.route("/user/get-user").get(getUser);
router.route("/user/change-password").post(authenticateUser, changePassword);
router
  .route("/user/update-user")
  .post(
    authenticateUser,
    upload.single("profile_image_file"),
    updateUserDetails
  );
router.route("/user/logout").get(logoutUser);

export default router;
