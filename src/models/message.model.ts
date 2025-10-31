import { RecordId } from "surrealdb";

export interface Message {
    id: RecordId;
    conversationId: RecordId;
    sender: "user" | "agent";
    content: string;
    createdAt: Date;
    updatedAt: Date;
    [x: string]: unknown;
}
