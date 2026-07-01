"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { formatCents } from "@/lib/format";
import type { ProfitOverTimePoint } from "@/lib/analytics";

const chartConfig = {
  revenueCents: { label: "Revenue", color: "var(--chart-2)" },
  costCents: { label: "Cost", color: "var(--chart-3)" },
} satisfies ChartConfig;

function formatPeriod(period: string) {
  const [year, month] = period.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString("en-US", {
    month: "short",
    year: "2-digit",
  });
}

export function RevenueVsCostChart({ data }: { data: ProfitOverTimePoint[] }) {
  return (
    <ChartContainer
      config={chartConfig}
      className="aspect-auto h-[280px] w-full"
    >
      <BarChart data={data} margin={{ left: 0, right: 12, top: 12 }}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="period"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={formatPeriod}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          width={64}
          tickFormatter={(value: number) => formatCents(value)}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              labelFormatter={(value) => formatPeriod(value as string)}
              formatter={(value, name) => (
                <div className="flex w-full items-center justify-between gap-4">
                  <span className="text-muted-foreground">
                    {chartConfig[name as keyof typeof chartConfig]?.label ??
                      name}
                  </span>
                  <span className="font-mono font-medium tabular-nums">
                    {formatCents(value as number)}
                  </span>
                </div>
              )}
            />
          }
        />
        <Bar dataKey="revenueCents" fill="var(--chart-2)" radius={4} />
        <Bar dataKey="costCents" fill="var(--chart-3)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}
