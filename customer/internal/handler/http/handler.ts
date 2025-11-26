import type { Request, Response } from "express";
import type { Controller } from "@service/customer/internal/controller/customer/controller.js";

import { ZodError } from "zod";

import { NotFoundError, BusinessNotFoundError } from "@service/customer/internal/controller/error.js";
import { CustomerIDSchema, CustomerSchema } from "@service/customer/schema";

export class Handler {
  private controller: Controller;

  constructor(controller: Controller) {
    this.controller = controller;
  }

  async getCustomer(req: Request, res: Response) {
    try {
      const rawID = req.query.id as string | undefined;

      // Get all customers
      if (!rawID) {
        const customers = await this.controller.getMany();
        return res.status(200).json(customers);
      }

      // Get specific customer
      const customerID = CustomerIDSchema.parse(parseInt(rawID));
      const customer = await this.controller.get(customerID);

      return res.status(200).json(customer);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).send("Bad Request");
      }

      if (error instanceof NotFoundError) {
        return res.status(404).send("Customer Not Found");
      }

      if (error instanceof BusinessNotFoundError) {
        return res.status(404).send("Business Not Found");
      }

      console.error(error);
      return res.status(500).send("Internal Server Error");
    }
  }

  async createCustomer(req: Request, res: Response) {
    try {
      const { businessID, name } = req.body;

      if (!businessID || !name) {
        return res.status(400).send("Bad Request: businessID and name are required");
      }

      if (typeof businessID !== 'number' || businessID <= 0) {
        return res.status(400).send("Bad Request: businessID must be a positive number");
      }

      if (typeof name !== 'string' || name.trim().length === 0) {
        return res.status(400).send("Bad Request: name cannot be empty");
      }

      await this.controller.create(businessID, name);

      return res.status(200).send("Success!");
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).send("Bad Request");
      }

      if (error instanceof BusinessNotFoundError) {
        return res.status(404).send("Business Not Found");
      }

      console.error(error);
      return res.status(500).send("Internal Server Error");
    }
  }

  async updateCustomer(req: Request, res: Response) {
    try {
      const rawID = req.query.id as string | undefined;
      const customerID = CustomerIDSchema.parse(rawID ? parseInt(rawID) : null);

      const { businessID, name } = req.body;

      if (!businessID || !name) {
        return res.status(400).send("Bad Request: businessID and name are required");
      }

      if (typeof businessID !== 'number' || businessID <= 0) {
        return res.status(400).send("Bad Request: businessID must be a positive number");
      }

      if (typeof name !== 'string' || name.trim().length === 0) {
        return res.status(400).send("Bad Request: name cannot be empty");
      }

      await this.controller.update(customerID, { id: customerID, businessID, name });

      return res.status(200).send("Success!");
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).send("Bad Request");
      }

      if (error instanceof NotFoundError) {
        return res.status(404).send("Customer Not Found");
      }

      if (error instanceof BusinessNotFoundError) {
        return res.status(404).send("Business Not Found");
      }

      console.error(error);
      return res.status(500).send("Internal Server Error");
    }
  }

  async deleteCustomer(req: Request, res: Response) {
    try {
      const rawID = req.query.id as string | undefined;
      const customerID = CustomerIDSchema.parse(rawID ? parseInt(rawID) : null);

      await this.controller.delete(customerID);

      return res.status(200).send("Success!");
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).send("Bad Request");
      }

      if (error instanceof NotFoundError) {
        return res.status(404).send("Customer Not Found");
      }

      console.error(error);
      return res.status(500).send("Internal Server Error");
    }
  }

  async createTransaction(req: Request, res: Response) {
    try {
      const rawID = req.query.id as string | undefined;
      const customerID = CustomerIDSchema.parse(rawID ? parseInt(rawID) : null);

      const { type, quantity } = req.body;

      if (!type || (type !== "DEPOSIT" && type !== "WITHDRAWAL")) {
        return res.status(400).send("Bad Request: type must be DEPOSIT or WITHDRAWAL");
      }

      if (typeof quantity !== 'number' || quantity <= 0) {
        return res.status(400).send("Bad Request: quantity must be a positive number");
      }

      await this.controller.createTransaction(customerID, type, quantity);

      return res.status(200).send("Success!");
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).send("Bad Request");
      }

      if (error instanceof NotFoundError) {
        return res.status(404).send("Customer Not Found");
      }

      console.error(error);
      return res.status(500).send("Internal Server Error");
    }
  }
}
