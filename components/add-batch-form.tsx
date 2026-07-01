"use client";

import Link from "next/link";
import { useActionState } from "react";
import { addBatch } from "@/lib/actions/batches";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AddBatchForm({ productId }: { productId: string }) {
  const [state, formAction, isPending] = useActionState(addBatch, {});

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="productId" value={productId} />
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="quantity">Quantity purchased</Label>
          <Input
            id="quantity"
            name="quantity"
            type="number"
            min={1}
            step={1}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="unitCost">Cost per unit ($)</Label>
          <Input
            id="unitCost"
            name="unitCost"
            type="number"
            min={0}
            step="0.01"
            required
          />
        </div>
      </div>
      {state.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}
      <div className="flex gap-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Add batch"}
        </Button>
        <Button
          variant="outline"
          render={<Link href={`/products/${productId}`} />}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
