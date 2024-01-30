import * as Express from "express";
import * as Joi from "joi";
import createError from "http-errors";
import { StatusCodes } from "http-status-codes";

function createErrorMessage(validations: Joi.ValidationResult[]) {
  return validations
    .map((val: Joi.ValidationResult) =>
      val.error
        ? val.error.details.map((error) => error.message).join(", ")
        : ""
    )
    .join(", ");
}

/**
 *
 * @param schemaObject object with a fields that representing http request - body, header
 * @returns
 */
export const validateRequest =
  (schemaObject: Record<string, Joi.Schema>) =>
  (req: Express.Request, res: Express.Response, next: Express.NextFunction) => {
    const validationSchemaKeys = Object.keys(schemaObject);
    const validations = validationSchemaKeys.map((key: string) => {
      const schema = schemaObject[key];

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const reqObject = req[key] || {};

      const prefsConfig: Joi.ValidationOptions = { errors: { label: "key" } };
      if (key === "headers") {
        prefsConfig.allowUnknown = true;
      }

      return Joi.compile(schema).prefs(prefsConfig).validate(reqObject);
    });

    const hasError = validations.some((v) => v.error);
    if (hasError) {
      const errorMessage = createErrorMessage(validations);
      return next(createError(StatusCodes.BAD_REQUEST, errorMessage));
    }

    return next();
  };

/**
 * Validate only a requests body payload
 * @param schema body payload required schema
 * @returns
 */
export const validateRequestPayload =
  (schema: Joi.Schema) =>
  (req: Express.Request, res: Express.Response, next: Express.NextFunction) => {
    const reqObject = req.body;

    const prefsConfig: Joi.ValidationOptions = { errors: { label: "key" } };
    const validationResponse = Joi.compile(schema)
      .prefs(prefsConfig)
      .validate(reqObject);

    if (validationResponse.error) {
      const errorMessage = createErrorMessage([validationResponse]);
      return next(createError(StatusCodes.BAD_REQUEST, errorMessage));
    }

    return next();
  };

//TODO finish it
export const validateRequestParameters =
  (schema: Joi.Schema) =>
  (req: Express.Request, res: Express.Response, next: Express.NextFunction) => {
    const paramsObject = req.params;

    const prefsConfig: Joi.ValidationOptions = { errors: { label: "key" } };
    const validationResponse = Joi.compile(schema)
      .prefs(prefsConfig)
      .validate(paramsObject);

    if (validationResponse.error) {
      const errorMessage = createErrorMessage([validationResponse]);
      return next(createError(StatusCodes.BAD_REQUEST, errorMessage));
    }

    return next();
  };
