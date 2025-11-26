import type { ServiceDefinition } from "@grpc/grpc-js";

// Define the BusinessService without proto files
export const BusinessServiceDefinition: ServiceDefinition = {
  GetBusiness: {
    path: "/loyalty.v1.BusinessService/GetBusiness",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: unknown) => Buffer.from(JSON.stringify(value)),
    requestDeserialize: (value: Buffer) => JSON.parse(value.toString()),
    responseSerialize: (value: unknown) => Buffer.from(JSON.stringify(value)),
    responseDeserialize: (value: Buffer) => JSON.parse(value.toString()),
  },
  GetManyBusinesses: {
    path: "/loyalty.v1.BusinessService/GetManyBusinesses",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: unknown) => Buffer.from(JSON.stringify(value)),
    requestDeserialize: (value: Buffer) => JSON.parse(value.toString()),
    responseSerialize: (value: unknown) => Buffer.from(JSON.stringify(value)),
    responseDeserialize: (value: Buffer) => JSON.parse(value.toString()),
  },
  CreateBusiness: {
    path: "/loyalty.v1.BusinessService/CreateBusiness",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: unknown) => Buffer.from(JSON.stringify(value)),
    requestDeserialize: (value: Buffer) => JSON.parse(value.toString()),
    responseSerialize: (value: unknown) => Buffer.from(JSON.stringify(value)),
    responseDeserialize: (value: Buffer) => JSON.parse(value.toString()),
  },
  UpdateBusiness: {
    path: "/loyalty.v1.BusinessService/UpdateBusiness",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: unknown) => Buffer.from(JSON.stringify(value)),
    requestDeserialize: (value: Buffer) => JSON.parse(value.toString()),
    responseSerialize: (value: unknown) => Buffer.from(JSON.stringify(value)),
    responseDeserialize: (value: Buffer) => JSON.parse(value.toString()),
  },
  DeleteBusiness: {
    path: "/loyalty.v1.BusinessService/DeleteBusiness",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: unknown) => Buffer.from(JSON.stringify(value)),
    requestDeserialize: (value: Buffer) => JSON.parse(value.toString()),
    responseSerialize: (value: unknown) => Buffer.from(JSON.stringify(value)),
    responseDeserialize: (value: Buffer) => JSON.parse(value.toString()),
  },
};
