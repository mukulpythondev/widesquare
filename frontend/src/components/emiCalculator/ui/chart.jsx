import React, { createContext, useContext, useId } from "react";
import * as RechartsPrimitive from "recharts";
import { cn } from "../../../lib/utils";

const THEMES = { light: "", dark: ".dark" };

const ChartContext = createContext(null);

function useChart() {
  const context = useContext(ChartContext);
  if (!context) throw new Error("useChart must be used within a <ChartContainer />");
  return context;
}

export const ChartContainer = React.forwardRef(function ChartContainer(
  { id, className, children, config, ...props },
  ref
) {
  const uniqueId = useId();
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`;
  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={chartId}
        ref={ref}
        className={cn(
          "flex aspect-video justify-center text-xs",
          className
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
});

const ChartStyle = ({ id, config }) => {
  const colorConfig = Object.entries(config).filter(
    ([_, config]) => config.theme || config.color
  );
  if (!colorConfig.length) return null;
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
                .map(([key, itemConfig]) => {
                  const color =
                    itemConfig.theme?.[theme] ||
                    itemConfig.color;
                  return color ? `  --color-${key}: ${color};` : null;
                })
                .join("\n")}
}
`
          )
          .join("\n"),
      }}
    />
  );
};

export const ChartTooltip = RechartsPrimitive.Tooltip;
export const ChartLegend = RechartsPrimitive.Legend;

export const ChartTooltipContent = React.forwardRef(function ChartTooltipContent(
  { active, payload, className, hideLabel = false, ...props },
  ref
) {
  const { config } = useChart();
  if (!active || !payload?.length) return null;
  return (
    <div
      ref={ref}
      className={cn(
        "grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl",
        className
      )}
      {...props}
    >
      {!hideLabel && <div className="font-medium">{payload[0]?.name}</div>}
      <div className="grid gap-1.5">
        {payload.map((item) => (
          <div key={item.dataKey} className="flex w-full flex-wrap items-center gap-2">
            <span className="text-muted-foreground">{item.name}</span>
            <span className="font-mono font-medium tabular-nums text-foreground">
              {item.value?.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
});

export const ChartLegendContent = React.forwardRef(function ChartLegendContent(
  { payload, className, legendData },
  ref
) {
  if (!payload?.length) return null;

  // Calculate total from legendData or payload
  const total = legendData
    ? legendData.reduce((sum, item) => sum + (item.value || 0), 0)
    : payload.reduce((sum, item) => sum + (item.payload?.value || 0), 0);

  return (
    <div ref={ref} className={cn("flex items-center justify-center gap-4 pt-3", className)}>
      {payload.map((item) => {
        const name = item.payload?.name || item.name;
        const value = legendData
          ? legendData.find(d => d.name === name)?.value
          : item.payload?.value;
        const percent = total ? ((value / total) * 100).toFixed(1) : 0;
        return (
          <div key={name} className="flex items-center gap-1.5">
            <div className="h-2 w-2 shrink-0 rounded-[2px]" style={{ backgroundColor: item.color }} />
            <span>{name}</span>
            <span className="font-mono">{value?.toLocaleString()}</span>
            <span className="text-xs text-gray-500">({percent}%)</span>
          </div>
        );
      })}
    </div>
  );
});