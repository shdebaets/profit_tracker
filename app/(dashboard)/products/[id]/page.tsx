import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil, Plus, Receipt } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { computeAvgUnitCostCents } from "@/lib/analytics";
import { formatCents } from "@/lib/format";
import { ArchiveProductButton } from "@/components/archive-product-button";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const userId = await requireUserId();

  const product = await prisma.product.findFirst({
    where: { id, userId },
    include: {
      batches: { orderBy: { acquiredAt: "asc" } },
      sales: { orderBy: { soldAt: "desc" } },
    },
  });

  if (!product) {
    notFound();
  }

  const totalAcquired = product.batches.reduce((sum, b) => sum + b.quantity, 0);
  const totalSold = product.sales.reduce((sum, s) => sum + s.quantity, 0);
  const remaining = totalAcquired - totalSold;
  const avgUnitCostCents = computeAvgUnitCostCents(product.batches);
  const inventoryValueCents = remaining * avgUnitCostCents;

  const totalProfitCents = product.sales.reduce(
    (sum, s) => sum + (s.unitPriceCents - s.unitCostAtSaleCents) * s.quantity,
    0,
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              {product.name}
            </h1>
            {product.archived && <Badge variant="secondary">Archived</Badge>}
          </div>
          {product.sku && (
            <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Link
            href={`/products/${product.id}/edit`}
            className={buttonVariants({ variant: "outline" })}
          >
            <Pencil />
            Edit
          </Link>
          <ArchiveProductButton
            productId={product.id}
            archived={product.archived}
          />
          <Link
            href={`/products/${product.id}/batches/new`}
            className={buttonVariants({ variant: "outline" })}
          >
            <Plus />
            Add batch
          </Link>
          <Link
            href={`/products/${product.id}/sales/new`}
            className={buttonVariants()}
          >
            <Receipt />
            Record sale
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-normal text-muted-foreground">
              Remaining stock
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {remaining}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-normal text-muted-foreground">
              Avg. unit cost
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {formatCents(avgUnitCostCents)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-normal text-muted-foreground">
              Inventory value
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {formatCents(inventoryValueCents)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-normal text-muted-foreground">
              Profit to date
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {formatCents(totalProfitCents)}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Purchase batches</CardTitle>
        </CardHeader>
        <CardContent>
          {product.batches.length === 0 ? (
            <p className="py-4 text-sm text-muted-foreground">No batches yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Acquired</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Unit cost</TableHead>
                  <TableHead className="text-right">Total cost</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {product.batches.map((batch) => (
                  <TableRow key={batch.id}>
                    <TableCell>
                      {batch.acquiredAt.toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {batch.quantity}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCents(batch.unitCostCents)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCents(batch.unitCostCents * batch.quantity)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sales</CardTitle>
        </CardHeader>
        <CardContent>
          {product.sales.length === 0 ? (
            <p className="py-4 text-sm text-muted-foreground">
              No sales recorded yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sold</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Sale price</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                  <TableHead className="text-right">Profit</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {product.sales.map((sale) => {
                  const revenueCents = sale.unitPriceCents * sale.quantity;
                  const profitCents =
                    (sale.unitPriceCents - sale.unitCostAtSaleCents) *
                    sale.quantity;
                  return (
                    <TableRow key={sale.id}>
                      <TableCell>{sale.soldAt.toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        {sale.quantity}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCents(sale.unitPriceCents)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCents(revenueCents)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCents(profitCents)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link
                          href={`/products/${product.id}/sales/${sale.id}/edit`}
                          className={buttonVariants({
                            variant: "outline",
                            size: "icon",
                          })}
                        >
                          <Pencil />
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
