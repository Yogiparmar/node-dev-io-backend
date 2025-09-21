import express from "express";
import { AsyncHandler } from "../../../../middleware";
import { authController } from "../controller/auth.controller";

const router = express.Router();
const wrap = AsyncHandler.wrap;

router.post("/sign-up", wrap(authController.signUpUser.bind(authController)));
router.post("/sign-in", wrap(authController.loginUser.bind(authController)));
router.post(
  "/forgot-password",
  wrap(authController.sendForgotPasswordCode.bind(authController))
);
router.post(
  "/sign-in-code",
  wrap(authController.sendSignInCode.bind(authController))
);
router.post(
  "/verify-forgot-password-code",
  wrap(authController.verifyForgotCode.bind(authController))
);
router.post(
  "/verify-sign-in-code",
  wrap(authController.verifySignInCode.bind(authController))
);
router.post(
  "/reset-password",
  wrap(authController.resetPassword.bind(authController))
);
router.get("/logout", wrap(authController.logoutUser.bind(authController)));

export default router;
