"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { formatCents } from "@/lib/format";
import type { ProductProfit } from "@/lib/analytics";

const chartConfig = {
  profitCents: { label: "Profit", color: "var(--chart-1)" },
} satisfies ChartConfig;

export function ProfitByProductChart({ data }: { data: ProductProfit[] }) {
  const top = data.slice(0, 8);

  return (
    <ChartContainer
      config={chartConfig}
      className="aspect-auto h-[280px] w-full"
    >
      <BarChart
        data={top}
        layout="vertical"
        margin={{ left: 8, right: 24, top: 8 }}
      >
        <CartesianGrid horizontal={false} />
        <XAxis
          type="number"
          tickLine={false}
          axisLine={false}
          tickFormatter={(value: number) => formatCents(value)}
        />
        <YAxis
          type="category"
          dataKey="name"
          tickLine={false}
          axisLine={false}
          width={110}
          tick={{ fontSize: 12 }}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value) => (
                <span className="font-mono font-medium tabular-nums">
                  {formatCents(value as number)}
                </span>
              )}
            />
          }
        />
        <Bar dataKey="profitCents" fill="var(--chart-1)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}
