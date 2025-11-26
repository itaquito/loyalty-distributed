<script lang="ts">
  import { config } from "$lib/config";
  import * as Dialog from "$lib/components/ui/dialog";
  import * as Button from "$lib/components/ui/button";
  import * as Label from "$lib/components/ui/label";
  import * as Input from "$lib/components/ui/input";

  interface Props {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    onCustomerCreated?: () => void;
  }

  let { open = $bindable(false), onOpenChange, onCustomerCreated }: Props = $props();

  let formData = $state({
    id: "",
    name: "",
    businessID: "",
  });

  let isSubmitting = $state(false);
  let error = $state<string | null>(null);

  async function handleSubmit(e: Event) {
    e.preventDefault();

    if (!formData.id || !formData.name || !formData.businessID) {
      error = "All fields are required";
      return;
    }

    try {
      isSubmitting = true;
      error = null;

      const response = await fetch(
        `${config.apiBaseUrl}/customer?id=${formData.id}`,
        {
          method: "POST",
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
        throw new Error(errorText || `Failed to create customer: ${response.statusText}`);
      }

      // Reset form
      formData = { id: "", name: "", businessID: "" };
      open = false;
      onCustomerCreated?.();
    } catch (err) {
      error = err instanceof Error ? err.message : "An unknown error occurred";
      console.error("Error creating customer:", err);
    } finally {
      isSubmitting = false;
    }
  }

  function handleOpenChange(newOpen: boolean) {
    open = newOpen;
    onOpenChange?.(newOpen);

    if (!newOpen) {
      // Reset form when dialog closes
      formData = { id: "", name: "", businessID: "" };
      error = null;
    }
  }
</script>

<Dialog.Root {open} onOpenChange={handleOpenChange}>
  <Dialog.Trigger>
    Create Customer
  </Dialog.Trigger>
  <Dialog.Content class="sm:max-w-[425px]">
    <Dialog.Header>
      <Dialog.Title>Create New Customer</Dialog.Title>
      <Dialog.Description>
        Add a new customer to the loyalty system. All fields are required.
      </Dialog.Description>
    </Dialog.Header>

    <form onsubmit={handleSubmit} class="space-y-4">
      <div class="space-y-2">
        <Label.Root for="id">Customer ID</Label.Root>
        <Input.Root
          id="id"
          type="number"
          bind:value={formData.id}
          placeholder="Enter customer ID"
          required
        />
      </div>

      <div class="space-y-2">
        <Label.Root for="name">Name</Label.Root>
        <Input.Root
          id="name"
          type="text"
          bind:value={formData.name}
          placeholder="Enter customer name"
          required
        />
      </div>

      <div class="space-y-2">
        <Label.Root for="businessID">Business ID</Label.Root>
        <Input.Root
          id="businessID"
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
          {isSubmitting ? "Creating..." : "Create Customer"}
        </Button.Root>
      </Dialog.Footer>
    </form>
  </Dialog.Content>
</Dialog.Root>
