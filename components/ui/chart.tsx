"use client";

import * as React from "react";
import { AreaChart as AreaChartComponent, BarChart as BarChartComponent, LineChart as LineChartComponent, PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, XAxis, YAxis, Area, Bar, Line } from "recharts";
import { cn } from "@/lib/utils";

interface ChartProps extends React.HTMLAttributes<HTMLDivElement> {
  data: any[];
  index: string;
  categories: string[];
  colors?: string[];
  valueFormatter?: (value: number) => string;
  yAxisWidth?: number;
  showXAxis?: boolean;
  showYAxis?: boolean;
  showLegend?: boolean;
  height?: number;
}

interface DonutChartProps extends React.HTMLAttributes<HTMLDivElement> {
  data: any[];
  index: string;
  category: string;
  colors?: string[];
  valueFormatter?: (value: number) => string;
}

export function AreaChart({
  data,
  index,
  categories,
  colors = ["chart-1", "chart-2", "chart-3", "chart-4", "chart-5"],
  valueFormatter = (value: number) => value.toString(),
  yAxisWidth = 40,
  showXAxis = true,
  showYAxis = true,
  showLegend = true,
  height = 300,
  className,
  ...props
}: ChartProps) {
  return (
    <div className={cn("w-full", className)} {...props}>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChartComponent
          data={data}
          margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
        >
          {showXAxis && (
            <XAxis
              dataKey={index}
              tickLine={false}
              axisLine={false}
              fontSize={12}
              tickFormatter={(value) => value.toString()}
            />
          )}
          {showYAxis && (
            <YAxis
              width={yAxisWidth}
              tickLine={false}
              axisLine={false}
              fontSize={12}
              tickFormatter={valueFormatter}
            />
          )}
          {showLegend && (
            <Legend
              iconType="circle"
              formatter={(value) => <span className="text-sm">{value}</span>}
            />
          )}
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload) {
                return (
                  <div className="rounded-lg border bg-background p-2 shadow-sm">
                    <div className="grid grid-cols-2 gap-2">
                      {payload.map((category, i) => (
                        <div key={i} className="flex flex-col">
                          <span className="text-[0.70rem] uppercase text-muted-foreground">
                            {category.name}
                          </span>
                          <span className="font-bold text-muted-foreground">
                            {valueFormatter(category.value as number)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              }
              return null
            }}
          />
          {categories.map((category, i) => (
            <Area
              key={category}
              type="monotone"
              dataKey={category}
              stroke={`var(--${colors[i]})`}
              fill={`var(--${colors[i]})`}
              strokeWidth={2}
              dot={false}
            />
          ))}
        </AreaChartComponent>
      </ResponsiveContainer>
    </div>
  );
}

export function BarChart({
  data,
  index,
  categories,
  colors = ["chart-1", "chart-2", "chart-3", "chart-4", "chart-5"],
  valueFormatter = (value: number) => value.toString(),
  yAxisWidth = 40,
  showXAxis = true,
  showYAxis = true,
  showLegend = true,
  height = 300,
  className,
  ...props
}: ChartProps) {
  return (
    <div className={cn("w-full", className)} {...props}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChartComponent
          data={data}
          margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
        >
          {showXAxis && (
            <XAxis
              dataKey={index}
              tickLine={false}
              axisLine={false}
              fontSize={12}
              tickFormatter={(value) => value.toString()}
            />
          )}
          {showYAxis && (
            <YAxis
              width={yAxisWidth}
              tickLine={false}
              axisLine={false}
              fontSize={12}
              tickFormatter={valueFormatter}
            />
          )}
          {showLegend && (
            <Legend
              iconType="circle"
              formatter={(value) => <span className="text-sm">{value}</span>}
            />
          )}
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload) {
                return (
                  <div className="rounded-lg border bg-background p-2 shadow-sm">
                    <div className="grid grid-cols-2 gap-2">
                      {payload.map((category, i) => (
                        <div key={i} className="flex flex-col">
                          <span className="text-[0.70rem] uppercase text-muted-foreground">
                            {category.name}
                          </span>
                          <span className="font-bold text-muted-foreground">
                            {valueFormatter(category.value as number)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              }
              return null
            }}
          />
          {categories.map((category, i) => (
            <Bar
              key={category}
              dataKey={category}
              fill={`var(--${colors[i]})`}
            />
          ))}
        </BarChartComponent>
      </ResponsiveContainer>
    </div>
  );
}

export function LineChart({
  data,
  index,
  categories,
  colors = ["chart-1", "chart-2", "chart-3", "chart-4", "chart-5"],
  valueFormatter = (value: number) => value.toString(),
  yAxisWidth = 40,
  showXAxis = true,
  showYAxis = true,
  showLegend = true,
  height = 300,
  className,
  ...props
}: ChartProps) {
  return (
    <div className={cn("w-full", className)} {...props}>
      <ResponsiveContainer width="100%" height={height}>
        <LineChartComponent
          data={data}
          margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
        >
          {showXAxis && (
            <XAxis
              dataKey={index}
              tickLine={false}
              axisLine={false}
              fontSize={12}
              tickFormatter={(value) => value.toString()}
            />
          )}
          {showYAxis && (
            <YAxis
              width={yAxisWidth}
              tickLine={false}
              axisLine={false}
              fontSize={12}
              tickFormatter={valueFormatter}
            />
          )}
          {showLegend && (
            <Legend
              iconType="circle"
              formatter={(value) => <span className="text-sm">{value}</span>}
            />
          )}
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload) {
                return (
                  <div className="rounded-lg border bg-background p-2 shadow-sm">
                    <div className="grid grid-cols-2 gap-2">
                      {payload.map((category, i) => (
                        <div key={i} className="flex flex-col">
                          <span className="text-[0.70rem] uppercase text-muted-foreground">
                            {category.name}
                          </span>
                          <span className="font-bold text-muted-foreground">
                            {valueFormatter(category.value as number)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              }
              return null
            }}
          />
          {categories.map((category, i) => (
            <Line
              key={category}
              type="monotone"
              dataKey={category}
              stroke={`var(--${colors[i]})`}
              strokeWidth={2}
              dot={false}
            />
          ))}
        </LineChartComponent>
      </ResponsiveContainer>
    </div>
  );
}

export function DonutChart({
  data,
  index,
  category,
  colors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"],
  valueFormatter = (value: number) => value.toString(),
  className,
  ...props
}: DonutChartProps) {
  return (
    <div className={cn("w-full", className)} {...props}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius="60%"
            outerRadius="80%"
            paddingAngle={5}
            dataKey={category}
            nameKey={index}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip formatter={valueFormatter} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}