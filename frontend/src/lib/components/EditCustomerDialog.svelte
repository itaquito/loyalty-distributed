<script lang="ts">
  import type { Customer } from "$lib/types";

  import { config } from "$lib/config";

  import * as Dialog from "$lib/components/ui/dialog";
  import * as Button from "$lib/components/ui/button";
  import * as Label from "$lib/components/ui/label";
  import * as Input from "$lib/components/ui/input";

  interface Props {
    customer: Customer;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    onCustomerUpdated?: () => void;
  }

  let { customer, open = $bindable(false), onOpenChange, onCustomerUpdated }: Props = $props();

  let formData = $state({
    name: customer.name,
    businessID: customer.businessID.toString(),
  });

  let isSubmitting = $state(false);
  let error = $state<string | null>(null);

  async function handleSubmit(e: Event) {
    e.preventDefault();

    if (!formData.name || !formData.businessID) {
      error = "All fields are required";
      return;
    }

    try {
      isSubmitting = true;
      error = null;

      const response = await fetch(
        `${config.apiBaseUrl}/customer?id=${customer.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: formData.name,
            businessID: parseInt(formData.businessID),
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Failed to update customer: ${response.statusText}`);
      }

      open = false;
      onCustomerUpdated?.();
    } catch (err) {
      error = err instanceof Error ? err.message : "An unknown error occurred";
      console.error("Error updating customer:", err);
    } finally {
      isSubmitting = false;
    }
  }

  function handleOpenChange(newOpen: boolean) {
    open = newOpen;
    onOpenChange?.(newOpen);

    if (!newOpen) {
      // Reset form when dialog closes
      formData = {
        name: customer.name,
        businessID: customer.businessID.toString(),
      };
      error = null;
    }
  }
</script>

<Dialog.Root {open} onOpenChange={handleOpenChange}>
  <Dialog.Content class="sm:max-w-[425px]">
    <Dialog.Header>
      <Dialog.Title>Edit Customer</Dialog.Title>
      <Dialog.Description>
        Update customer {customer.name}.
      </Dialog.Description>
    </Dialog.Header>

    <form onsubmit={handleSubmit} class="space-y-4">
      <div class="space-y-2">
        <Label.Root for="edit-name">Name</Label.Root>
        <Input.Root
          id="edit-name"
          type="text"
          bind:value={formData.name}
          placeholder="Enter customer name"
          required
        />
      </div>

      <div class="space-y-2">
        <Label.Root for="edit-businessID">Business ID</Label.Root>
        <Input.Root
          id="edit-businessID"
          type="number"
          bind:value={formData.businessID}
          placeholder="Enter business ID"
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
          {isSubmitting ? "Updating..." : "Update Customer"}
        </Button.Root>
      </Dialog.Footer>
    </form>
  </Dialog.Content>
</Dialog.Root>
