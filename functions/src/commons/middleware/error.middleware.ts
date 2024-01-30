import * as Express from "express";
import createError from "http-errors";
import { StatusCodes } from "http-status-codes";
import { logger } from "../logger.dev";

const { HttpError } = createError;

export const errorConverter = (
  err: Error,
  req: Express.Request,
  res: Express.Response,
  next: Express.NextFunction
) => {
  console.log(err.stack);

  if (!(err instanceof HttpError)) {
    return next(createError(StatusCodes.INTERNAL_SERVER_ERROR, err.message));
  }

  next(err);
};

export const errorHandler = (
  err: createError.HttpError,
  req: Express.Request,
  res: Express.Response,
  next: Express.NextFunction
) => {
  const statusCode = err.status || 200;

  const { body } = req;

  const bodyKeys = Object.keys(body);
  if (bodyKeys.length !== 0 && !(body instanceof Buffer)) {
    logger.info(`${JSON.stringify(body)}`);
  }

  return res
    .status(statusCode)
    .json({ error: true, message: err.message, statusCode });
};
