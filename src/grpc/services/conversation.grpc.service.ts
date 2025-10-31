import AgentService from "../../services/agent.service";
import logger from "../../config/logger";
import { sendUnaryData, ServerUnaryCall } from "@grpc/grpc-js";
import {
    ConversationResponse,
    MessageResponse,
    SendMessageRequest,
    StartConversationRequest,
} from "../models/conversation.model";
import { CreateConversationSchema } from "../../models/conversation.model";

export const conversationGrpcService = {
    StartConversation: async (
        call: ServerUnaryCall<StartConversationRequest, ConversationResponse>,
        callback: sendUnaryData<ConversationResponse>
    ) => {
        try {
            const validation = CreateConversationSchema.validate(call.request);
            if (validation.error) {
                logger.warn(
                    "GRPC",
                    `StartConversation validation failed: ${validation.error.message}`
                );
                callback(null, {
                    conversationId: "",
                    message: "",
                    error: validation.error.message,
                });
            }

            callback(null, {
                ...(await AgentService.processMessage(
                    validation.value.agentId,
                    null,
                    validation.value.message
                )),
                error: "",
            });
        } catch (error) {
            logger.error("GRPC", `StartConversation error: ${error}`, {
                message: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined,
            });
            callback(null, {
                conversationId: "",
                message: "",
                error: (error as Error).message,
            });
        }
    },

    SendMessage: async (
        call: ServerUnaryCall<SendMessageRequest, MessageResponse>,
        callback: sendUnaryData<MessageResponse>
    ) => {
        try {
            const { conversationId } = call.request;
            const validation = CreateConversationSchema.validate(call.request);
            if (validation.error) {
                logger.warn("GRPC", `SendMessage validation failed: ${validation.error.message}`);
                callback(null, {
                    conversationId,
                    message: "",
                    error: validation.error.message,
                });
            }

            callback(null, {
                ...(await AgentService.processMessage(
                    validation.value.agentId,
                    conversationId,
                    validation.value.message
                )),
                error: "",
            });
        } catch (error) {
            logger.error("GRPC", `SendMessage error: ${error}`, {
                message: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined,
            });
            callback(null, {
                conversationId: call.request.conversationId,
                message: "",
                error: (error as Error).message,
            });
        }
    },
};
