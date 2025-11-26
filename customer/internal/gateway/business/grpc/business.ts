import type { BusinessID } from "@service/business/schema";
import type { Business } from "@service/business/schema";

import { credentials, Client } from "@grpc/grpc-js";

import { GatewayError } from "@service/customer/internal/gateway/error.js";

// gRPC service definition matching business service
const BusinessServiceDefinition = {
  GetBusiness: {
    path: "/loyalty.v1.BusinessService/GetBusiness",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: any) => Buffer.from(JSON.stringify(value)),
    requestDeserialize: (value: Buffer) => JSON.parse(value.toString()),
    responseSerialize: (value: any) => Buffer.from(JSON.stringify(value)),
    responseDeserialize: (value: Buffer) => JSON.parse(value.toString()),
  },
};

interface GetBusinessRequest {
  id: number;
}

interface GetBusinessResponse {
  business: Business;
}

export class BusinessGateway {
  private client: any;

  constructor(serviceUrl = "business-service:8000") {
    this.client = new Client(
      serviceUrl,
      credentials.createInsecure(),
      {}
    );
  }

  async getBusiness(businessID: BusinessID): Promise<Business | null> {
    return new Promise((resolve, reject) => {
      this.client.makeUnaryRequest(
        BusinessServiceDefinition.GetBusiness.path,
        BusinessServiceDefinition.GetBusiness.requestSerialize,
        BusinessServiceDefinition.GetBusiness.responseDeserialize,
        { id: businessID } as GetBusinessRequest,
        (error: any, response: GetBusinessResponse) => {
          if (error) {
            // gRPC NOT_FOUND error code is 5
            if (error.code === 5) {
              return resolve(null);
            }
            console.error("Business gateway error:", error);
            return reject(new GatewayError());
          }

          resolve(response.business);
        }
      );
    });
  }

  close() {
    this.client.close();
  }
}
