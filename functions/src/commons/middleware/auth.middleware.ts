import { Request, Response, NextFunction } from "express";
import * as admin from "firebase-admin";
import { StatusCodes } from "http-status-codes";
import createError from "http-errors";
import { AuthErrorMessage } from "../error.factory";

type UserRole = "admin";

type ParamRules = {
  [key: string]: {
    [key: string]: Array<UserRole>;
  };
};

export async function isAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { authorization } = req.headers;

  if (!authorization)
    return next(
      createError(StatusCodes.UNAUTHORIZED, AuthErrorMessage.Unauthorized)
    );

  if (!authorization.startsWith("Bearer"))
    return next(
      createError(StatusCodes.UNAUTHORIZED, AuthErrorMessage.Unauthorized)
    );

  const split = authorization.split("Bearer ");
  if (split.length !== 2)
    return next(
      createError(StatusCodes.UNAUTHORIZED, AuthErrorMessage.Unauthorized)
    );

  const token = split[1];

  try {
    const decodedToken: admin.auth.DecodedIdToken = await admin
      .auth()
      .verifyIdToken(token);

    if (!decodedToken || !decodedToken.uid) {
      return next(
        createError(StatusCodes.UNAUTHORIZED, AuthErrorMessage.Unauthorized)
      );
    }

    const user = await admin.auth().getUser(decodedToken.uid);

    res.locals = {
      ...res.locals,
      uid: decodedToken.uid,
      role: user.customClaims?.role,
      email: user.email,
    };
    return next();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error(`${err.code} -  ${err.message}`);
    return next(
      createError(StatusCodes.UNAUTHORIZED, AuthErrorMessage.Unauthorized)
    );
  }
}

function checkIfRoleSatisfiesParamRules(
  role: UserRole,
  params: { [key: string]: string },
  paramRules: ParamRules
) {
  let ruleSatisfied = true;
  const paramKeys = Object.keys(params);

  for (let index = 0; index < paramKeys.length; index++) {
    const paramName = paramKeys[index];
    const selectedParamValue = params[paramName];
    const selectedParamRules = paramRules[paramName] || {};

    const allowedRoles = selectedParamRules[selectedParamValue];
    if (
      allowedRoles &&
      allowedRoles.length > 0 &&
      !allowedRoles.includes(role)
    ) {
      ruleSatisfied = false;
      continue;
    }

    const allParamsAllowedRoles = selectedParamRules["*"];
    if (
      allParamsAllowedRoles &&
      allParamsAllowedRoles.length > 0 &&
      !allParamsAllowedRoles.includes(role)
    ) {
      ruleSatisfied = false;
      continue;
    }
  }

  return ruleSatisfied;
}

export function isAuthorized(opts: {
  hasRole: Array<UserRole>;
  paramRules?: ParamRules;
}) {
  return (req: Request, res: Response, next: NextFunction) => {
    const { role } = res.locals;
    const { hasRole, paramRules } = opts;

    const params = req.params;
    let allowNext = true;

    if (!role) {
      return next(
        createError(StatusCodes.FORBIDDEN, AuthErrorMessage.Forbidden)
      );
    }

    if (!hasRole.includes(role)) allowNext = false;

    if (allowNext && paramRules) {
      allowNext = checkIfRoleSatisfiesParamRules(role, params, paramRules);
    }

    if (allowNext) {
      return next();
    }

    return next(createError(StatusCodes.FORBIDDEN, AuthErrorMessage.Forbidden));
  };
}
