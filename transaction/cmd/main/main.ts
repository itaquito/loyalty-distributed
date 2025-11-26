import { closeDatabase } from "@pkg/db";
import { Server, ServerCredentials } from "@grpc/grpc-js";

import { Repository } from "../../internal/repository/postgres/postgres.ts";
import { Controller } from "../../internal/controller/transaction/controller.ts";
import { CustomerGateway } from "../../internal/gateway/customer/http/customer.ts";
import { GrpcHandler } from "../../internal/handler/grpc/handler.ts";
import { TransactionServiceDefinition } from "../../internal/grpc/service.ts";

const port = parseInt(Deno.env.get("PORT") || "8001");

// Initialize repository, controller, and handler
const repository = new Repository();
const customerGateway = new CustomerGateway();
const controller = new Controller(repository, customerGateway);
const grpcHandler = new GrpcHandler(controller);

// Create gRPC server
const server = new Server();

// Add the TransactionService with all its methods
server.addService(TransactionServiceDefinition, {
  GetTransaction: grpcHandler.getTransaction,
  GetManyTransactions: grpcHandler.getManyTransactions,
  GetTransactionsByCustomerID: grpcHandler.getTransactionsByCustomerID,
  PutTransaction: grpcHandler.putTransaction,
  DeleteTransaction: grpcHandler.deleteTransaction,
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

    console.log(`Transaction gRPC server listening on port ${boundPort}`);
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
