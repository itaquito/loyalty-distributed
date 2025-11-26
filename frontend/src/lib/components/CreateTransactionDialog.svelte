<script lang="ts">
  import { config } from "$lib/config";

  import * as Dialog from "$lib/components/ui/dialog";
  import * as Button from "$lib/components/ui/button";
  import * as Label from "$lib/components/ui/label";
  import * as Input from "$lib/components/ui/input";

  interface Props {
    customerId: number;
    customerName: string;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    onTransactionCreated?: () => void;
  }

  let { customerId, customerName, open = $bindable(false), onOpenChange, onTransactionCreated }: Props = $props();

  let formData = $state({
    type: "DEPOSIT" as "DEPOSIT" | "WITHDRAWAL",
    quantity: "",
  });

  let isSubmitting = $state(false);
  let error = $state<string | null>(null);

  async function handleSubmit(e: Event) {
    e.preventDefault();

    if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
      error = "Quantity must be a positive number";
      return;
    }

    try {
      isSubmitting = true;
      error = null;

      const response = await fetch(
        `${config.apiBaseUrl}/customer/transaction?id=${customerId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: formData.type,
            quantity: parseFloat(formData.quantity),
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Failed to create transaction: ${response.statusText}`);
      }

      // Reset form
      formData = { type: "DEPOSIT", quantity: "" };
      open = false;
      onTransactionCreated?.();
    } catch (err) {
      error = err instanceof Error ? err.message : "An unknown error occurred";
      console.error("Error creating transaction:", err);
    } finally {
      isSubmitting = false;
    }
  }

  function handleOpenChange(newOpen: boolean) {
    open = newOpen;
    onOpenChange?.(newOpen);

    if (!newOpen) {
      // Reset form when dialog closes
      formData = { type: "DEPOSIT", quantity: "" };
      error = null;
    }
  }
</script>

<Dialog.Root {open} onOpenChange={handleOpenChange}>
  <Dialog.Content class="sm:max-w-[425px]">
    <Dialog.Header>
      <Dialog.Title>Create Transaction</Dialog.Title>
      <Dialog.Description>
        Add a new transaction for {customerName}.
      </Dialog.Description>
    </Dialog.Header>

    <form onsubmit={handleSubmit} class="space-y-4">
      <div class="space-y-2">
        <Label.Root for="type">Transaction Type</Label.Root>
        <select
          id="type"
          bind:value={formData.type}
          class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          required
        >
          <option value="DEPOSIT">Deposit</option>
          <option value="WITHDRAWAL">Withdrawal</option>
        </select>
      </div>

      <div class="space-y-2">
        <Label.Root for="quantity">Quantity</Label.Root>
        <Input.Root
          id="quantity"
          type="number"
          step="0.01"
          min="0.01"
          bind:value={formData.quantity}
          placeholder="Enter quantity"
          required
        />
      </div>

      {#if error}
        <div class="text-destructive text-sm">
          {error}
        </div>
      {/if}

      <Dialog.Footer>
        <Button.Root type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Transaction"}
        </Button.Root>
      </Dialog.Footer>
    </form>
  </Dialog.Content>
</Dialog.Root>
