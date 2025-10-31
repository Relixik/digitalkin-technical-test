export interface StartConversationRequest {
    agentId: string;
    message: string;
}

export interface ConversationResponse {
    conversationId: string;
    message: string;
    error: string;
}

export interface SendMessageRequest {
    conversationId: string;
    message: string;
}

export interface MessageResponse {
    conversationId: string;
    message: string;
    error: string;
}
