import AgentService from "../../services/agent.service";
import logger from "../../config/logger";
import { sendUnaryData, ServerUnaryCall } from "@grpc/grpc-js";
import { AgentsToJSON, AgentToJSON, UpdateAgentSchema } from "../../models/agent.model";
import {
    AgentResponse,
    CreateAgentRequest,
    DeleteAgentRequest,
    DeleteAgentResponse,
    GetAgentRequest,
    ListAgentsResponse,
    UpdateAgentRequest,
} from "../models/agent.model";

export const agentGrpcService = {
    ListAgents: async (
        _: ServerUnaryCall<unknown, ListAgentsResponse>,
        callback: sendUnaryData<ListAgentsResponse>
    ) => {
        try {
            const agents = await AgentService.getAll();

            callback(null, {
                agents: AgentsToJSON(agents),
                error: "",
            });
        } catch (error) {
            logger.error("GRPC", `ListAgents error: ${error}`, {
                message: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined,
            });
            callback(null, { agents: [], error: (error as Error).message });
        }
    },

    CreateAgent: async (
        call: ServerUnaryCall<CreateAgentRequest, AgentResponse>,
        callback: sendUnaryData<AgentResponse>
    ) => {
        try {
            const { name, description } = call.request;
            const newAgent = await AgentService.create({ name, description });

            callback(null, {
                agent: AgentToJSON(newAgent),
                error: "",
            });
        } catch (error) {
            logger.error("GRPC", `CreateAgent error: ${error}`, {
                message: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined,
            });
            callback(null, { agent: null, error: (error as Error).message });
        }
    },

    GetAgent: async (
        call: ServerUnaryCall<GetAgentRequest, AgentResponse>,
        callback: sendUnaryData<AgentResponse>
    ) => {
        try {
            const { id } = call.request;
            const agent = await AgentService.getById(id);

            if (!agent) {
                callback(null, { agent: null, error: "Agent not found" });
                return;
            }

            callback(null, {
                agent: AgentToJSON(agent),
                error: "",
            });
        } catch (error) {
            logger.error("GRPC", `GetAgent error: ${error}`, {
                message: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined,
            });
            callback(null, { agent: null, error: (error as Error).message });
        }
    },

    UpdateAgent: async (
        call: ServerUnaryCall<UpdateAgentRequest, AgentResponse>,
        callback: sendUnaryData<AgentResponse>
    ) => {
        try {
            const { id, ...updateData } = call.request;
            if (!id) {
                callback(null, { agent: null, error: "Agent ID is required" });
                return;
            }
            const validatedData = UpdateAgentSchema.validate(updateData);
            const updatedAgent = await AgentService.update(id, validatedData);

            if (!updatedAgent) {
                callback(null, { agent: null, error: "Agent not found" });
                return;
            }

            callback(null, {
                agent: AgentToJSON(updatedAgent),
                error: "",
            });
        } catch (error) {
            logger.error("GRPC", `UpdateAgent error: ${error}`, {
                message: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined,
            });
            callback(null, { agent: null, error: (error as Error).message });
        }
    },

    DeleteAgent: async (
        call: ServerUnaryCall<DeleteAgentRequest, DeleteAgentResponse>,
        callback: sendUnaryData<DeleteAgentResponse>
    ) => {
        try {
            const { id } = call.request;
            const success = await AgentService.delete(id);

            callback(null, {
                success,
                error: success ? "" : "Agent not found",
            });
        } catch (error) {
            logger.error("GRPC", `DeleteAgent error: ${error}`, {
                message: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined,
            });
            callback(null, { success: false, error: (error as Error).message });
        }
    },
};
