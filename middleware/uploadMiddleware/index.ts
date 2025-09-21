import multer from "multer";

export class UploadMiddleware {
  private static storage = multer.diskStorage({
    destination: function (
      req: Express.Request,
      file: Express.Multer.File,
      cb: (error: Error | null, destination: string) => void
    ) {
      cb(null, "uploads/");
    },
    filename: function (
      req: Express.Request,
      file: Express.Multer.File,
      cb: (error: Error | null, filename: string) => void
    ) {
      const uniqueSuffix = Date.now() + "-" + file.originalname;
      cb(null, uniqueSuffix);
    },
  });

  public static upload = multer({ storage: UploadMiddleware.storage });
}
