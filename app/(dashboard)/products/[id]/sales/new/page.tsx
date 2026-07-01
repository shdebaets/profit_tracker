import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { getProductStock } from "@/lib/analytics";
import { RecordSaleForm } from "@/components/record-sale-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function RecordSalePage({
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

  const stock = await getProductStock(product.id);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">
        Record sale for {product.name}
      </h1>

      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>Sale details</CardTitle>
          <CardDescription>
            You can record multiple sales at different prices over time.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stock.remaining === 0 ? (
            <p className="text-sm text-muted-foreground">
              There&apos;s no remaining stock for this product. Add a
              purchase batch before recording a sale.
            </p>
          ) : (
            <RecordSaleForm productId={product.id} remaining={stock.remaining} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
