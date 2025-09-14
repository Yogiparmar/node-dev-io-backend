import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";

import userRoutes from "./routes/user/index";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use("/api/v1", userRoutes);

export default app;
