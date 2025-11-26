<script lang="ts">
  import type { Customer } from "$lib/types";

  import { config } from "$lib/config";

  import { Ellipsis, Pencil, Trash2, Plus } from '@lucide/svelte';

  import * as Table from "$lib/components/ui/table";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
  import * as Button from "$lib/components/ui/button";

  import CreateCustomerDialog from "./CreateCustomerDialog.svelte";
  import EditCustomerDialog from "./EditCustomerDialog.svelte";
  import CreateTransactionDialog from "./CreateTransactionDialog.svelte";
  import CustomerBalance from "./CustomerBalance.svelte";

  async function fetchCustomers(): Promise<Customer[]> {
    const response = await fetch(`${config.apiBaseUrl}/customer`);

    if (!response.ok) {
      throw new Error(`Failed to fetch customers: ${response.statusText}`);
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [data];
  }

  let customersPromise = $state(fetchCustomers());
  let editingCustomer = $state<Customer | null>(null);
  let isEditDialogOpen = $state(false);
  let transactionCustomer = $state<Customer | null>(null);
  let isTransactionDialogOpen = $state(false);

  function refreshCustomers() {
    customersPromise = fetchCustomers();
  }

  function handleEdit(customer: Customer) {
    editingCustomer = customer;
    isEditDialogOpen = true;
  }

  function handleCreateTransaction(customer: Customer) {
    transactionCustomer = customer;
    isTransactionDialogOpen = true;
  }

  async function handleDelete(customer: Customer) {
    if (!confirm(`Are you sure you want to delete customer "${customer.name}"?`)) {
      return;
    }

    try {
      const response = await fetch(
        `${config.apiBaseUrl}/customer?id=${customer.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Failed to delete customer: ${response.statusText}`);
      }

      refreshCustomers();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete customer");
      console.error("Error deleting customer:", err);
    }
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
            <Table.Head class="w-[50px]"></Table.Head>
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
                <CustomerBalance customerId={customer.id} />
              </Table.Cell>

              <Table.Cell>
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger>
                    <Button.Root variant="ghost" size="icon">
                      <Ellipsis class="h-4 w-4" />
                      <span class="sr-only">Open menu</span>
                    </Button.Root>
                  </DropdownMenu.Trigger>

                  <DropdownMenu.Content align="end">
                    <DropdownMenu.Item onclick={() => handleCreateTransaction(customer)}>
                      <Plus class="mr-2 h-4 w-4" />
                      Add Transaction
                    </DropdownMenu.Item>

                    <DropdownMenu.Item onclick={() => handleEdit(customer)}>
                      <Pencil class="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenu.Item>

                    <DropdownMenu.Item onclick={() => handleDelete(customer)} class="text-destructive">
                      <Trash2 class="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Root>
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

  {#if editingCustomer}
    <EditCustomerDialog
      customer={editingCustomer}
      bind:open={isEditDialogOpen}
      onCustomerUpdated={refreshCustomers}
    />
  {/if}

  {#if transactionCustomer}
    <CreateTransactionDialog
      customerId={transactionCustomer.id}
      customerName={transactionCustomer.name}
      bind:open={isTransactionDialogOpen}
      onTransactionCreated={refreshCustomers}
    />
  {/if}
</div>
