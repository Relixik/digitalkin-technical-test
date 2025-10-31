import Joi from "joi";
import { RecordId } from "surrealdb";

export interface Agent {
    id: RecordId;
    name: string;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
    [x: string]: unknown;
}

export const CreateAgentSchema = Joi.object({
    name: Joi.string().min(3).max(100).required(),
    description: Joi.string().max(500).optional(),
});

export const UpdateAgentSchema = Joi.object({
    name: Joi.string().min(3).max(100).optional(),
    description: Joi.string().max(500).optional(),
}).or("name", "description");

export function AgentToJSON(agent: Agent) {
    return {
        id: agent.id.id.toString(),
        name: agent.name,
        description: agent.description,
        createdAt: agent.createdAt.toISOString(),
        updatedAt: agent.updatedAt.toISOString(),
    };
}

export function AgentsToJSON(agents: Agent[]) {
    return agents.map(AgentToJSON);
}