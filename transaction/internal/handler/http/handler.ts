import type { Controller } from "@service/transaction/internal/controller/transaction/controller.js";

import { ZodError } from "zod";

import { NotFoundError, CustomerNotFoundError } from "@service/transaction/internal/controller/error.js";
import { TransactionIDSchema, TransactionSchema } from "@service/transaction/schema";
import { CustomerIDSchema } from "@service/customer/schema";

export class Handler {
  private controller: Controller;

  constructor(controller: Controller) {
    this.controller = controller;
  }

  async getTransaction(req: Request) {
    try {
      const url = new URL(req.url);
      const rawID = url.searchParams.get("id");
      const rawCustomerID = url.searchParams.get("customerID");

      // Get transactions by customerID
      if (rawCustomerID) {
        const customerID = CustomerIDSchema.parse(parseInt(rawCustomerID));
        const transactions = await this.controller.getByCustomerID(customerID);

        return new Response(JSON.stringify(transactions), {
          status: 200,
          headers: {
            "Content-Type": "application/json"
          },
        });
      }

      // Get all transactions
      if (!rawID) {
        const transactions = await this.controller.getMany();

        return new Response(JSON.stringify(transactions), {
          status: 200,
          headers: {
            "Content-Type": "application/json"
          },
        });
      }

      // Get specific transaction
      const transactionID = TransactionIDSchema.parse(parseInt(rawID));
      const transaction = await this.controller.get(transactionID);

      return new Response(JSON.stringify(transaction), {
        status: 200,
        headers: {
          "Content-Type": "application/json"
        },
      });
    } catch (error) {
      if (error instanceof ZodError) return new Response("Bad Request", {
        status: 400
      });

      if (error instanceof NotFoundError) return new Response("Transaction Not Found", {
        status: 404
      });

      console.error(error)
      return new Response("Internal Server Error", {
        status: 500
      });
    }
  }

  async postTransaction(req: Request) {
    try {
      const url = new URL(req.url);
      const rawID = url.searchParams.get("id");
      const transactionID = TransactionIDSchema.parse(rawID ? parseInt(rawID) : null);
      const transaction = TransactionSchema.parse(await req.json());

      await this.controller.put(transactionID, transaction);

      return new Response("Success!", {
        status: 200,
      });
    } catch (error) {
      if (error instanceof SyntaxError) return new Response("Bad Request", {
        status: 400
      });

      if (error instanceof ZodError) return new Response("Bad Request", {
        status: 400
      });

      if (error instanceof CustomerNotFoundError) return new Response("Customer Not Found", {
        status: 404
      });

      console.error(error)
      return new Response("Internal Server Error", {
        status: 500
      });
    }
  }

  async deleteTransaction(req: Request) {
    try {
      const url = new URL(req.url);
      const rawID = url.searchParams.get("id");
      const transactionID = TransactionIDSchema.parse(rawID ? parseInt(rawID) : null);

      await this.controller.delete(transactionID);

      return new Response("Success!", {
        status: 200,
      });
    } catch (error) {
      if (error instanceof ZodError) return new Response("Bad Request", {
        status: 400
      });

      if (error instanceof NotFoundError) return new Response("Transaction Not Found", {
        status: 404
      });

      console.error(error)
      return new Response("Internal Server Error", {
        status: 500
      });
    }
  }
}
