import { closeDatabase } from "@pkg/db";
import { Server, ServerCredentials } from "@grpc/grpc-js";

import { Repository } from "@service/business/internal/repository/postgres/postgres.js";
import { Controller } from "@service/business/internal/controller/business/controller.js";
import { GrpcHandler } from "@service/business/internal/handler/grpc/handler.js";
import { BusinessServiceDefinition } from "@service/business/internal/grpc/service.js";

const port = parseInt(process.env.PORT || "8000");

// Initialize repository, controller, and handler
const repository = new Repository();
const controller = new Controller(repository);
const grpcHandler = new GrpcHandler(controller);

// Create gRPC server
const server = new Server();

// Add the BusinessService with all its methods
server.addService(BusinessServiceDefinition, {
  GetBusiness: grpcHandler.getBusiness.bind(grpcHandler),
  GetManyBusinesses: grpcHandler.getManyBusinesses.bind(grpcHandler),
  PutBusiness: grpcHandler.putBusiness.bind(grpcHandler),
  DeleteBusiness: grpcHandler.deleteBusiness.bind(grpcHandler),
});

// Start the server
server.bindAsync(
  `0.0.0.0:${port}`,
  ServerCredentials.createInsecure(),
  (err, boundPort) => {
    if (err) {
      console.error("Failed to start gRPC server:", err);
      process.exit(1);
    }

    console.log(`Business gRPC server listening on port ${boundPort}`);
  }
);

async function handleShutdown() {
  console.log("Shutting down gracefully...");
  server.forceShutdown();
  await closeDatabase();
  process.exit(0);
}

process.on("SIGINT", handleShutdown);
process.on("SIGTERM", handleShutdown);
