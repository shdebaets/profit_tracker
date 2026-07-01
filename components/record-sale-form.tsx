"use client";

import Link from "next/link";
import { useActionState } from "react";
import { recordSale } from "@/lib/actions/sales";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function RecordSaleForm({
  productId,
  remaining,
}: {
  productId: string;
  remaining: number;
}) {
  const [state, formAction, isPending] = useActionState(recordSale, {});

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="productId" value={productId} />
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="quantity">Quantity sold</Label>
          <Input
            id="quantity"
            name="quantity"
            type="number"
            min={1}
            max={remaining}
            step={1}
            required
          />
          <p className="text-xs text-muted-foreground">
            {remaining} unit(s) in stock
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="unitPrice">Sale price per unit ($)</Label>
          <Input
            id="unitPrice"
            name="unitPrice"
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
        <Button type="submit" disabled={isPending || remaining === 0}>
          {isPending ? "Saving..." : "Record sale"}
        </Button>
        <Link
          href={`/products/${productId}`}
          className={buttonVariants({ variant: "outline" })}
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
