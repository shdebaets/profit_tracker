import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { getProductStock } from "@/lib/analytics";
import { formatCents } from "@/lib/format";
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

export default async function ProductsPage() {
  const userId = await requireUserId();

  const products = await prisma.product.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  const stocks = await Promise.all(
    products.map((product) => getProductStock(product.id)),
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
        <Link href="/products/new" className={buttonVariants()}>
          <Plus />
          Add product
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All products</CardTitle>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No products yet. Add your first product to start tracking
              profit.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead className="text-right">In stock</TableHead>
                  <TableHead className="text-right">Avg. cost</TableHead>
                  <TableHead className="text-right">
                    Inventory value
                  </TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product, i) => {
                  const stock = stocks[i];
                  return (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">
                        <Link
                          href={`/products/${product.id}`}
                          className="hover:underline"
                        >
                          {product.name}
                        </Link>
                        {product.archived && (
                          <Badge variant="secondary" className="ml-2">
                            Archived
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {product.sku || "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        {stock.remaining}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCents(stock.avgUnitCostCents)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCents(stock.inventoryValueCents)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link
                          href={`/products/${product.id}`}
                          className="text-sm underline underline-offset-4"
                        >
                          View
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
