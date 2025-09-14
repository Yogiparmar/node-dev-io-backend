import { Response } from "express";

const positiveHandler = (code: number, message: string, res: Response) => {
  res.status(code).json({
    success: true,
    message: message,
  });
};

export { positiveHandler };
