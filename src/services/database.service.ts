import { Surreal } from "surrealdb";

import env from "../config/env";
import logger from "../config/logger";

class DatabaseService {
    private db: Surreal;
    private connected = false;

    constructor() {
        this.db = new Surreal();
    }

    async connect(): Promise<void> {
        try {
            this.db = new Surreal();
            await this.db.connect(env.DB_URI, {
                namespace: env.DB_NAMESPACE,
                database: env.DB_DATABASE,
                auth: {
                    username: env.DB_USER,
                    password: env.DB_PASSWORD,
                },
            });
            this.connected = true;
            logger.info("DATABASE", "Connected to SurrealDB");
        } catch (error) {
            logger.error("DATABASE", `Connection failed: ${error}`, {
                message: error instanceof Error ? error.message : error,
                stack: error instanceof Error ? error.stack : undefined,
            });
            throw error;
        }
    }

    async disconnect(): Promise<void> {
        if (this.connected) {
            await this.db.close();
            this.connected = false;
            logger.info("DATABASE", "Disconnected from SurrealDB");
        }
    }

    getDB(): Surreal {
        if (!this.connected) {
            throw new Error("Database not connected");
        }
        return this.db;
    }

    isConnected(): boolean {
        return this.connected;
    }
}

export default new DatabaseService();
