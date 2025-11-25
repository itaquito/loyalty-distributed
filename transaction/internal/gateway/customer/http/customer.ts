import type { CustomerID } from "@service/customer/schema";

import {  CustomerSchema } from "@service/customer/schema";
import { GatewayError } from "../../error.ts";

export class CustomerGateway {
  private serviceUrl: string;

  constructor(serviceUrl = "http://customer-service:8080") {
    this.serviceUrl = serviceUrl;
  }

  async getCustomer(customerID: CustomerID) {
    const url = new URL(`${this.serviceUrl}/customer`);
    url.searchParams.set("id", `${customerID}`);

    const res = await fetch(url, {
      method: "GET",
    });

    if (res.status === 404) return null;

    if (!res.ok) throw new GatewayError();

    return CustomerSchema.parse(await res.json());
  }
}
