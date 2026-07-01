"use client";

import { Cell, Pie, PieChart } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { formatCents } from "@/lib/format";
import type { ProductInventoryValue } from "@/lib/analytics";

const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

export function InventoryValueChart({
  data,
}: {
  data: ProductInventoryValue[];
}) {
  const top = data.slice(0, 5);
  const chartConfig = Object.fromEntries(
    top.map((p, i) => [
      p.productId,
      { label: p.name, color: COLORS[i % COLORS.length] },
    ]),
  ) satisfies ChartConfig;

  return (
    <ChartContainer
      config={chartConfig}
      className="aspect-auto h-[280px] w-full [&_.recharts-pie-label-text]:fill-foreground"
    >
      <PieChart>
        <ChartTooltip
          content={
            <ChartTooltipContent
              nameKey="name"
              formatter={(value, _name, item) => (
                <div className="flex w-full items-center justify-between gap-4">
                  <span className="text-muted-foreground">
                    {item.payload.name}
                  </span>
                  <span className="font-mono font-medium tabular-nums">
                    {formatCents(value as number)}
                  </span>
                </div>
              )}
            />
          }
        />
        <Pie
          data={top}
          dataKey="valueCents"
          nameKey="name"
          innerRadius={60}
          outerRadius={100}
          strokeWidth={2}
        >
          {top.map((entry, index) => (
            <Cell key={entry.productId} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
      </PieChart>
    </ChartContainer>
  );
}
