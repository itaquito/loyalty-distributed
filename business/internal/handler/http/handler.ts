import type { Controller } from "@service/business/internal/controller/business/controller.js";

import { ZodError } from "zod";

import { NotFoundError } from "@service/business/internal/controller/error.js";
import { BusinessIDSchema, BusinessSchema } from "@service/business/schema";

export class Handler {
  private controller: Controller;

  constructor(controller: Controller) {
    this.controller = controller;
  }

  async getBusiness(req: Request) {
    try {
      const url = new URL(req.url);
      const rawID = url.searchParams.get("id");

      // Get all businesses
      if (!rawID) {
        const businesses = await this.controller.getMany();

        return new Response(JSON.stringify(businesses), {
          status: 200,
          headers: {
            "Content-Type": "application/json"
          },
        });
      }

      // Get specific business
      const businessID = BusinessIDSchema.parse(parseInt(rawID));
      const business = await this.controller.get(businessID);

      return new Response(JSON.stringify(business), {
        status: 200,
        headers: {
          "Content-Type": "application/json"
        },
      });
    } catch (error) {
      if (error instanceof ZodError) return new Response("Bad Request", {
        status: 400
      });

      if (error instanceof NotFoundError) return new Response("Business Not Found", {
        status: 404
      });

      console.error(error)
      return new Response("Internal Server Error", {
        status: 500
      });
    }
  }

  async postBusiness(req: Request) {
    try {
      const url = new URL(req.url);
      const rawID = url.searchParams.get("id");
      const businessID = BusinessIDSchema.parse(rawID ? parseInt(rawID) : null);
      const business = BusinessSchema.parse(await req.json());

      await this.controller.put(businessID, business);

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

  async deleteBusiness(req: Request) {
    try {
      const url = new URL(req.url);
      const rawID = url.searchParams.get("id");
      const businessID = BusinessIDSchema.parse(rawID ? parseInt(rawID) : null);

      await this.controller.delete(businessID);

      return new Response("Success!", {
        status: 200
      });
    } catch (error) {
      if (error instanceof ZodError) return new Response("Bad Request", {
        status: 400
      });

      if (error instanceof NotFoundError) return new Response("Business Not Found", {
        status: 404
      });

      console.error(error)
      return new Response("Internal Server Error", {
        status: 500
      });
    }
  }
}
