import { Response } from "express";

const SendResponse = async (
  res: Response,
  code: number,
  message: string,
  data: any | null
) => {
  if (data?.user && data?.user?.password) data.user.password = undefined;

  res.status(code).json({
    success: true,
    message,
    data,
  });
};

export { SendResponse };
