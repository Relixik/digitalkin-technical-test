import OpenAI from "openai";
import env from "../config/env";
import { Message } from "../models/message.model";
import { EasyInputMessage } from "openai/resources/responses/responses.js";

class OpenAIService {
    private client = new OpenAI();

    sendMessage(content: string, history: Message[] = []): Promise<{ message: string }> {
        const input = history.map((msg) => ({
            role: msg.sender === "user" ? "user" : "assistant",
            content: msg.content,
        })) as EasyInputMessage[];
        input.push({ role: "user", content: content });
        return this.client.responses
            .create({
                model: env.OPENAI_MODEL,
                input,
            })
            .then((response) => {
                return {
                    message: response.output_text,
                };
            });
    }
}

export default new OpenAIService();
