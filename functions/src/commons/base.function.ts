import cors from "cors";
import express from "express";
import createError from "http-errors";
import * as Express from "express";
import helmet from "helmet";
import { StatusCodes } from "http-status-codes";
import { errorConverter, errorHandler } from "./middleware/error.middleware";

import LoggerMiddleware from "./middleware/logger.middleware";
import FunctionConfig from "../config/functions";

export default function createBaseFunction(
  routes: Express.Router,
  tag = ""
): Express.Express {
  const corsHandler = cors({
    origin: FunctionConfig.cors,
  });

  const app = express();

  app.use(corsHandler);
  app.use(helmet());
  app.use(LoggerMiddleware(tag));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  app.use(routes);

  // catch 404 and forward to error handler
  app.use(function (
    req: Express.Request,
    res: Express.Response,
    next: Express.NextFunction
  ) {
    next(createError(StatusCodes.NOT_FOUND));
  });

  // error handler
  app.use(errorConverter);
  app.use(errorHandler);

  return app;
}
