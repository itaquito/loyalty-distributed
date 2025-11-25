import type { ConsulRegistry } from "@pkg/consul";
import type { BusinessID } from "@service/business/schema";

import { BusinessSchema } from "@service/business/schema";
import { GatewayError } from "../../error.ts";

export class BusinessGateway {
  private registry: ConsulRegistry;

  constructor(registry: ConsulRegistry) {
    this.registry = registry;
  }

  async getBusiness(businessID: BusinessID) {
    const addresses = await this.registry.serviceAddress("business");
    const randomIndex = Math.floor(Math.random() * addresses.length);

    const url = new URL(`http://${addresses[randomIndex].address}:${addresses[randomIndex].port}/business`);
    url.searchParams.set("id", `${businessID}`);

    const res = await fetch(url, {
      method: "GET",
    });

    if (res.status === 404) return null;

    if (!res.ok) throw new GatewayError();

    return BusinessSchema.parse(await res.json());
  }
}
