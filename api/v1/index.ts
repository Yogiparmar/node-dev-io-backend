import { Router } from "express";

import authRoute from "../../module/v1/auth/routes/auth.route";
import userRoute from "../../module/v1/user/routes/user.route";

const router = Router();

router.use("/auth", authRoute);
router.use("/user", userRoute);

export default router;
