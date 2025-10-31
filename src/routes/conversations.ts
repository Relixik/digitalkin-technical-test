import { Router } from "express";
import logger from "../config/logger";
import AgentService from "../services/agent.service";
import { ContinueConversationSchema, CreateConversationSchema } from "../models/conversation.model";

const conversationsRouter = Router();

conversationsRouter.post("/", async (req, res) => {
    try {
        const newConversation = req.body;
        const validation = CreateConversationSchema.validate(newConversation);
        if (validation.error) {
            logger.warn("CONVERSATIONS", `Validation failed: ${validation.error.message}`);
            return res.status(400).json({ error: validation.error.message });
        }

        res.status(201).send(
            await AgentService.processMessage(
                validation.value.agentId,
                null,
                validation.value.message
            )
        );
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

        res.status(201).send(
            await AgentService.processMessage(
                validation.value.agentId,
                conversationId,
                validation.value.message
            )
        );
    } catch (error) {
        logger.error("CONVERSATIONS", `Error in fetching conversation: ${error}`, {
            message: error instanceof Error ? error.message : error,
            stack: error instanceof Error ? error.stack : undefined,
        });
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

export default conversationsRouter;
