import * as Express from "express";
import { StatusCodes } from "http-status-codes";
import createError from "http-errors";
import busboy from "busboy";

import { storage } from "../../config/firebase";
import { GeneralErrorMessage, JourneyErrorMessage } from "../error.factory";
import { logger } from "firebase-functions/v1";
import { randomUUID } from "crypto";
import { createDataPublicUrl } from "../storage.utils";

const maxFileSize = 6291456; //6 MB

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

/** uploads image on bucket and stores public url to the res.locals */
const uploadFormDataImageMiddleware =
  (storageFolderName: string) =>
  (req: Express.Request, res: Express.Response, next: Express.NextFunction) => {
    const { uid } = res.locals;

    const bb = busboy({
      headers: req.headers,
      limits: {
        files: 1, // Allow only one file with max size of 6MB
        fileSize: maxFileSize,
      },
    });

    bb.on("file", async (_, stream, { filename }) => {
      const fileSize = req.headers["content-length"] || 0;
      if (fileSize > maxFileSize) {
        return returnError(req, next, bb, GeneralErrorMessage.UploadSizeLimit);
      }

      const mediaToken = randomUUID();
      const blob = storage.file(`${storageFolderName}/${uid}_${filename}`);
      const writeToBlob = blob.createWriteStream();

      writeToBlob.on("error", () => {
        stream.unpipe(writeToBlob);
      });

      writeToBlob.on("finish", () => {
        blob.setMetadata({
          metadata: {
            firebaseStorageDownloadTokens: mediaToken,
          },
        });
      });

      stream.pipe(writeToBlob);
      res.locals.dataPublicUrl = createDataPublicUrl(blob.name, mediaToken);
    });

    bb.on("close", () => {
      return next();
    });

    bb.on("error", (err: string) => {
      logger.error(err);
      return returnError(req, next, bb, JourneyErrorMessage.ImageUploadFailed);
    });

    bb.on("filesLimit", () =>
      returnError(req, next, bb, GeneralErrorMessage.UploadFilesLimit)
    );

    bb.end(req.body);
  };

export default uploadFormDataImageMiddleware;
