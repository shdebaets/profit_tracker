import { requireUserId } from "@/lib/session";
import {
  getDashboardSummary,
  getInventoryValueByProduct,
  getProfitByProduct,
  getProfitOverTime,
} from "@/lib/analytics";
import { formatCents } from "@/lib/format";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ProfitOverTimeChart } from "@/components/charts/profit-over-time-chart";
import { RevenueVsCostChart } from "@/components/charts/revenue-vs-cost-chart";
import { ProfitByProductChart } from "@/components/charts/profit-by-product-chart";
import { InventoryValueChart } from "@/components/charts/inventory-value-chart";

export default async function DashboardPage() {
  const userId = await requireUserId();

  const [summary, profitOverTime, profitByProduct, inventoryByProduct] =
    await Promise.all([
      getDashboardSummary(userId),
      getProfitOverTime(userId),
      getProfitByProduct(userId),
      getInventoryValueByProduct(userId),
    ]);

  const hasSales = profitOverTime.length > 0;
  const hasInventory = inventoryByProduct.length > 0;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        <SummaryCard
          label="Revenue"
          value={formatCents(summary.totalRevenueCents)}
        />
        <SummaryCard
          label="Cost of goods sold"
          value={formatCents(summary.totalCostCents)}
        />
        <SummaryCard
          label="Profit"
          value={formatCents(summary.totalProfitCents)}
          highlight
        />
        <SummaryCard
          label="Margin"
          value={`${summary.marginPct.toFixed(1)}%`}
        />
        <SummaryCard
          label="Inventory value"
          value={formatCents(summary.inventoryValueCents)}
        />
        <SummaryCard
          label="Units in stock"
          value={summary.unitsInStock.toLocaleString()}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profit over time</CardTitle>
            <CardDescription>
              Monthly revenue and profit from recorded sales.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {hasSales ? (
              <ProfitOverTimeChart data={profitOverTime} />
            ) : (
              <EmptyChartState message="Record a sale to see profit trends here." />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue vs. cost</CardTitle>
            <CardDescription>
              Monthly revenue compared to cost of goods sold.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {hasSales ? (
              <RevenueVsCostChart data={profitOverTime} />
            ) : (
              <EmptyChartState message="Record a sale to see this breakdown." />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Profit by product</CardTitle>
            <CardDescription>
              Your best (and worst) performing products.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {profitByProduct.length > 0 ? (
              <ProfitByProductChart data={profitByProduct} />
            ) : (
              <EmptyChartState message="No sales recorded yet." />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inventory value by product</CardTitle>
            <CardDescription>
              Where your remaining stock value sits.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {hasInventory ? (
              <InventoryValueChart data={inventoryByProduct} />
            ) : (
              <EmptyChartState message="Add a product to see inventory value here." />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-normal text-muted-foreground">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent
        className={`text-xl font-semibold ${highlight ? "text-primary" : ""}`}
      >
        {value}
      </CardContent>
    </Card>
  );
}

function EmptyChartState({ message }: { message: string }) {
  return (
    <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}
