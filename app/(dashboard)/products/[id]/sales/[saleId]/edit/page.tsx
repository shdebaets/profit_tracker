import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { getProductStock } from "@/lib/analytics";
import { EditSaleForm } from "@/components/edit-sale-form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function EditSalePage({
  params,
}: {
  params: Promise<{ id: string; saleId: string }>;
}) {
  const { id, saleId } = await params;
  const userId = await requireUserId();

  const sale = await prisma.sale.findFirst({
    where: { id: saleId, productId: id, userId },
    include: { product: { select: { name: true } } },
  });

  if (!sale) {
    notFound();
  }

  const stock = await getProductStock(sale.productId);
  const remaining = stock.remaining + sale.quantity;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">
        Edit sale for {sale.product.name}
      </h1>

      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>Sale details</CardTitle>
        </CardHeader>
        <CardContent>
          <EditSaleForm
            saleId={sale.id}
            productId={sale.productId}
            quantity={sale.quantity}
            unitPrice={sale.unitPriceCents / 100}
            soldAt={sale.soldAt.toISOString().slice(0, 10)}
            remaining={remaining}
          />
        </CardContent>
      </Card>
    </div>
  );
}
