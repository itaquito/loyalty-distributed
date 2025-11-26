import { closeDatabase } from "@pkg/db";

import { Repository } from "../../internal/repository/postgres/postgres.ts";
import { Controller } from "../../internal/controller/customer/controller.ts";
import { BusinessGateway } from "../../internal/gateway/business/grpc/business.ts";
import { TransactionGateway } from "../../internal/gateway/transaction/grpc/transaction.ts";
import { Handler } from "../../internal/handler/http/handler.ts";

const port = parseInt(Deno.env.get("PORT") || "8080");

const repository = new Repository();
const businessGateway = new BusinessGateway();
const transactionGateway = new TransactionGateway();
const controller = new Controller(repository, businessGateway, transactionGateway);
const handler = new Handler(controller);

async function main(req: Request): Promise<Response> {
  const url = new URL(req.url);

  if (url.pathname === "/customer") {
    switch (req.method) {
      case "GET":
        return await handler.getCustomer(req);

      case "POST":
        return await handler.postCustomer(req);

      case "PUT":
        return await handler.postCustomer(req);

      case "DELETE":
        return await handler.deleteCustomer(req);

      default:
        return new Response("Method Not Allowed", {
          status: 405
        });
    }
  }

  return new Response("Not Found", {
    status: 404
  });
}

Deno.serve({ port }, main);

async function handleShutdown() {
  console.log("Shutting down gracefully...");
  businessGateway.close();
  transactionGateway.close();
  await closeDatabase();
  Deno.exit();
}

Deno.addSignalListener("SIGINT", handleShutdown);

if (Deno.build.os === "windows") {
  Deno.addSignalListener("SIGBREAK", handleShutdown);
} else {
  Deno.addSignalListener("SIGTERM", handleShutdown);
}
