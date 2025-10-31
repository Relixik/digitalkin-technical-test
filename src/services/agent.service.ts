import { RecordId } from "surrealdb";
import databaseService from "./database.service";
import OpenAIService from "./openai.service";
import ConversationService from "./conversation.service";
import MessageService from "./message.service";
import logger from "../config/logger";
import { Agent, AgentType } from "../models/agent.model";
import { Conversation } from "../models/conversation.model";
import { Message } from "../models/message.model";

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
                type: agentData.type,
                description: agentData.description,
                config: agentData.config,
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

    /**
     * Traite un message selon le type d'agent et retourne une réponse
     */
    async processMessage(
        agentId: string,
        conversationId: string | null,
        userMessage: string
    ): Promise<{
        conversationId: string;
        message: string;
    }> {
        try {
            const agent = await this.getById(agentId);
            if (!agent) {
                throw new Error(`Agent with ID ${agentId} not found`);
            }

            let conv = null;
            if (conversationId === null) {
                conv = await ConversationService.create(agentId);
            } else {
                conv = await ConversationService.getById(conversationId);
            }
            if (!conv) {
                throw new Error(`Conversation with ID ${conversationId} not found`);
            }

            switch (agent.type) {
                case AgentType.ECHO:
                    await MessageService.create({
                        conversationId: conv.id,
                        sender: "user",
                        content: userMessage,
                    });
                    await MessageService.create({
                        conversationId: conv.id,
                        sender: "agent",
                        content: userMessage,
                    });
                    return {
                        conversationId: conv.id.id.toString(),
                        message: userMessage,
                    };

                case AgentType.PREDEFINED:
                    await MessageService.create({
                        conversationId: conv.id,
                        sender: "user",
                        content: userMessage,
                    });
                    await MessageService.create({
                        conversationId: conv.id,
                        sender: "agent",
                        content:
                            agent.config?.predefinedResponse || "Réponse prédéfinie non configurée",
                    });
                    return {
                        conversationId: conv.id.id.toString(),
                        message:
                            agent.config?.predefinedResponse || "Réponse prédéfinie non configurée",
                    };

                case AgentType.KEYWORD_BASED:
                    const response = this.processKeywordBasedMessage(agent, userMessage);
                    await MessageService.create({
                        conversationId: conv.id,
                        sender: "user",
                        content: userMessage,
                    });
                    await MessageService.create({
                        conversationId: conv.id,
                        sender: "agent",
                        content: response,
                    });
                    return {
                        conversationId: conv.id.id.toString(),
                        message: response,
                    };

                case AgentType.OPENAI:
                    let messages: Message[] = [];
                    if (conversationId !== null) {
                        messages = await MessageService.getByConversationId(conversationId);
                    }

                    const [message] = await Promise.all([
                        OpenAIService.sendMessage(userMessage, messages).then((response) => {
                            return MessageService.create({
                                conversationId: conv.id,
                                sender: "agent",
                                content: response.message,
                            });
                        }),
                        MessageService.create({
                            conversationId: conv.id,
                            sender: "user",
                            content: userMessage,
                        }),
                    ]);

                    return {
                        conversationId: conv.id.id.toString(),
                        message: message.content,
                    }

                default:
                    return {
                        conversationId: conv.id.id.toString(),
                        message: "Type d'agent non reconnu",
                    }
            }
        } catch (error) {
            logger.error(
                "AGENTS_SERVICE",
                `Error processing message for agent ${agentId}: ${error}`,
                {
                    message: error instanceof Error ? error.message : error,
                    stack: error instanceof Error ? error.stack : undefined,
                }
            );
            throw error;
        }
    }

    /**
     * Traite un message avec des règles basées sur des mots-clés
     */
    private processKeywordBasedMessage(agent: Agent, userMessage: string): string {
        const rules = agent.config?.keywordRules || [];
        const messageWords = userMessage.toLowerCase().split(/\s+/);

        // Trouve les règles qui correspondent
        const matchingRules = rules.filter((rule) =>
            rule.keywords.some((keyword) =>
                messageWords.some((word) => word.includes(keyword.toLowerCase()))
            )
        );

        if (matchingRules.length === 0) {
            return "Aucune règle correspondante trouvée";
        }

        // Trie par priorité (plus haute en premier) puis prend la première
        const selectedRule = matchingRules.sort((a, b) => (b.priority || 0) - (a.priority || 0))[0];

        return selectedRule.response;
    }
}

export default new AgentService();
