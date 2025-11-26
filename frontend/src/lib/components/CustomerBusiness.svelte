<script lang="ts">
  import type { Customer } from "$lib/types";

  import { config } from "$lib/config";
  import { LoaderCircle } from '@lucide/svelte';

  interface Props {
    customerId: number;
  }

  let { customerId }: Props = $props();

  async function fetchCustomerBusiness(): Promise<string> {
    const response = await fetch(`${config.apiBaseUrl}/customer?id=${customerId}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch customer details`);
    }

    const customer: Customer = await response.json();

    return customer.business?.name ?? "N/A";
  }

  let businessPromise = $state(fetchCustomerBusiness());
</script>

{#await businessPromise}
  <LoaderCircle class="h-4 w-4 animate-spin text-muted-foreground" />
{:then businessName}
  <span>{businessName}</span>
{:catch}
  <span class="text-muted-foreground">N/A</span>
{/await}
