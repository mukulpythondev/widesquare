import React from "react";
import { Pie, PieChart, Cell, ResponsiveContainer } from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "../ui/chart";

const chartConfig = {
  principal: {
    label: "Principal",
    color: "hsl(var(--chart-1))",
  },
  interest: {
    label: "Interest",
    color: "hsl(var(--chart-2))",
  },
};

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
];

export const Chart = ({ data }) => (
  <ChartContainer config={chartConfig} className="w-full max-w-[400px] min-h-[350px] bg-card rounded-xl shadow-lg p-4 sm:p-6 lg:mb-32">
    <ResponsiveContainer width="100%" height={320}>
      <PieChart>
        <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel={false} />} />
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={70}
          outerRadius={110}
          strokeWidth={2}
          label={({ name, percent }) =>
            `${name}: ${(percent * 100).toFixed(1)}%`
          }
          labelLine={false}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <ChartLegend
          content={<ChartLegendContent nameKey="name" />}
          className="mt-4 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
        />
      </PieChart>
    </ResponsiveContainer>
  </ChartContainer>
);