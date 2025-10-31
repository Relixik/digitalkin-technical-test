export interface Agent {
    id: string;
    name: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
}

export type ListAgentsRequest = object;

export interface ListAgentsResponse {
    agents: Agent[];
    error: string;
}

export interface CreateAgentRequest {
    name: string;
    description: string;
}

export interface AgentResponse {
    agent: Agent | null;
    error: string;
}

export interface GetAgentRequest {
    id: string;
}

export interface UpdateAgentRequest {
    id: string;
    name?: string;
    description?: string;
}

export interface DeleteAgentRequest {
    id: string;
}

export interface DeleteAgentResponse {
    success: boolean;
    error: string;
}
