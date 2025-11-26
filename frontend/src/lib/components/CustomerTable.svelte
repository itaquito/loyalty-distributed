<script lang="ts">
  import type { Customer } from "$lib/types";
  import * as Table from "$lib/components/ui/table";
  import { config } from "$lib/config";
  import CreateCustomerDialog from "./CreateCustomerDialog.svelte";

  async function fetchCustomers(): Promise<Customer[]> {
    const response = await fetch(`${config.apiBaseUrl}/customer`);

    if (!response.ok) {
      throw new Error(`Failed to fetch customers: ${response.statusText}`);
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [data];
  }

  let customersPromise = $state(fetchCustomers());

  function refreshCustomers() {
    customersPromise = fetchCustomers();
  }

  function calculateBalance(transactions?: { type: string; quantity: number }[]): number {
    if (!transactions || transactions.length === 0) return 0;

    return transactions.reduce((acc, transaction) => {
      return transaction.type === "DEPOSIT"
        ? acc + transaction.quantity
        : acc - transaction.quantity;
    }, 0);
  }
</script>

<div class="w-full space-y-4">
  <div class="flex justify-between items-center">
    <h2 class="text-2xl font-bold">Customers</h2>
    <CreateCustomerDialog onCustomerCreated={refreshCustomers} />
  </div>

  {#await customersPromise}
    <div class="flex items-center justify-center p-8">
      <p class="text-muted-foreground">Loading customers...</p>
    </div>
  {:then customers}
    {#if customers.length === 0}
      <div class="flex items-center justify-center p-8">
        <p class="text-muted-foreground">No customers found</p>
      </div>
    {:else}
      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.Head class="w-[100px]">ID</Table.Head>
            <Table.Head>Name</Table.Head>
            <Table.Head>Business</Table.Head>
            <Table.Head>Business ID</Table.Head>
            <Table.Head class="text-right">Transactions</Table.Head>
            <Table.Head class="text-right">Balance</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {#each customers as customer}
            <Table.Row>
              <Table.Cell class="font-medium">{customer.id}</Table.Cell>
              <Table.Cell>{customer.name}</Table.Cell>
              <Table.Cell>{customer.business?.name ?? "N/A"}</Table.Cell>
              <Table.Cell>{customer.businessID}</Table.Cell>
              <Table.Cell class="text-right">
                {customer.transactions?.length ?? 0}
              </Table.Cell>
              <Table.Cell class="text-right">
                {calculateBalance(customer.transactions)}
              </Table.Cell>
            </Table.Row>
          {/each}
        </Table.Body>
      </Table.Root>
    {/if}
  {:catch error}
    <div class="flex items-center justify-center p-8">
      <p class="text-destructive">Error: {error.message}</p>
    </div>
  {/await}
</div>
