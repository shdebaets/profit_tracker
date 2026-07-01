import { prisma } from "@/lib/prisma";

export function computeAvgUnitCostCents(
  batches: { quantity: number; unitCostCents: number }[],
): number {
  const totalQuantity = batches.reduce((sum, b) => sum + b.quantity, 0);
  if (totalQuantity === 0) return 0;
  const totalCostCents = batches.reduce(
    (sum, b) => sum + b.quantity * b.unitCostCents,
    0,
  );
  return Math.round(totalCostCents / totalQuantity);
}

export async function getProductStock(productId: string) {
  const [batches, salesAgg] = await Promise.all([
    prisma.productBatch.findMany({
      where: { productId },
      select: { quantity: true, unitCostCents: true },
    }),
    prisma.sale.aggregate({
      where: { productId },
      _sum: { quantity: true },
    }),
  ]);

  const totalAcquired = batches.reduce((sum, b) => sum + b.quantity, 0);
  const totalSold = salesAgg._sum.quantity ?? 0;
  const remaining = totalAcquired - totalSold;
  const avgUnitCostCents = computeAvgUnitCostCents(batches);
  const inventoryValueCents = remaining * avgUnitCostCents;

  return {
    totalAcquired,
    totalSold,
    remaining,
    avgUnitCostCents,
    inventoryValueCents,
  };
}

export type ProductInventoryValue = {
  productId: string;
  name: string;
  remaining: number;
  valueCents: number;
};

export async function getInventoryValueByProduct(
  userId: string,
): Promise<ProductInventoryValue[]> {
  const [products, batches, salesAgg] = await Promise.all([
    prisma.product.findMany({
      where: { userId },
      select: { id: true, name: true },
    }),
    prisma.productBatch.findMany({
      where: { userId },
      select: { productId: true, quantity: true, unitCostCents: true },
    }),
    prisma.sale.groupBy({
      by: ["productId"],
      where: { userId },
      _sum: { quantity: true },
    }),
  ]);

  const batchesByProduct = new Map<
    string,
    { quantity: number; unitCostCents: number }[]
  >();
  for (const batch of batches) {
    const list = batchesByProduct.get(batch.productId) ?? [];
    list.push(batch);
    batchesByProduct.set(batch.productId, list);
  }

  const soldByProduct = new Map(
    salesAgg.map((s) => [s.productId, s._sum.quantity ?? 0]),
  );

  return products
    .map((product) => {
      const productBatches = batchesByProduct.get(product.id) ?? [];
      const totalAcquired = productBatches.reduce(
        (sum, b) => sum + b.quantity,
        0,
      );
      const totalSold = soldByProduct.get(product.id) ?? 0;
      const remaining = totalAcquired - totalSold;
      const avgUnitCostCents = computeAvgUnitCostCents(productBatches);
      return {
        productId: product.id,
        name: product.name,
        remaining,
        valueCents: remaining * avgUnitCostCents,
      };
    })
    .filter((p) => p.remaining > 0)
    .sort((a, b) => b.valueCents - a.valueCents);
}

export type DashboardSummary = {
  totalRevenueCents: number;
  totalCostCents: number;
  totalProfitCents: number;
  marginPct: number;
  inventoryValueCents: number;
  unitsInStock: number;
};

export async function getDashboardSummary(
  userId: string,
): Promise<DashboardSummary> {
  const [sales, inventoryByProduct] = await Promise.all([
    prisma.sale.findMany({
      where: { userId },
      select: { quantity: true, unitPriceCents: true, unitCostAtSaleCents: true },
    }),
    getInventoryValueByProduct(userId),
  ]);

  const totalRevenueCents = sales.reduce(
    (sum, s) => sum + s.unitPriceCents * s.quantity,
    0,
  );
  const totalCostCents = sales.reduce(
    (sum, s) => sum + s.unitCostAtSaleCents * s.quantity,
    0,
  );
  const totalProfitCents = totalRevenueCents - totalCostCents;
  const marginPct =
    totalRevenueCents === 0 ? 0 : (totalProfitCents / totalRevenueCents) * 100;
  const inventoryValueCents = inventoryByProduct.reduce(
    (sum, p) => sum + p.valueCents,
    0,
  );
  const unitsInStock = inventoryByProduct.reduce(
    (sum, p) => sum + p.remaining,
    0,
  );

  return {
    totalRevenueCents,
    totalCostCents,
    totalProfitCents,
    marginPct,
    inventoryValueCents,
    unitsInStock,
  };
}

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export type ProfitOverTimePoint = {
  period: string;
  revenueCents: number;
  costCents: number;
  profitCents: number;
};

export async function getProfitOverTime(
  userId: string,
): Promise<ProfitOverTimePoint[]> {
  const sales = await prisma.sale.findMany({
    where: { userId },
    select: {
      soldAt: true,
      quantity: true,
      unitPriceCents: true,
      unitCostAtSaleCents: true,
    },
    orderBy: { soldAt: "asc" },
  });

  const buckets = new Map<string, { revenueCents: number; costCents: number }>();
  for (const sale of sales) {
    const key = monthKey(sale.soldAt);
    const bucket = buckets.get(key) ?? { revenueCents: 0, costCents: 0 };
    bucket.revenueCents += sale.unitPriceCents * sale.quantity;
    bucket.costCents += sale.unitCostAtSaleCents * sale.quantity;
    buckets.set(key, bucket);
  }

  return Array.from(buckets.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([period, { revenueCents, costCents }]) => ({
      period,
      revenueCents,
      costCents,
      profitCents: revenueCents - costCents,
    }));
}

export type ProductProfit = {
  productId: string;
  name: string;
  profitCents: number;
};

export async function getProfitByProduct(
  userId: string,
): Promise<ProductProfit[]> {
  const sales = await prisma.sale.findMany({
    where: { userId },
    select: {
      productId: true,
      quantity: true,
      unitPriceCents: true,
      unitCostAtSaleCents: true,
      product: { select: { name: true } },
    },
  });

  const byProduct = new Map<string, { name: string; profitCents: number }>();
  for (const sale of sales) {
    const entry = byProduct.get(sale.productId) ?? {
      name: sale.product.name,
      profitCents: 0,
    };
    entry.profitCents +=
      (sale.unitPriceCents - sale.unitCostAtSaleCents) * sale.quantity;
    byProduct.set(sale.productId, entry);
  }

  return Array.from(byProduct.entries())
    .map(([productId, { name, profitCents }]) => ({
      productId,
      name,
      profitCents,
    }))
    .sort((a, b) => b.profitCents - a.profitCents);
}
