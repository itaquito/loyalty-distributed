import { closeDatabase } from "@pkg/db";
import { Server, ServerCredentials } from "@grpc/grpc-js";

import { Repository } from "../../internal/repository/postgres/postgres.ts";
import { Controller } from "../../internal/controller/business/controller.ts";
import { GrpcHandler } from "../../internal/handler/grpc/handler.ts";
import { BusinessServiceDefinition } from "../../internal/grpc/service.ts";

const port = parseInt(Deno.env.get("PORT") || "8000");

// Initialize repository, controller, and handler
const repository = new Repository();
const controller = new Controller(repository);
const grpcHandler = new GrpcHandler(controller);

// Create gRPC server
const server = new Server();

// Add the BusinessService with all its methods
server.addService(BusinessServiceDefinition, {
  GetBusiness: grpcHandler.getBusiness,
  GetManyBusinesses: grpcHandler.getManyBusinesses,
  PutBusiness: grpcHandler.putBusiness,
  DeleteBusiness: grpcHandler.deleteBusiness,
});

// Start the server
server.bindAsync(
  `0.0.0.0:${port}`,
  ServerCredentials.createInsecure(),
  (err, boundPort) => {
    if (err) {
      console.error("Failed to start gRPC server:", err);
      Deno.exit(1);
    }

    console.log(`Business gRPC server listening on port ${boundPort}`);
  }
);

async function handleShutdown() {
  console.log("Shutting down gracefully...");
  server.forceShutdown();
  await closeDatabase();
  Deno.exit();
}

Deno.addSignalListener("SIGINT", handleShutdown);

if (Deno.build.os === "windows") {
  Deno.addSignalListener("SIGBREAK", handleShutdown);
} else {
  Deno.addSignalListener("SIGTERM", handleShutdown);
}
