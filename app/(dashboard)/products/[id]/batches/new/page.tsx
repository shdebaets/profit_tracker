import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { AddBatchForm } from "@/components/add-batch-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function AddBatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const userId = await requireUserId();

  const product = await prisma.product.findFirst({
    where: { id, userId },
    select: { id: true, name: true },
  });

  if (!product) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">
        Add batch to {product.name}
      </h1>

      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>New purchase batch</CardTitle>
          <CardDescription>
            Record another purchase of this product, even at a different
            cost. This updates the average cost used for profit
            calculations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AddBatchForm productId={product.id} />
        </CardContent>
      </Card>
    </div>
  );
}
