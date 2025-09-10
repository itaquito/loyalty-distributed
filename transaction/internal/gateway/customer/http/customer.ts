import { ConsulRegistry } from "@pkg/consul";

import { CustomerID, CustomerSchema } from "@service/customer/model";
import { GatewayError } from "../../error.ts";

export class CustomerGateway {
  private registry: ConsulRegistry;

  constructor(registry: ConsulRegistry) {
    this.registry = registry;
  }

  async getCustomer(customerID: CustomerID) {
    const addresses = await this.registry.serviceAddress("customer");
    const randomIndex = Math.floor(Math.random() * addresses.length);

    const url = new URL(`http://${addresses[randomIndex].address}:${addresses[randomIndex].port}/customer`);
    url.searchParams.set("id", customerID);

    const res = await fetch(url, {
      method: "GET",
    });

    if (res.status === 404) return null;

    if (!res.ok) throw new GatewayError();

    return CustomerSchema.parse(await res.json());
  }
}
