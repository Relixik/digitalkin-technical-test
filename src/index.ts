import express, { type Express } from "express";
import cors from "cors";
import env from "./config/env";
import logger from "./config/logger";
import routes from "./routes";
import databaseService from "./services/database.service";

const app: Express = express();

// Initialisation de la base de données
async function startServer() {
    try {
        await databaseService.connect();

        app.disable("x-powered-by")
            .use(cors())
            .use(express.json())
            .use(express.urlencoded({ extended: true }))
            .use(routes)
            .listen(env.PORT, () => {
                logger.info("SERVER", `API is running on port ${env.PORT}`);
            });

    } catch (error) {
        logger.error("SERVER", `Failed to start: ${error}`, {
            message: error instanceof Error ? error.message : error,
            stack: error instanceof Error ? error.stack : undefined,
        });
        process.exit(1);
    }
}

// Gestion propre de l'arrêt
process.on("SIGINT", async () => {
    logger.info("SERVER", "Shutting down gracefully...");
    await databaseService.disconnect();
    process.exit(0);
});

startServer();
