import { Router } from "express";

const router = Router();

import agentsRouter from "./agents";
router.use("/agents", agentsRouter);

import conversationsRouter from "./conversations";
router.use("/conversations", conversationsRouter);

export default router;