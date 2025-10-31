import { Router } from "express";
import logger from "../config/logger";
import ConversationService from "../services/conversation.service";
import MessageService from "../services/message.service";
import { ContinueConversationSchema, CreateConversationSchema } from "../models/conversation.model";
import OpenAIService from "../services/openai.service";

const conversationsRouter = Router();

conversationsRouter.post("/", async (req, res) => {
    try {
        const newConversation = req.body;
        const validation = CreateConversationSchema.validate(newConversation);
        if (validation.error) {
            logger.warn("CONVERSATIONS", `Validation failed: ${validation.error.message}`);
            return res.status(400).json({ error: validation.error.message });
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
        res.status(201).send({ conversationId: conversation.id.id, message: message.content });
    } catch (error) {
        logger.error("CONVERSATIONS", `Error in creating conversation: ${error}`, {
            message: error instanceof Error ? error.message : error,
            stack: error instanceof Error ? error.stack : undefined,
        });
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

conversationsRouter.post("/:id/messages", async (req, res) => {
    try {
        const conversationId = req.params.id;
        const validation = ContinueConversationSchema.validate(req.body);
        if (validation.error) {
            logger.warn("CONVERSATIONS", `Validation failed: ${validation.error.message}`);
            return res.status(400).json({ error: validation.error.message });
        }
        // Check if conversation exists
        const conversation = await ConversationService.getById(conversationId);
        if (!conversation) {
            logger.warn("CONVERSATIONS", `Conversation not found: ${conversationId}`);
            return res.status(404).json({ error: "Conversation not found" });
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
        res.status(201).send({ conversationId: conversation.id.id, message: message.content });
    } catch (error) {
        logger.error("CONVERSATIONS", `Error in fetching conversation: ${error}`, {
            message: error instanceof Error ? error.message : error,
            stack: error instanceof Error ? error.stack : undefined,
        });
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

export default conversationsRouter;
