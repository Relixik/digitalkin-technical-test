import { type Request, type Response, type NextFunction } from "express";
import logger from "../config/logger";

// Middleware de gestion des erreurs JSON
export const jsonErrorHandler = (error: Error, req: Request, res: Response, next: NextFunction) => {
    if (error instanceof SyntaxError && 'body' in error) {
        logger.warn("JSON_ERROR", `Invalid JSON received: ${error.message}`, {
            url: req.url,
            method: req.method,
            body: req.body
        });
        return res.status(400).json({ 
            error: "Invalid JSON format",
            message: "Please check your request body syntax"
        });
    }
    next(error);
};
