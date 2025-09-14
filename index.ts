/// <reference path="./types/express.d.ts" />

import app from "./app";

import connectDB from "./lib/database";

connectDB();

app.listen(process.env.PORT, () => {
  console.log(`Server is Up and running on PORT:${process.env.PORT}`);
});
