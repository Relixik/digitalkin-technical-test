import type { Logger, LoggerOptions } from "winston";
import { createLogger, format, transports } from "winston";
import env from "./env";

class CustomLogger {
    private logger: Logger;

    constructor() {
        const options: LoggerOptions = {
            level: env.LOG_LEVEL,
            defaultMeta: {
                "service.version": env.VERSION,
                "service.environment": env.NODE_ENV,
            },
            transports: [new transports.Console()],
        };

        if (env.NODE_ENV === "development") {
            options.format = format.combine(
                format.colorize(),
                format.timestamp(),
                format.printf(function ({ level, message, timestamp, ...metadata }) {
                    let msg = `${JSON.stringify(timestamp)} [${level}] ${JSON.stringify(message)}`;
                    if (metadata) {
                        msg += ` - metadata: ${JSON.stringify(metadata)}`;
                    }
                    return msg;
                })
            );
        } else {
            options.format = format.combine(
                format.timestamp(),
                format.errors({ stack: true }),
                format.json()
            );
        }
        this.logger = createLogger(options);
    }

    public debug(category: string, message: string, metadata?: object): void {
        this.logger.debug(`[${category.toUpperCase()}] - ${message}`, metadata);
    }

    public info(category: string, message: string, metadata?: object): void {
        this.logger.info(`[${category.toUpperCase()}] - ${message}`, metadata);
    }

    public warn(category: string, message: string, metadata?: object): void {
        this.logger.warn(`[${category.toUpperCase()}] - ${message}`, metadata);
    }

    public error(category: string, message: string, metadata?: object): void {
        this.logger.error(`[${category.toUpperCase()}] - ${message}`, metadata);
    }
}

export default new CustomLogger();
