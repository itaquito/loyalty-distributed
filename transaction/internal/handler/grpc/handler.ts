import type { ServerUnaryCall, sendUnaryData, UntypedHandleCall } from "@grpc/grpc-js";

import type { Controller } from "@service/transaction/internal/controller/transaction/controller.js";
import { NotFoundError, CustomerNotFoundError } from "@service/transaction/internal/controller/error.js";

// Type definitions for our gRPC messages
interface GetTransactionRequest {
  id: number;
}

interface Transaction {
  id: number;
  customer_id: number;
  type: "TRANSACTION_TYPE_DEPOSIT" | "TRANSACTION_TYPE_WITHDRAWAL";
  quantity: number;
}

interface GetTransactionResponse {
  transaction: Transaction;
}

interface GetManyTransactionsRequest {}

interface GetManyTransactionsResponse {
  transactions: Transaction[];
}

interface GetTransactionsByCustomerIDRequest {
  customer_id: number;
}

interface GetTransactionsByCustomerIDResponse {
  transactions: Transaction[];
}

interface CreateTransactionRequest {
  customer_id: number;
  type: "TRANSACTION_TYPE_DEPOSIT" | "TRANSACTION_TYPE_WITHDRAWAL";
  quantity: number;
}

interface UpdateTransactionRequest {
  id: number;
  customer_id: number;
  type: "TRANSACTION_TYPE_DEPOSIT" | "TRANSACTION_TYPE_WITHDRAWAL";
  quantity: number;
}

interface PutTransactionResponse {
  success: boolean;
}

interface DeleteTransactionRequest {
  id: number;
}

interface DeleteTransactionResponse {
  success: boolean;
}

// Helper to convert DB transaction type to proto enum
function toProtoType(type: string): "TRANSACTION_TYPE_DEPOSIT" | "TRANSACTION_TYPE_WITHDRAWAL" {
  return type === "DEPOSIT" ? "TRANSACTION_TYPE_DEPOSIT" : "TRANSACTION_TYPE_WITHDRAWAL";
}

// Helper to convert proto enum to DB transaction type
function fromProtoType(type: "TRANSACTION_TYPE_DEPOSIT" | "TRANSACTION_TYPE_WITHDRAWAL"): "DEPOSIT" | "WITHDRAWAL" {
  return type === "TRANSACTION_TYPE_DEPOSIT" ? "DEPOSIT" : "WITHDRAWAL";
}

export class GrpcHandler {
  private controller: Controller;

  constructor(controller: Controller) {
    this.controller = controller;
  }

  // Get a single transaction by ID
  getTransaction: UntypedHandleCall = async (
    call: ServerUnaryCall<GetTransactionRequest, GetTransactionResponse>,
    callback: sendUnaryData<GetTransactionResponse>
  ) => {
    try {
      const { id } = call.request;

      if (!id || id <= 0) {
        return callback({
          code: 3, // INVALID_ARGUMENT
          message: "Invalid transaction ID"
        });
      }

      const transaction = await this.controller.get(id);

      callback(null, {
        transaction: {
          id: transaction.id,
          customer_id: transaction.customerID,
          type: toProtoType(transaction.type),
          quantity: transaction.quantity,
        }
      });
    } catch (error) {
      if (error instanceof NotFoundError) {
        return callback({
          code: 5, // NOT_FOUND
          message: "Transaction not found"
        });
      }

      console.error("Error in getTransaction:", error);
      callback({
        code: 13, // INTERNAL
        message: "Internal server error"
      });
    }
  };

  // Get all transactions
  getManyTransactions: UntypedHandleCall = async (
    call: ServerUnaryCall<GetManyTransactionsRequest, GetManyTransactionsResponse>,
    callback: sendUnaryData<GetManyTransactionsResponse>
  ) => {
    try {
      const transactions = await this.controller.getMany();

      callback(null, {
        transactions: transactions.map(t => ({
          id: t.id,
          customer_id: t.customerID,
          type: toProtoType(t.type),
          quantity: t.quantity,
        }))
      });
    } catch (error) {
      console.error("Error in getManyTransactions:", error);
      callback({
        code: 13, // INTERNAL
        message: "Internal server error"
      });
    }
  };

