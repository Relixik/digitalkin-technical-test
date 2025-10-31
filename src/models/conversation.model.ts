import { RecordId } from "surrealdb";

export interface Conversation {
    id: RecordId;
    agentId: RecordId;
    createdAt: Date;
    updatedAt: Date;
    [x: string]: unknown;
}
