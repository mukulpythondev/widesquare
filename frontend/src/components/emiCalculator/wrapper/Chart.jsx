// Chart.jsx
import React, { createContext, useContext, useId } from "react";
import {
  Pie,
  PieChart,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const ChartContext = createContext(null);

const chartConfig = {
  principal: {
    label: "Principal",
    color: "#E76E50",
  },
  interest: {
    label: "Interest",
    color: "#2A9D90",
  },
};

const COLORS = Object.values(chartConfig).map((conf) => conf.color);

export const Chart = ({ data }) => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="text-center text-sm text-gray-500">
        No data available.
      </div>
    );
  }

  const total = data.reduce((acc, cur) => acc + cur.value, 0);

  return (
    <div className="w-full max-w-[400px] min-h-[60vh] mx-auto bg-white rounded-xl shadow-lg p-4 flex items-center justify-center">
      <ChartContext.Provider value={{ config: chartConfig }}>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Tooltip content={<CustomTooltip />} />
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={70}
              outerRadius={110}
              stroke="#fff"
              strokeWidth={2}
              labelLine={false}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Legend
              content={<CustomLegend total={total} />}
              layout="horizontal"
              verticalAlign="bottom"
              align="center"
            />
          </PieChart>
        </ResponsiveContainer>
      </ChartContext.Provider>
    </div>
  );
};

// Custom Tooltip
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const item = payload[0];
    return (
      <div className="bg-white p-2 border rounded shadow text-xs">
        <strong>{item.name}</strong>: {item.value.toLocaleString()}
      </div>
    );
  }
  return null;
};

// Custom Legend
const CustomLegend = ({ payload, total }) => {
  if (!payload?.length) return null;

  return (
    <div className="flex flex-wrap justify-center gap-4 mt-4 text-sm">
      {payload.map((item) => {
        const percent = total
          ? ((item.payload.value / total) * 100).toFixed(1)
          : 0;
        return (
          <div key={item.value} className="flex items-center gap-1.5">
            <span
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: item.color }}
            />
            <span>{item.value.toLocaleString()}</span>
            <span className="text-gray-500 text-xs">({percent}%)</span>
          </div>
        );
      })}
    </div>
  );
};
