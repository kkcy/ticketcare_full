'use client';

import { formatDate, formatTime } from '@/app/util';
import type { SerializedEvent } from '@/types';
import {
  Check,
  Edit,
  Package,
  Plus,
} from '@repo/design-system/components/icons';
import { Button } from '@repo/design-system/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@repo/design-system/components/ui/dialog';
import { Input } from '@repo/design-system/components/ui/input';
import { useParams } from 'next/navigation';
import React from 'react';
import { useState } from 'react';
import { updateInventory } from '../action';

interface InventoryDialogProps {
  ticketType: SerializedEvent['ticketTypes'][number];
}

export function InventoryDialog({ ticketType }: InventoryDialogProps) {
  const params = useParams();
  const slug = params.slug as string;
  const [open, setOpen] = React.useState(false);

  // Clone the inventory for local editing
  const [inventories, setInventories] = useState(
    ticketType.inventory.map((inv) => ({ ...inv, quantity: inv.quantity }))
  );

  // Track which inventory item is being edited
  const [editingInventoryId, setEditingInventoryId] = useState<string | null>(
    null
  );
  // Track the amount to increase for the currently edited inventory
  const [increaseAmount, setIncreaseAmount] = useState(0);

  // Track saving status for each inventory item
  const [savingStatus, setSavingStatus] = useState<
    Record<string, 'idle' | 'saving' | 'success' | 'error'>
  >({});
  const [errorMessages, setErrorMessages] = useState<Record<string, string>>(
    {}
  );

  // Reset the success status after a delay
  const resetSuccessStatus = (id: string) => {
    setTimeout(() => {
      setSavingStatus((prev) => ({
        ...prev,
        [id]: 'idle',
      }));
      setIncreaseAmount(0);
    }, 2000); // Reset after 2 seconds
  };

  // Start editing an inventory item
  const handleStartEdit = (id: string) => {
    setEditingInventoryId(id);
    setIncreaseAmount(0);

    // Clear any previous error
    if (errorMessages[id]) {
      setErrorMessages((prev) => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });
    }
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingInventoryId(null);
    setIncreaseAmount(0);
  };

  // Handle change in the increase amount
  const handleIncreaseAmountChange = (amount: number) => {
    if (amount < 0) {
      return; // Don't allow negative increases
    }
    setIncreaseAmount(amount);
  };

  // Save the inventory increase
  const handleSaveInventory = async (inventoryId: string) => {
    if (increaseAmount <= 0) {
      setErrorMessages((prev) => ({
        ...prev,
        [inventoryId]: 'Please enter a positive number to increase inventory',
      }));
      return;
    }

    // Update status to saving
    setSavingStatus((prev) => ({
      ...prev,
      [inventoryId]: 'saving',
    }));

    try {
      // Find the current inventory
      const currentInventory = inventories.find(
        (inv) => inv.id === inventoryId
      );
      if (!currentInventory) {
        return;
      }

      // Calculate the new quantity
      const newQuantity = currentInventory.quantity + increaseAmount;

      // Call the updateInventory function with just this item
      await updateInventory(slug, inventoryId, newQuantity);

      // Update the local inventory state
      setInventories((prev) =>
        prev.map((inv) =>
          inv.id === inventoryId ? { ...inv, quantity: newQuantity } : inv
        )
      );

      // Update status to success
      setSavingStatus((prev) => ({
        ...prev,
        [inventoryId]: 'success',
      }));

      // Reset editing state
      setEditingInventoryId(null);

      // Reset success status after delay
      resetSuccessStatus(inventoryId);
    } catch (error) {
      console.error(`Failed to update inventory ${inventoryId}:`, error);

      // Update status to error
      setSavingStatus((prev) => ({
        ...prev,
        [inventoryId]: 'error',
      }));

      // Set error message
      setErrorMessages((prev) => ({
        ...prev,
        [inventoryId]: 'Failed to update inventory',
      }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full">
          <Package className="mr-2 h-4 w-4" />
          Manage Inventory ({ticketType.inventory.length})
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Inventory for {ticketType.name}</DialogTitle>
          <DialogDescription>
            Add more tickets to each time slot
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {inventories.map((inventory) => {
            const timeSlot = inventory.timeSlot;
            const status = savingStatus[inventory.id] || 'idle';
            const errorMessage = errorMessages[inventory.id];
            const isEditing = editingInventoryId === inventory.id;

            return (
              <div key={inventory.id} className="flex flex-col border-b pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="font-medium">
                      {formatDate(timeSlot?.startTime)}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      {formatTime(timeSlot?.startTime)} -{' '}
                      {formatTime(timeSlot?.endTime)}
                    </p>
                    <div className="mt-1 flex gap-4">
                      <div className="flex flex-col">
                        <span className="text-muted-foreground text-xs">
                          Sold
                        </span>
                        <span className="font-medium">
                          {timeSlot?._count?.tickets ?? 0}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-muted-foreground text-xs">
                          Available
                        </span>
                        <span className="font-medium">
                          {inventory.quantity -
                            (timeSlot?._count?.tickets ?? 0)}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-muted-foreground text-xs">
                          Total
                        </span>
                        <span className="font-medium">
                          {inventory.quantity}
                        </span>
                      </div>
                    </div>
                  </div>

                  {isEditing ? (
                    <div className="flex flex-col items-end space-y-1">
                      <span className="font-medium text-sm">Add tickets:</span>
                      <div className="flex items-center">
                        <Plus className="mr-1 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="number"
                          min="1"
                          value={increaseAmount}
                          onChange={(e) =>
                            handleIncreaseAmountChange(
                              Number.parseInt(e.target.value || '0')
                            )
                          }
                          className="w-20"
                          autoFocus
                        />
                      </div>
                      <div className="mt-3 space-y-3">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleSaveInventory(inventory.id)}
                          disabled={status === 'saving' || increaseAmount <= 0}
                        >
                          {status === 'saving' ? 'Saving...' : 'Save'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCancelEdit}
                          disabled={status === 'saving'}
                        >
                          Cancel
                        </Button>
                      </div>
                      {errorMessage && (
                        <p className="text-destructive text-xs">
                          {errorMessage}
                        </p>
                      )}
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStartEdit(inventory.id)}
                      disabled={status === 'saving'}
                    >
                      <Edit className="mr-1 h-4 w-4" /> Edit
                    </Button>
                  )}
                </div>

                {status === 'success' && !isEditing && (
                  <div className="mt-2 flex items-center text-green-600 text-sm">
                    <Check className="mr-1 h-4 w-4" />
                    Added {increaseAmount} tickets successfully
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
