import { NextFunction, Request, Response } from "express";

export class AsyncHandler {
  static wrap(
    fn: (req: Request, res: Response, next?: NextFunction) => Promise<any>
  ) {
    return (req: Request, res: Response, next?: NextFunction) => {
      fn(req, res, next).catch((err) => {
        console.error("CONTROLLER_ERROR :- ", err);
        res
          .status(500)
          .json({ message: err.message || "Something went wrong." });
      });
    };
  }
}
