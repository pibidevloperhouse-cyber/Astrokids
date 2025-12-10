"use client";

import { TrendingUp } from "lucide-react";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
      <div className="items-center pb-4">
        <div>{title}</div>
        <div>{content}</div>
      </div>
      <div className="pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto w-[100%] max-h-[250px]"
        >
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
      <CardFooter className="flex-col gap-2 text-sm">
        {chartData && (
          <div className="flex items-center gap-1">
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
      </CardFooter>
    </div>
  );
}
