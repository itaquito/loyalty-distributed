import type { CustomerID } from "@service/customer/schema";
import type { Transaction } from "@service/transaction/schema";

import { credentials, Client } from "@grpc/grpc-js";
import { Buffer } from "node:buffer";
import { GatewayError } from "../../error.ts";

// gRPC service definition matching transaction service
const TransactionServiceDefinition = {
  GetTransactionsByCustomerID: {
    path: "/loyalty.v1.TransactionService/GetTransactionsByCustomerID",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: any) => Buffer.from(JSON.stringify(value)),
    requestDeserialize: (value: Buffer) => JSON.parse(value.toString()),
    responseSerialize: (value: any) => Buffer.from(JSON.stringify(value)),
    responseDeserialize: (value: Buffer) => JSON.parse(value.toString()),
  },
};

interface GetTransactionsByCustomerIDRequest {
  customer_id: number;
}

interface TransactionProto {
  id: number;
  customer_id: number;
  type: "TRANSACTION_TYPE_DEPOSIT" | "TRANSACTION_TYPE_WITHDRAWAL";
  quantity: number;
}

interface GetTransactionsByCustomerIDResponse {
  transactions: TransactionProto[];
}

// Helper to convert proto enum to DB transaction type
function fromProtoType(type: "TRANSACTION_TYPE_DEPOSIT" | "TRANSACTION_TYPE_WITHDRAWAL"): "DEPOSIT" | "WITHDRAWAL" {
  return type === "TRANSACTION_TYPE_DEPOSIT" ? "DEPOSIT" : "WITHDRAWAL";
}

export class TransactionGateway {
  private client: any;

  constructor(serviceUrl = "transaction-service:8001") {
    this.client = new Client(
      serviceUrl,
      credentials.createInsecure(),
      {}
    );
  }

  async getTransactionsByCustomer(customerID: CustomerID): Promise<Transaction[]> {
    return new Promise((resolve, reject) => {
      this.client.makeUnaryRequest(
        TransactionServiceDefinition.GetTransactionsByCustomerID.path,
        TransactionServiceDefinition.GetTransactionsByCustomerID.requestSerialize,
        TransactionServiceDefinition.GetTransactionsByCustomerID.responseDeserialize,
        { customer_id: customerID } as GetTransactionsByCustomerIDRequest,
        (error: any, response: GetTransactionsByCustomerIDResponse) => {
          if (error) {
            console.error("Transaction gateway error:", error);
            return reject(new GatewayError());
          }

          // Convert proto transactions to DB format
          const transactions: Transaction[] = response.transactions.map(t => ({
            id: t.id,
            customerID: t.customer_id,
            type: fromProtoType(t.type),
            quantity: t.quantity,
          }));

          resolve(transactions);
        }
      );
    });
  }

  close() {
    this.client.close();
  }
}
