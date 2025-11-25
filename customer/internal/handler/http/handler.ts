import type { Controller } from "../../controller/customer/controller.ts";

import { ZodError } from "zod";

import { NotFoundError } from "../../controller/error.ts";
import { CustomerIDSchema, CustomerSchema } from "../../../pkg/schema/customer.ts";

export class Handler {
  private controller: Controller;

  constructor(controller: Controller) {
    this.controller = controller;
  }

  async getCustomer(req: Request) {
    try {
      const url = new URL(req.url);
      const rawID = url.searchParams.get("id");

      // Get all customers
      if (!rawID) {
        const customers = await this.controller.getMany();

        return new Response(JSON.stringify(customers), {
          status: 200,
          headers: {
            "Content-Type": "application/json"
          },
        });
      }

      // Get specific customer
      const customerID = CustomerIDSchema.parse(parseInt(rawID));
      const customer = await this.controller.get(customerID);

      return new Response(JSON.stringify(customer), {
        status: 200,
        headers: {
          "Content-Type": "application/json"
        },
      });
    } catch (error) {
      if (error instanceof ZodError) return new Response("Bad Request", {
        status: 400
      });

      if (error instanceof NotFoundError) return new Response("Customer Not Found", {
        status: 404
      });

      console.error(error)
      return new Response("Internal Server Error", {
        status: 500
      });
    }
  }

  async postCustomer(req: Request) {
    try {
      const url = new URL(req.url);
      const rawID = url.searchParams.get("id");
      const customerID = CustomerIDSchema.parse(rawID ? parseInt(rawID) : null);
      const customer = CustomerSchema.parse(await req.json());

      await this.controller.put(customerID, customer);

      return new Response("Success!", {
        status: 200
      });
    } catch (error) {
      if (error instanceof SyntaxError) return new Response("Bad Request", {
        status: 400
      });

      if (error instanceof ZodError) return new Response("Bad Request", {
        status: 400
      });

      console.error(error)
      return new Response("Internal Server Error", {
        status: 500
      });
    }
  }

  async deleteCustomer(req: Request) {
    try {
      const url = new URL(req.url);
      const rawID = url.searchParams.get("id");
      const customerID = CustomerIDSchema.parse(rawID ? parseInt(rawID) : null);

      await this.controller.delete(customerID);

      return new Response("Success!", {
        status: 200
      });
    } catch (error) {
      if (error instanceof ZodError) return new Response("Bad Request", {
        status: 400
      });

      if (error instanceof NotFoundError) return new Response("Customer Not Found", {
        status: 404
      });

      console.error(error)
      return new Response("Internal Server Error", {
        status: 500
      });
    }
  }
}