  // Get transactions by customer ID
  getTransactionsByCustomerID: UntypedHandleCall = async (
    call: ServerUnaryCall<GetTransactionsByCustomerIDRequest, GetTransactionsByCustomerIDResponse>,
    callback: sendUnaryData<GetTransactionsByCustomerIDResponse>
  ) => {
    try {
      const { customer_id } = call.request;

      if (!customer_id || customer_id <= 0) {
        return callback({
          code: 3, // INVALID_ARGUMENT
          message: "Invalid customer ID"
        });
      }

      const transactions = await this.controller.getByCustomerID(customer_id);

      callback(null, {
        transactions: transactions.map(t => ({
          id: t.id,
          customer_id: t.customerID,
          type: toProtoType(t.type),
          quantity: t.quantity,
        }))
      });
    } catch (error) {
      console.error("Error in getTransactionsByCustomerID:", error);
      callback({
        code: 13, // INTERNAL
        message: "Internal server error"
      });
    }
  };

  // Create a transaction
  createTransaction: UntypedHandleCall = async (
    call: ServerUnaryCall<CreateTransactionRequest, PutTransactionResponse>,
    callback: sendUnaryData<PutTransactionResponse>
  ) => {
    try {
      const { customer_id, type, quantity } = call.request;

      if (!customer_id || customer_id <= 0) {
        return callback({
          code: 3, // INVALID_ARGUMENT
          message: "Invalid customer ID"
        });
      }

      if (!type || (type !== "TRANSACTION_TYPE_DEPOSIT" && type !== "TRANSACTION_TYPE_WITHDRAWAL")) {
        return callback({
          code: 3, // INVALID_ARGUMENT
          message: "Invalid transaction type"
        });
      }

      if (!quantity || quantity <= 0) {
        return callback({
          code: 3, // INVALID_ARGUMENT
          message: "Quantity must be positive"
        });
      }

      await this.controller.create(customer_id, fromProtoType(type), quantity);

      callback(null, { success: true });
    } catch (error) {
      if (error instanceof CustomerNotFoundError) {
        return callback({
          code: 5, // NOT_FOUND
          message: "Customer not found"
        });
      }

      console.error("Error in createTransaction:", error);
      callback({
        code: 13, // INTERNAL
        message: "Internal server error"
      });
    }
  };

  // Update a transaction
  updateTransaction: UntypedHandleCall = async (
    call: ServerUnaryCall<UpdateTransactionRequest, PutTransactionResponse>,
    callback: sendUnaryData<PutTransactionResponse>
  ) => {
    try {
      const { id, customer_id, type, quantity } = call.request;

      if (!id || id <= 0) {
        return callback({
          code: 3, // INVALID_ARGUMENT
          message: "Invalid transaction ID"
        });
      }

      if (!customer_id || customer_id <= 0) {
        return callback({
          code: 3, // INVALID_ARGUMENT
          message: "Invalid customer ID"
        });
      }

      if (!type || (type !== "TRANSACTION_TYPE_DEPOSIT" && type !== "TRANSACTION_TYPE_WITHDRAWAL")) {
        return callback({
          code: 3, // INVALID_ARGUMENT
          message: "Invalid transaction type"
        });
      }

      if (!quantity || quantity <= 0) {
        return callback({
          code: 3, // INVALID_ARGUMENT
          message: "Quantity must be positive"
        });
      }

      await this.controller.update(id, {
        id,
        customerID: customer_id,
        type: fromProtoType(type),
        quantity,
      });

      callback(null, { success: true });
    } catch (error) {
      if (error instanceof NotFoundError) {
        return callback({
          code: 5, // NOT_FOUND
          message: "Transaction not found"
        });
      }

      if (error instanceof CustomerNotFoundError) {
        return callback({
          code: 5, // NOT_FOUND
          message: "Customer not found"
        });
      }

      console.error("Error in updateTransaction:", error);
      callback({
        code: 13, // INTERNAL
        message: "Internal server error"
      });
    }
  };

  // Delete a transaction
  deleteTransaction: UntypedHandleCall = async (
    call: ServerUnaryCall<DeleteTransactionRequest, DeleteTransactionResponse>,
    callback: sendUnaryData<DeleteTransactionResponse>
  ) => {
    try {
      const { id } = call.request;

      if (!id || id <= 0) {
        return callback({
          code: 3, // INVALID_ARGUMENT
          message: "Invalid transaction ID"
        });
      }

      await this.controller.delete(id);

      callback(null, { success: true });
    } catch (error) {
      if (error instanceof NotFoundError) {
        return callback({
          code: 5, // NOT_FOUND
          message: "Transaction not found"
        });
      }

      console.error("Error in deleteTransaction:", error);
      callback({
        code: 13, // INTERNAL
        message: "Internal server error"
      });
    }
  };
}
