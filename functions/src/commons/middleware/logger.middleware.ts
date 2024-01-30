import morgan from "morgan";
import { logger } from "../logger.dev";

const stream = {
  write: (message: string) => {
    logger.info(`${message.trim()}`);
  },
};

const skip = () => {
  const env = process.env.NODE_ENV || "development";
  return env !== "development";
};

const loggerFormat = (tag = "") =>
  `:method ${tag}:url :status :response-time ms - :res[content-length]`;

// Build the morgan middleware
export default (tag: string) => morgan(loggerFormat(tag), { stream, skip });
