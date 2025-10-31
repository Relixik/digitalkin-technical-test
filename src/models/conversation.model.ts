import Joi from "joi";
import { RecordId } from "surrealdb";

export interface Conversation {
    id: RecordId;
    agentId: RecordId;
    createdAt: Date;
    updatedAt: Date;
    [x: string]: unknown;
}

export const CreateConversationSchema = Joi.object({
    agentId: Joi.string().required(),
    message: Joi.string().required(),
});

export const ContinueConversationSchema = Joi.object({
    message: Joi.string().required(),
});