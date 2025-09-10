import type { Controller } from "../../controller/transaction/controller.ts";

import { ZodError } from "@zod/zod";

import { NotFoundError, CustomerNotFoundError } from "../../controller/error.ts";
import { TransactionIDSchema, TransactionSchema } from "../../../pkg/model/transaction.ts";

export class Handler {
  private controller: Controller;

  constructor(controller: Controller) {
    this.controller = controller;
  }

  async getTransaction(req: Request): Response {
    try {
      const url = new URL(req.url);
      const rawID = url.searchParams.get("id");

      // Get all transactions
      if (!rawID) {
        const transactions = this.controller.getMany();

        return new Response(JSON.stringify(Object.fromEntries(transactions)), {
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

  async postTransaction(req: Request): Response {
    try {
      const url = new URL(req.url);
      const transactionID = TransactionIDSchema.parse(parseInt(url.searchParams.get("id")));
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

  deleteTransaction(req: Request): Response {
    try {
      const url = new URL(req.url);
      const transactionID = TransactionIDSchema.parse(parseInt(url.searchParams.get("id")));

      this.controller.delete(transactionID);

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
