import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";

import routeV1 from "./api/v1";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use("/api/v1", routeV1);

export default app;
