"use client";

import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

export const description = "A radar chart";

const chartConfig = {
  value: {
    label: "Value",
    color: "var(--chart-4)",
  },
};

export default function Chart({ title, content, chartData }) {
  return (
    <div>
      <div className="flex flex-col items-center pb-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground">{content}</p>
      </div>
      <div className="pb-0">
        <ChartContainer config={chartConfig}>
          <RadarChart data={chartData}>
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <PolarAngleAxis dataKey="element" className="" />
            <PolarGrid />
            <Radar
              dataKey="value"
              fill="var(--color-desktop)"
              fillOpacity={0.6}
            />
          </RadarChart>
        </ChartContainer>
      </div>
      <div className="flex-col gap-2 text-sm">
        {chartData && (
          <div
            className={`grid grid-cols-3 md:grid-cols-${
              chartData.length < 4 ? chartData.length : 4
            } xl:grid-cols-${chartData.length} place-items-center gap-3`}
          >
            {chartData.map((data) => (
              <div
                key={data.element}
                className="flex items-center gap-1 rounded-full bg-muted px-2 py-1"
              >
                <span className="h-2 w-2 rounded-full bg-red-200"></span>
                <span>
                  {data.element}: {Math.round(data.value)} %
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
