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
