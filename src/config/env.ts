import dotenv from "dotenv";
dotenv.config({ quiet: true, override: true });

export const env = {
    // Application
    VERSION: process.env.VERSION || "1.0.0",
    NODE_ENV: process.env.NODE_ENV || "development",
    PORT: parseInt(process.env.PORT || "3000", 10),
    PORT_GRPC: parseInt(process.env.PORT_GRPC || "3002", 10),
    LOG_LEVEL: process.env.LOG_LEVEL || "debug",

    // Base de données
    DB_URI: process.env.DB_HOST || "mem://",
    DB_NAMESPACE: process.env.DB_NAMESPACE || "digitalkin",
    DB_DATABASE: process.env.DB_DATABASE || "main",
    DB_USER: process.env.DB_USER || "",
    DB_PASSWORD: process.env.DB_PASSWORD || "",

    // OPENAI
    OPENAI_MODEL: process.env.OPENAI_MODEL || "gpt-5",
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || "", // automatically read from environment by OpenAI library
} as const;

export default env;
