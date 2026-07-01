"use client";

import Link from "next/link";
import { useActionState } from "react";
import { updateSale } from "@/lib/actions/sales";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function EditSaleForm({
  saleId,
  productId,
  quantity,
  unitPrice,
  soldAt,
  remaining,
}: {
  saleId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  soldAt: string;
  remaining: number;
}) {
  const [state, formAction, isPending] = useActionState(updateSale, {});

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="saleId" value={saleId} />
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
            defaultValue={quantity}
            required
          />
          <p className="text-xs text-muted-foreground">
            {remaining} unit(s) available, including this sale&apos;s current
            quantity
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
            defaultValue={unitPrice}
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="soldAt">Date sold</Label>
        <Input
          id="soldAt"
          name="soldAt"
          type="date"
          defaultValue={soldAt}
          required
        />
      </div>
      {state.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}
      <div className="flex gap-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Save changes"}
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
