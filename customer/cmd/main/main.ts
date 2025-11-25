import { ConsulRegistry } from "@pkg/consul";
import { closeDatabase } from "@pkg/db";

import { Repository } from "../../internal/repository/postgres/postgres.ts";
import { Controller } from "../../internal/controller/customer/controller.ts";
import { Handler } from "../../internal/handler/http/handler.ts";

const repository = new Repository();
const controller = new Controller(repository);
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

const port = parseInt(Deno.env.get("PORT") || "8000");
const consulURL = Deno.env.get("CONSUL_URL") || "http://192.168.56.104:8500";

Deno.serve({ port }, main);

const consulRegistry = new ConsulRegistry(consulURL);
const instanceID = await consulRegistry.register("customer", "localhost", port);
console.log(`Instance ID: ${instanceID}`);

setInterval(async () => {
  await consulRegistry.reportHealthyState();
}, 1000)

async function handleShutdown() {
  await consulRegistry.deregister();
  await closeDatabase();

  Deno.exit();
}

Deno.addSignalListener("SIGINT", handleShutdown);

if (Deno.build.os === "windows") {
  Deno.addSignalListener("SIGBREAK", handleShutdown);
} else {
  Deno.addSignalListener("SIGTERM", handleShutdown);
}
