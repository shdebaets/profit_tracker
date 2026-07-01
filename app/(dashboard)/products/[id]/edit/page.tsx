import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { ProductEditForm } from "@/components/product-edit-form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const userId = await requireUserId();

  const product = await prisma.product.findFirst({
    where: { id, userId },
  });

  if (!product) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Edit product</h1>

      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>Product details</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductEditForm
            productId={product.id}
            name={product.name}
            sku={product.sku}
          />
        </CardContent>
      </Card>
    </div>
  );
}
