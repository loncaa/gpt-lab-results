import * as winston from "winston";

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "white",
};

winston.addColors(colors);

const format = winston.format.combine(
  winston.format.errors({ stack: true }),
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} : ${info.stack || info.message}`
  )
);

const transports = [new winston.transports.Console()];

export function createLogger(): winston.Logger {
  return winston.createLogger({
    level: "debug",
    levels,
    format,
    transports,
  });
}

export const logger = createLogger();
