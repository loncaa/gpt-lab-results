import * as Express from "express";
import { StatusCodes } from "http-status-codes";
import createError from "http-errors";
import busboy from "busboy";
import { logger } from "../logger.dev";

const returnError = (
  req: Express.Request,
  next: Express.NextFunction,
  bb: busboy.Busboy,
  errorMessage: string
): void => {
  req.unpipe(bb);
  bb.removeAllListeners();

  return next(createError(StatusCodes.BAD_REQUEST, errorMessage));
};

function fileMiddleware(
  req: Express.Request,
  res: Express.Response,
  next: Express.NextFunction
) {
  if (req.method !== "POST") {
    return next(createError(StatusCodes.BAD_REQUEST));
  }

  const bb = busboy({
    headers: req.headers,
  });

  bb.on("file", async (_, stream) => {
    const fileSize = req.headers["content-length"] || 0;

    const chunks: any[] = [];
    stream.on("data", (chunk) => {
      chunks.push(Buffer.from(chunk));
    });

    stream.on("end", function () {
      res.locals["file"] = Buffer.concat(chunks);
      res.locals["fileSize"] = fileSize;
    });

    stream.on("error", (err) => {
      logger.error(err);
      return returnError(req, next, bb, "Failed to upload file");
    });
  });

  bb.on("close", () => {
    return next();
  });

  bb.on("error", (err: string) => {
    logger.error(err);
    return returnError(req, next, bb, "Failed to upload file");
  });

  bb.on("filesLimit", () =>
    returnError(req, next, bb, "Upload limit reached.")
  );

  bb.end(req.body);
}

export default fileMiddleware;
