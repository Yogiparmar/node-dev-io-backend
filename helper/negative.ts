import { Response } from "express";

const negativeHandler = (code: number, message: string, res: Response) => {
  res.status(code).json({
    success: false,
    message: message,
  });
};

export { negativeHandler };
