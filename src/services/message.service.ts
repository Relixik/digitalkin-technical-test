import { RecordId } from "surrealdb";
import databaseService from "./database.service";
import logger from "../config/logger";
import { Message } from "../models/message.model";

class MessageService {
    private get db() {
        return databaseService.getDB();
    }

    async create(messageData: Partial<Message>): Promise<Message> {
        try {
            const message = {
                conversationId: messageData.conversationId,
                sender: messageData.sender,
                content: messageData.content,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            const result = await this.db.create("messages", message);
            return result[0] as Message;
        } catch (error) {
            logger.error("MESSAGE_SERVICE", `Error creating message: ${error}`, {
                message: error instanceof Error ? error.message : error,
                stack: error instanceof Error ? error.stack : undefined,
            });
            throw error;
        }
    }

    async getByConversationId(conversationId: string): Promise<Message[]> {
        try {
            const result = await this.db.query(
                "SELECT * FROM messages WHERE conversationId = $conversationId ORDER BY createdAt ASC",
                { conversationId: new RecordId("conversations", conversationId) }
            );
            return result[0] as Message[];
        } catch (error) {
            logger.error("MESSAGE_SERVICE", `Error fetching messages for conversation ${conversationId}: ${error}`, {
                message: error instanceof Error ? error.message : error,
                stack: error instanceof Error ? error.stack : undefined,
            });
            throw error;
        }
    }
}

export default new MessageService();
