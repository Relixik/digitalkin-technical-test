import ConversationService from "../../services/conversation.service";
import MessageService from "../../services/message.service";
import OpenAIService from "../../services/openai.service";
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

            const conversation = await ConversationService.create(validation.value.agentId);

            const [message] = await Promise.all([
                OpenAIService.sendMessage(validation.value.message).then((response) => {
                    return MessageService.create({
                        conversationId: conversation.id,
                        sender: "agent",
                        content: response.message,
                    });
                }),
                MessageService.create({
                    conversationId: conversation.id,
                    sender: "user",
                    content: validation.value.message,
                }),
            ]);

            callback(null, {
                conversationId: String(conversation.id.id),
                message: message.content,
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
            // Check if conversation exists
            const conversation = await ConversationService.getById(conversationId);
            if (!conversation) {
                callback(null, {
                    conversationId,
                    message: "",
                    error: "Conversation not found",
                });
                return;
            }
            // Retrieve chat history and pass it to OpenAI API
            const messages = await MessageService.getByConversationId(conversationId);

            const [message] = await Promise.all([
                OpenAIService.sendMessage(validation.value.message, messages).then((response) => {
                    return MessageService.create({
                        conversationId: conversation.id,
                        sender: "agent",
                        content: response.message,
                    });
                }),
                MessageService.create({
                    conversationId: conversation.id,
                    sender: "user",
                    content: validation.value.message,
                }),
            ]);

            callback(null, {
                conversationId,
                message: message.content,
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
