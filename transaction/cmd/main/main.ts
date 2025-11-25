import { closeDatabase } from "@pkg/db";

import { Repository } from "../../internal/repository/postgres/postgres.ts";
import { Controller } from "../../internal/controller/transaction/controller.ts";
import { CustomerGateway } from "../../internal/gateway/customer/http/customer.ts";
import { Handler } from "../../internal/handler/http/handler.ts";

const port = parseInt(Deno.env.get("PORT") || "8080");

const repository = new Repository();
const customerGateway = new CustomerGateway();
const controller = new Controller(repository, customerGateway);
const handler = new Handler(controller);

async function main(req: Request): Promise<Response> {
  const url = new URL(req.url);

  if (url.pathname === "/transaction") {
    switch (req.method) {
      case "GET":
        return await handler.getTransaction(req);

      case "POST":
        return await handler.postTransaction(req);

      case "PUT":
        return await handler.postTransaction(req);

      case "DELETE":
        return await handler.deleteTransaction(req);

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
  await closeDatabase();
  Deno.exit();
}

Deno.addSignalListener("SIGINT", handleShutdown);

if (Deno.build.os === "windows") {
  Deno.addSignalListener("SIGBREAK", handleShutdown);
} else {
  Deno.addSignalListener("SIGTERM", handleShutdown);
}
