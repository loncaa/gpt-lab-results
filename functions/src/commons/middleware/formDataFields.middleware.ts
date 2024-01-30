import * as Express from "express";
import { StatusCodes } from "http-status-codes";
import createError from "http-errors";
import busboy from "busboy";
import { GeneralErrorMessage, JourneyErrorMessage } from "../error.factory";
import { logger } from "firebase-functions/v1";
import * as Joi from "joi";

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

/** Extracts form fields into req.locals and validates it if schema is present */
const formDataFieldsMiddleware =
  (schemaObject?: Joi.Schema) =>
  (req: Express.Request, res: Express.Response, next: Express.NextFunction) => {
    const bb = busboy({
      headers: req.headers,
    });

    bb.on("field", (fieldname, val) => {
      res.locals[fieldname] = val;
    });

    bb.on("close", () => {
      if (schemaObject) {
        const { error } = Joi.compile(schemaObject).validate(res.locals, {
          allowUnknown: true,
        });
        if (error) {
          return next(returnError(req, next, bb, error.message));
        }
      }

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

export default formDataFieldsMiddleware;
