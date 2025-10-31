import { RecordId } from "surrealdb";
import databaseService from "./database.service";
import logger from "../config/logger";
import { Conversation } from "../models/conversation.model.js";

class ConversationService {
    private get db() {
        return databaseService.getDB();
    }

    async create(agentId: string): Promise<Conversation> {
        try {
            const conversation = {
                agentId: new RecordId("agents", agentId),
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            const result = await this.db.create("conversations", conversation);
            return result[0] as Conversation;
        } catch (error) {
            logger.error("CONVERSATION_SERVICE", `Error creating conversation: ${error}`, {
                message: error instanceof Error ? error.message : error,
                stack: error instanceof Error ? error.stack : undefined,
            });
            throw error;
        }
    }

    async getById(id: string): Promise<Conversation | null> {
        try {
            const result = await this.db.select<Conversation>(new RecordId("conversations", id));
            return result ?? null;
        } catch (error) {
            logger.error("CONVERSATION_SERVICE", `Error fetching conversation ${id}: ${error}`, {
                message: error instanceof Error ? error.message : error,
                stack: error instanceof Error ? error.stack : undefined,
            });
            throw error;
        }
    }
}

export default new ConversationService();
