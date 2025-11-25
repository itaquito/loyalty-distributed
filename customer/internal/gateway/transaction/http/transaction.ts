import type { ConsulRegistry } from "@pkg/consul";
import type { CustomerID } from "@service/customer/schema";
import type { Transaction } from "@service/transaction/schema";

import { TransactionSchema } from "@service/transaction/schema";
import { GatewayError } from "../../error.ts";
import { z } from "zod";

export class TransactionGateway {
  private registry: ConsulRegistry;

  constructor(registry: ConsulRegistry) {
    this.registry = registry;
  }

  async getTransactionsByCustomer(customerID: CustomerID): Promise<Transaction[]> {
    const addresses = await this.registry.serviceAddress("transaction");
    const randomIndex = Math.floor(Math.random() * addresses.length);

    const url = new URL(`http://${addresses[randomIndex].address}:${addresses[randomIndex].port}/transaction`);
    url.searchParams.set("customerID", `${customerID}`);

    const res = await fetch(url, {
      method: "GET",
    });

    if (!res.ok) throw new GatewayError();

    return z.array(TransactionSchema).parse(await res.json());
  }
}
