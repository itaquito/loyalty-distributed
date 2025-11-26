import { closeDatabase } from "@pkg/db";
import { Server, ServerCredentials } from "@grpc/grpc-js";

import { Repository } from "@service/transaction/internal/repository/postgres/postgres.js";
import { Controller } from "@service/transaction/internal/controller/transaction/controller.js";
import { GrpcHandler } from "@service/transaction/internal/handler/grpc/handler.js";
import { TransactionServiceDefinition } from "@service/transaction/internal/grpc/service.js";

const port = parseInt(process.env.PORT || "8000");

// Initialize repository, controller, and handler
const repository = new Repository();
const controller = new Controller(repository);
const grpcHandler = new GrpcHandler(controller);

// Create gRPC server
const server = new Server();

// Add the TransactionService with all its methods
server.addService(TransactionServiceDefinition, {
  GetTransaction: grpcHandler.getTransaction.bind(grpcHandler),
  GetManyTransactions: grpcHandler.getManyTransactions.bind(grpcHandler),
  GetTransactionsByCustomerID: grpcHandler.getTransactionsByCustomerID.bind(grpcHandler),
  CreateTransaction: grpcHandler.createTransaction.bind(grpcHandler),
  UpdateTransaction: grpcHandler.updateTransaction.bind(grpcHandler),
  DeleteTransaction: grpcHandler.deleteTransaction.bind(grpcHandler),
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

    console.log(`Transaction gRPC server listening on port ${boundPort}`);
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
