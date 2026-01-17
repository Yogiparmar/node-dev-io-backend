import express from "express";
import { AsyncHandler, AuthMiddleware } from "../../../../middleware";
import { authController } from "../controller/auth.controller";

const router = express.Router();
const wrap = AsyncHandler.wrap;

router.post("/sign-up", wrap(authController.signUpUser));
router.post("/sign-in", wrap(authController.loginUser));
router.post("/forgot-password", wrap(authController.sendForgotPasswordCode));
router.post("/sign-in-code", wrap(authController.sendSignInCode));
router.post(
  "/verify-forgot-password-code",
  wrap(authController.verifyForgotCode),
);
router.post("/verify-sign-in-code", wrap(authController.verifySignInCode));
router.post("/reset-password", wrap(authController.resetPassword));
router.get("/logout", wrap(authController.logoutUser));

router.get(
  "/verify",
  AuthMiddleware.authenticateUser,
  wrap(authController.verifyToken),
);

export default router;
