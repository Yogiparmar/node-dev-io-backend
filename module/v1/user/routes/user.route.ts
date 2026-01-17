import express from "express";
import {
  AsyncHandler,
  AuthMiddleware,
  UploadMiddleware,
} from "../../../../middleware";
import { userController } from "../controller/user.controller";

const router = express.Router();
const wrap = AsyncHandler.wrap;

router.get(
  "/get-user",
  AuthMiddleware.authenticateUser,
  wrap(userController.getUser),
);
router.post(
  "/update-user",
  AuthMiddleware.authenticateUser,
  UploadMiddleware.upload.single("profile_image_file"),
  wrap(userController.updateUserDetails),
);
router.post(
  "/change-password",
  AuthMiddleware.authenticateUser,
  wrap(userController.changePassword),
);

export default router;
