import pino from "pino";

const fullPath = process.cwd();

const pinoLogger = pino(pino.destination(`${fullPath}/logs/hooks.log`));

export const hooksLogger = {
  info: (hookName: string, tag: string, message: string | object) => {
    if (typeof message === "object") {
      message = JSON.stringify(message);
    }
    pinoLogger.info(`[${hookName}][${tag}]: ${message}`);
  },
  debug: (hookName: string, tag: string, message: string | object) => {
    if (typeof message === "object") {
      message = JSON.stringify(message);
    }
    pinoLogger.debug(`[${hookName}][${tag}]: ${message}`);
  },
};
