import { loadSync } from "@grpc/proto-loader";
import { loadPackageDefinition, Server, ServerCredentials } from "@grpc/grpc-js";
import { agentGrpcService } from "./services/agent.grpc.service";
import { conversationGrpcService } from "./services/conversation.grpc.service";
import logger from "../config/logger";
import { env } from "../config/env";

export const startGrpcServer = () => {
    const packageDefinition = loadSync("./proto/digitalkin.proto", {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true,
    });

    const digitalkinProto = loadPackageDefinition(packageDefinition);
    const server = new Server();

    // @ts-expect-error - dynamic service loading
    server.addService(digitalkinProto.digitalkin.AgentService.service, agentGrpcService);
    
    // @ts-expect-error - dynamic service loading
    server.addService(digitalkinProto.digitalkin.ConversationService.service, conversationGrpcService);

    server.bindAsync(`localhost:${env.PORT_GRPC}`, ServerCredentials.createInsecure(), (error) => {
        if (error) {
            logger.error("GRPC", `Server binding error: ${error.message}`);
            return;
        }
        logger.info("GRPC", `gRPC server is running on port ${env.PORT_GRPC}`);
    });
};
