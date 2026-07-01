"use client";

import Link from "next/link";
import { useActionState } from "react";
import { createProduct } from "@/lib/actions/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function NewProductPage() {
  const [state, formAction, isPending] = useActionState(createProduct, {});

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Add product</h1>

      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>Product details</CardTitle>
          <CardDescription>
            Enter what you bought and how much you paid. You can add more
            batches later if you buy more at a different price.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product name</Label>
              <Input id="name" name="name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sku">SKU (optional)</Label>
              <Input id="sku" name="sku" />
            </div>
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
                {isPending ? "Saving..." : "Save product"}
              </Button>
              <Button variant="outline" render={<Link href="/products" />}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
