"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
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
  profitCents: { label: "Profit", color: "var(--chart-1)" },
} satisfies ChartConfig;

function formatPeriod(period: string) {
  const [year, month] = period.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString("en-US", {
    month: "short",
    year: "2-digit",
  });
}

export function ProfitOverTimeChart({
  data,
}: {
  data: ProfitOverTimePoint[];
}) {
  return (
    <ChartContainer
      config={chartConfig}
      className="aspect-auto h-[280px] w-full"
    >
      <AreaChart data={data} margin={{ left: 0, right: 12, top: 12 }}>
        <defs>
          <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor="var(--chart-2)"
              stopOpacity={0.35}
            />
            <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id="fillProfit" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor="var(--chart-1)"
              stopOpacity={0.45}
            />
            <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0.05} />
          </linearGradient>
        </defs>
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
        <Area
          dataKey="revenueCents"
          type="monotone"
          stroke="var(--chart-2)"
          fill="url(#fillRevenue)"
          strokeWidth={2}
        />
        <Area
          dataKey="profitCents"
          type="monotone"
          stroke="var(--chart-1)"
          fill="url(#fillProfit)"
          strokeWidth={2}
        />
      </AreaChart>
    </ChartContainer>
  );
}
