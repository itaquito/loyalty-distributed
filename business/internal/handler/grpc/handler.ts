import type { ServerUnaryCall, sendUnaryData, UntypedHandleCall } from "@grpc/grpc-js";

import type { Controller } from "../../controller/business/controller.ts";
import { NotFoundError } from "../../controller/error.ts";

// Type definitions for our gRPC messages
interface GetBusinessRequest {
  id: number;
}

interface Business {
  id: number;
  name: string;
}

interface GetBusinessResponse {
  business: Business;
}

interface GetManyBusinessesRequest {}

interface GetManyBusinessesResponse {
  businesses: Business[];
}

interface PutBusinessRequest {
  id: number;
  name: string;
}

interface PutBusinessResponse {
  success: boolean;
}

interface DeleteBusinessRequest {
  id: number;
}

interface DeleteBusinessResponse {
  success: boolean;
}

export class GrpcHandler {
  private controller: Controller;

  constructor(controller: Controller) {
    this.controller = controller;
  }

  // Get a single business by ID
  getBusiness: UntypedHandleCall = async (
    call: ServerUnaryCall<GetBusinessRequest, GetBusinessResponse>,
    callback: sendUnaryData<GetBusinessResponse>
  ) => {
    try {
      const { id } = call.request;

      if (!id || id <= 0) {
        return callback({
          code: 3, // INVALID_ARGUMENT
          message: "Invalid business ID"
        });
      }

      const business = await this.controller.get(id);

      callback(null, { business });
    } catch (error) {
      if (error instanceof NotFoundError) {
        return callback({
          code: 5, // NOT_FOUND
          message: "Business not found"
        });
      }

      console.error("Error in getBusiness:", error);
      callback({
        code: 13, // INTERNAL
        message: "Internal server error"
      });
    }
  };

  // Get all businesses
  getManyBusinesses: UntypedHandleCall = async (
    call: ServerUnaryCall<GetManyBusinessesRequest, GetManyBusinessesResponse>,
    callback: sendUnaryData<GetManyBusinessesResponse>
  ) => {
    try {
      const businesses = await this.controller.getMany();

      callback(null, { businesses });
    } catch (error) {
      console.error("Error in getManyBusinesses:", error);
      callback({
        code: 13, // INTERNAL
        message: "Internal server error"
      });
    }
  };

  // Create or update a business
  putBusiness: UntypedHandleCall = async (
    call: ServerUnaryCall<PutBusinessRequest, PutBusinessResponse>,
    callback: sendUnaryData<PutBusinessResponse>
  ) => {
    try {
      const { id, name } = call.request;

      if (!id || id <= 0) {
        return callback({
          code: 3, // INVALID_ARGUMENT
          message: "Invalid business ID"
        });
      }

      if (!name || name.trim().length === 0) {
        return callback({
          code: 3, // INVALID_ARGUMENT
          message: "Business name cannot be empty"
        });
      }

      await this.controller.put(id, { id, name });

      callback(null, { success: true });
    } catch (error) {
      console.error("Error in putBusiness:", error);
      callback({
        code: 13, // INTERNAL
        message: "Internal server error"
      });
    }
  };

  // Delete a business
  deleteBusiness: UntypedHandleCall = async (
    call: ServerUnaryCall<DeleteBusinessRequest, DeleteBusinessResponse>,
    callback: sendUnaryData<DeleteBusinessResponse>
  ) => {
    try {
      const { id } = call.request;

      if (!id || id <= 0) {
        return callback({
          code: 3, // INVALID_ARGUMENT
          message: "Invalid business ID"
        });
      }

      await this.controller.delete(id);

      callback(null, { success: true });
    } catch (error) {
      if (error instanceof NotFoundError) {
        return callback({
          code: 5, // NOT_FOUND
          message: "Business not found"
        });
      }

      console.error("Error in deleteBusiness:", error);
      callback({
        code: 13, // INTERNAL
        message: "Internal server error"
      });
    }
  };
}
