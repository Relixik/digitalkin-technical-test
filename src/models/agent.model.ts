import Joi from "joi";
import { RecordId } from "surrealdb";

export enum AgentType {
    OPENAI = "openai",
    PREDEFINED = "predefined",
    ECHO = "echo",
    KEYWORD_BASED = "keyword_based"
}

export interface Agent {
    id: RecordId;
    name: string;
    type: AgentType;
    description?: string;
    config?: AgentConfig;
    createdAt: Date;
    updatedAt: Date;
    [x: string]: unknown;
}

export interface AgentConfig {
    // Configuration pour réponse prédéfinie
    predefinedResponse?: string;
    
    // Configuration pour règles basées sur des mots-clés
    keywordRules?: KeywordRule[];
}

export interface KeywordRule {
    keywords: string[];
    response: string;
    priority?: number;
}

export const CreateAgentSchema = Joi.object({
    name: Joi.string().min(3).max(100).required(),
    type: Joi.string().valid(...Object.values(AgentType)).required(),
    description: Joi.string().max(500).optional(),
    config: Joi.object({
        // Configuration réponse prédéfinie
        predefinedResponse: Joi.string().optional(),
        
        // Configuration règles par mots-clés
        keywordRules: Joi.array().items(
            Joi.object({
                keywords: Joi.array().items(Joi.string()).min(1).required(),
                response: Joi.string().required(),
                priority: Joi.number().integer().min(0).optional()
            })
        ).optional()
    }).optional()
});

export const UpdateAgentSchema = Joi.object({
    name: Joi.string().min(3).max(100).optional(),
    type: Joi.string().valid(...Object.values(AgentType)).optional(),
    description: Joi.string().max(500).optional(),
    config: Joi.object({
        // Configuration réponse prédéfinie
        predefinedResponse: Joi.string().optional(),
        
        // Configuration règles par mots-clés
        keywordRules: Joi.array().items(
            Joi.object({
                keywords: Joi.array().items(Joi.string()).min(1).required(),
                response: Joi.string().required(),
                priority: Joi.number().integer().min(0).optional()
            })
        ).optional()
    }).optional()
}).or("name", "type", "description", "config");

export function AgentToJSON(agent: Agent) {
    return {
        id: agent.id.id.toString(),
        name: agent.name,
        type: agent.type,
        description: agent.description,
        config: agent.config,
        createdAt: agent.createdAt.toISOString(),
        updatedAt: agent.updatedAt.toISOString(),
    };
}

export function AgentsToJSON(agents: Agent[]) {
    return agents.map(AgentToJSON);
}