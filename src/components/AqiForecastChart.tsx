import React from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";

interface AqiForecastChartProps {
  data?: { hour: string; aqi: number }[];
}

export const AqiForecastChart: React.FC<AqiForecastChartProps> = ({ data = [] }) => {
  if (!data || data.length === 0) return null;

  return (
    <div className="w-full bg-card/60 backdrop-blur-md rounded-2xl p-3 border border-border/50 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-foreground">24-Hour AQI Trend & Forecast</span>
        <span className="text-[10px] text-muted-foreground font-semibold">Live & Predictive</span>
      </div>

      <div className="h-28 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="aqiGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.6} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="hour" stroke="#9ca3af" fontSize={9} tickLine={false} />
            <YAxis stroke="#9ca3af" fontSize={9} tickLine={false} axisLine={false} />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-popover border border-border px-2.5 py-1 rounded-lg shadow-md text-xs font-bold text-popover-foreground">
                      <span>{payload[0].payload.hour}: </span>
                      <span className="text-emerald-500 font-extrabold">AQI {payload[0].value}</span>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="aqi"
              stroke="#10b981"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#aqiGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
