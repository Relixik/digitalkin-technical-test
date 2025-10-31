import { RecordId } from "surrealdb";

export interface Agent {
    id: RecordId;
    name: string;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
    [x: string]: unknown;
}
