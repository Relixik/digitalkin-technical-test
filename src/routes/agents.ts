import { Router } from "express";
import logger from "../config/logger";
import AgentService from "../services/agent.service";
import { CreateAgentSchema, AgentsToJSON, AgentToJSON } from "../models/agent.model";

const agentsRouter = Router();

agentsRouter.get("/", async (_, res) => {
    try {
        logger.info("AGENTS", "Fetched all agents.");
        const agents = await AgentService.getAll();
        return res.status(200).json(AgentsToJSON(agents));
    } catch (error) {
        logger.error("AGENTS", `Error in getAllAgents: ${error}`, {
            message: error instanceof Error ? error.message : error,
            stack: error instanceof Error ? error.stack : undefined,
        });
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

agentsRouter.post("/", async (req, res) => {
    try {
        const agentData = req.body;
        const validation = CreateAgentSchema.validate(agentData);
        if (validation.error) {
            logger.warn("AGENTS_CONTROLLER", `Validation failed: ${validation.error.message}`);
            return res.status(400).json({ error: validation.error.message });
        }
        const newAgent = await AgentService.create(validation.value);
        return res.status(201).json(AgentToJSON(newAgent));
    } catch (error) {
        logger.error("AGENTS_CONTROLLER", `Error in createAgent: ${error}`, {
            message: error instanceof Error ? error.message : error,
            stack: error instanceof Error ? error.stack : undefined,
        });
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

agentsRouter.get("/:id", async (req, res) => {
    try {
        const agentId = req.params.id;
        const agent = await AgentService.getById(agentId);
        if (!agent) {
            logger.warn("AGENTS", `Agent with ID ${agentId} not found.`);
            return res.status(404).json({ error: "Agent not found" });
        }
        logger.info("AGENTS", `Fetched agent with ID ${agentId}.`);
        return res.status(200).json(AgentToJSON(agent));
    } catch (error) {
        logger.error("AGENTS", `Error fetching agent with ID ${req.params.id}: ${error}`, {
            message: error instanceof Error ? error.message : error,
            stack: error instanceof Error ? error.stack : undefined,
        });
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

agentsRouter.put("/:id", async (req, res) => {
    try {
        const agentId = req.params.id;
        const updatedAgent = req.body;
        const validation = CreateAgentSchema.validate(updatedAgent);
        if (validation.error) {
            logger.warn("AGENTS_CONTROLLER", `Validation failed: ${validation.error.message}`);
            return res.status(400).json({ error: validation.error.message });
        }
        const agent = await AgentService.update(agentId, validation.value);
        logger.info("AGENTS", `Agent with ID ${agentId} updated.`);
        return res.status(200).json(AgentToJSON(agent));
    } catch (error) {
        logger.error("AGENTS", `Error updating agent with ID ${req.params.id}: ${error}`, {
            message: error instanceof Error ? error.message : error,
            stack: error instanceof Error ? error.stack : undefined,
        });
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

agentsRouter.delete("/:id", async (req, res) => {
    try {
        const agentId = req.params.id;
        await AgentService.delete(agentId);
        logger.info("AGENTS", `Agent with ID ${agentId} deleted.`);
        res.status(204).send();
    } catch (error) {
        logger.error("AGENTS", `Error deleting agent with ID ${req.params.id}: ${error}`, {
            message: error instanceof Error ? error.message : error,
            stack: error instanceof Error ? error.stack : undefined,
        });
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

export default agentsRouter;
