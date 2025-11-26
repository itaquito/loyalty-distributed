import type { ServiceDefinition } from "@grpc/grpc-js";

import { Buffer } from "node:buffer";

// Define the TransactionService without proto files
export const TransactionServiceDefinition: ServiceDefinition = {
  GetTransaction: {
    path: "/loyalty.v1.TransactionService/GetTransaction",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: unknown) => Buffer.from(JSON.stringify(value)),
    requestDeserialize: (value: Buffer) => JSON.parse(value.toString()),
    responseSerialize: (value: unknown) => Buffer.from(JSON.stringify(value)),
    responseDeserialize: (value: Buffer) => JSON.parse(value.toString()),
  },
  GetManyTransactions: {
    path: "/loyalty.v1.TransactionService/GetManyTransactions",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: unknown) => Buffer.from(JSON.stringify(value)),
    requestDeserialize: (value: Buffer) => JSON.parse(value.toString()),
    responseSerialize: (value: unknown) => Buffer.from(JSON.stringify(value)),
    responseDeserialize: (value: Buffer) => JSON.parse(value.toString()),
  },
  GetTransactionsByCustomerID: {
    path: "/loyalty.v1.TransactionService/GetTransactionsByCustomerID",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: unknown) => Buffer.from(JSON.stringify(value)),
    requestDeserialize: (value: Buffer) => JSON.parse(value.toString()),
    responseSerialize: (value: unknown) => Buffer.from(JSON.stringify(value)),
    responseDeserialize: (value: Buffer) => JSON.parse(value.toString()),
  },
  PutTransaction: {
    path: "/loyalty.v1.TransactionService/PutTransaction",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: unknown) => Buffer.from(JSON.stringify(value)),
    requestDeserialize: (value: Buffer) => JSON.parse(value.toString()),
    responseSerialize: (value: unknown) => Buffer.from(JSON.stringify(value)),
    responseDeserialize: (value: Buffer) => JSON.parse(value.toString()),
  },
  DeleteTransaction: {
    path: "/loyalty.v1.TransactionService/DeleteTransaction",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: unknown) => Buffer.from(JSON.stringify(value)),
    requestDeserialize: (value: Buffer) => JSON.parse(value.toString()),
    responseSerialize: (value: unknown) => Buffer.from(JSON.stringify(value)),
    responseDeserialize: (value: Buffer) => JSON.parse(value.toString()),
  },
};
