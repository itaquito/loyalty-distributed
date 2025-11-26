import express from "express";
import { closeDatabase } from "@pkg/db";

import { Repository } from "@service/customer/internal/repository/postgres/postgres.js";
import { Controller } from "@service/customer/internal/controller/customer/controller.js";
import { BusinessGateway } from "@service/customer/internal/gateway/business/grpc/business.js";
import { TransactionGateway } from "@service/customer/internal/gateway/transaction/grpc/transaction.js";
import { Handler } from "@service/customer/internal/handler/http/handler.js";

const port = parseInt(process.env.PORT || "8080");

const repository = new Repository();
const businessGateway = new BusinessGateway();
const transactionGateway = new TransactionGateway();
const controller = new Controller(repository, businessGateway, transactionGateway);
const handler = new Handler(controller);

const app = express();

// Enable CORS for all origins
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

app.use(express.json());

app.get("/customer", (req, res) => handler.getCustomer(req, res));
app.post("/customer", (req, res) => handler.createCustomer(req, res));
app.put("/customer", (req, res) => handler.updateCustomer(req, res));
app.delete("/customer", (req, res) => handler.deleteCustomer(req, res));
app.post("/customer/transaction", (req, res) => handler.createTransaction(req, res));

const server = app.listen(port, () => {
  console.log(`Customer HTTP server listening on port ${port}`);
});

async function handleShutdown() {
  console.log("Shutting down gracefully...");
  server.close();
  businessGateway.close();
  transactionGateway.close();
  await closeDatabase();
  process.exit(0);
}

process.on("SIGINT", handleShutdown);
process.on("SIGTERM", handleShutdown);
