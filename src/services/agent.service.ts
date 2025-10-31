import { RecordId } from "surrealdb";
import databaseService from "./database.service";
import logger from "../config/logger";
import { Agent } from "../models/agent.model";
import { Conversation } from "../models/conversation.model";

class AgentService {
    private get db() {
        return databaseService.getDB();
    }

    async getAll(): Promise<Agent[]> {
        try {
            const result = await this.db.select<Agent>("agents");
            logger.info("AGENTS_SERVICE", `Fetched ${result.length} agents.`, {
                result,
            });
            return result;
        } catch (error) {
            logger.error("AGENTS_SERVICE", `Error fetching agents: ${error}`, {
                message: error instanceof Error ? error.message : error,
                stack: error instanceof Error ? error.stack : undefined,
            });
            throw error;
        }
    }
    async create(agentData: Partial<Agent>): Promise<Agent> {
        try {
            const agent = {
                name: agentData.name,
                description: agentData.description,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            const result = await this.db.create("agents", agent);
            return result[0] as Agent;
        } catch (error) {
            logger.error("AGENTS_SERVICE", `Error creating agent: ${error}`, {
                message: error instanceof Error ? error.message : error,
                stack: error instanceof Error ? error.stack : undefined,
            });
            throw error;
        }
    }

    async getById(id: string): Promise<Agent | null> {
        try {
            const result = await this.db.select<Agent>(new RecordId("agents", id));
            return result ?? null;
        } catch (error) {
            logger.error("AGENTS_SERVICE", `Error fetching agent ${id}: ${error}`, {
                message: error instanceof Error ? error.message : error,
                stack: error instanceof Error ? error.stack : undefined,
            });
            throw error;
        }
    }

    async update(id: string, updates: Partial<Agent>): Promise<Agent> {
        try {
            const result = await this.db.merge<Agent>(new RecordId("agents", id), {
                ...updates,
                updatedAt: new Date(),
            });
            logger.info("AGENTS_SERVICE", `Updated agent: ${id}`);
            return result;
        } catch (error) {
            logger.error("AGENTS_SERVICE", `Error updating agent ${id}: ${error}`, {
                message: error instanceof Error ? error.message : error,
                stack: error instanceof Error ? error.stack : undefined,
            });
            throw error;
        }
    }

    async delete(id: string): Promise<boolean> {
        try {
            // Si on supprime un agent, est-ce qu'on supprime aussi ses conversations et messages ?
            await this.db
                .query<Conversation[]>("SELECT * FROM conversations WHERE agentId = $agentId", {
                    agentId: new RecordId("agents", id),
                })
                .then(async (conversations) => {
                    for (const conversation of conversations) {
                        await this.db.query(
                            "DELETE FROM messages WHERE conversationId = $conversationId",
                            {
                                conversationId: conversation.id,
                            }
                        );
                        await this.db.delete(conversation.id);
                    }
                });
            await this.db.delete(new RecordId("agents", id));
            logger.info("AGENTS_SERVICE", `Deleted agent: ${id}`);
            return true;
        } catch (error) {
            logger.error("AGENTS_SERVICE", `Error deleting agent ${id}: ${error}`, {
                message: error instanceof Error ? error.message : error,
                stack: error instanceof Error ? error.stack : undefined,
            });
            throw error;
        }
    }
}

export default new AgentService();
