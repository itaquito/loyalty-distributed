<script lang="ts">
  import type { Customer } from "$lib/types";

  import { config } from "$lib/config";
  import { LoaderCircle } from '@lucide/svelte';

  interface Props {
    customerId: number;
  }

  let { customerId }: Props = $props();

  async function fetchCustomerBalance(): Promise<number> {
    const response = await fetch(`${config.apiBaseUrl}/customer?id=${customerId}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch customer details`);
    }

    const customer: Customer = await response.json();

    if (!customer.transactions || customer.transactions.length === 0) {
      return 0;
    }

    return customer.transactions.reduce((acc, transaction) => {
      return transaction.type === "DEPOSIT"
        ? acc + transaction.quantity
        : acc - transaction.quantity;
    }, 0);
  }

  let balancePromise = $state(fetchCustomerBalance());
</script>

{#await balancePromise}
  <LoaderCircle class="h-4 w-4 animate-spin text-muted-foreground" />
{:then balance}
  <span class:text-green-600={balance > 0} class:text-red-600={balance < 0}>
    {balance}
  </span>
{:catch error}
  <span class="text-muted-foreground">N/A</span>
{/await}
