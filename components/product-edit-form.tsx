"use client";

import Link from "next/link";
import { useActionState } from "react";
import { updateProduct } from "@/lib/actions/products";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ProductEditForm({
  productId,
  name,
  sku,
}: {
  productId: string;
  name: string;
  sku: string | null;
}) {
  const [state, formAction, isPending] = useActionState(updateProduct, {});

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="productId" value={productId} />
      <div className="space-y-2">
        <Label htmlFor="name">Product name</Label>
        <Input id="name" name="name" defaultValue={name} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="sku">SKU (optional)</Label>
        <Input id="sku" name="sku" defaultValue={sku ?? ""} />
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
