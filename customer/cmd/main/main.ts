import { ConsulRegistry } from "@pkg/consul";

import { Repository } from "../../internal/repository/memory/memory.ts";
import { Controller } from "../../internal/controller/customer/controller.ts";
import { Handler } from "../../internal/handler/http/handler.ts";

const repository = new Repository();
const controller = new Controller(repository);
const handler = new Handler(controller);

function main(req: Request): Response {
  const url = new URL(req.url);

  if (url.pathname === "/customer") {
    switch (req.method) {
      case "GET":
        return handler.getCustomer(req);

      case "POST":
        return handler.postCustomer(req);

      case "PUT":
        return handler.postCustomer(req);

      case "DELETE":
        return handler.deleteCustomer(req);

      default:
        return new Response("Method Not Allowed", {
          status: 405
        })
    }
  }

  return new Response("Not Found", {
    status: 404
  });
}

Deno.serve({ port: 8000 }, main);

const consulRegistry = new ConsulRegistry("http://192.168.56.104:8500");
const instanceID = await consulRegistry.register("customer", "localhost", 8000);
console.log(`Instance ID: ${instanceID}`);

setInterval(async () => {
  await consulRegistry.reportHealthyState();
}, 1000)

async function handleShutdown() {
  await consulRegistry.deregister();

  Deno.exit();
}

Deno.addSignalListener("SIGINT", handleShutdown);

if (Deno.build.os === "windows") {
  Deno.addSignalListener("SIGBREAK", handleShutdown);
} else {
  Deno.addSignalListener("SIGTERM", handleShutdown);
}
