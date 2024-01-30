import { AxiosError } from "axios";
import createApiError, { ApiError } from "./error.factory";

export function createApiErrorFromAxiosError(
  error: unknown,
  errorMessageWrapper?: (text: string) => string
): ApiError {
  const e = error as Error;

  if (error instanceof AxiosError) {
    const axiosError = error.response?.data as { error: string };
    e.message = axiosError.error;
  }

  const errorMessage =
    errorMessageWrapper instanceof Function
      ? errorMessageWrapper(e.message)
      : e.message;

  return createApiError(errorMessage);
}
