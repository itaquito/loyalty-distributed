import type { BusinessID } from "@service/business/schema";

import { BusinessSchema } from "@service/business/schema";
import { GatewayError } from "@service/customer/internal/gateway/error.js";

export class BusinessGateway {
  private serviceUrl: string;

  constructor(serviceUrl = "http://business-service:8080") {
    this.serviceUrl = serviceUrl;
  }

  async getBusiness(businessID: BusinessID) {
    const url = new URL(`${this.serviceUrl}/business`);
    url.searchParams.set("id", `${businessID}`);

    const res = await fetch(url, {
      method: "GET",
    });

    if (res.status === 404) return null;

    if (!res.ok) throw new GatewayError();

    return BusinessSchema.parse(await res.json());
  }
}
