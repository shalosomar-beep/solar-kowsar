import React, { useMemo } from "react";
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend,
} from "recharts";
import { useT } from "@/lib/i18n";
import { Sun, BarChart3 } from "lucide-react";

export default function SolarCharts({ items }) {
  const { t } = useT();

  const dailyData = useMemo(() => {
    return [...items]
      .filter((i) => i.usage_date)
      .sort((a, b) => (a.usage_date > b.usage_date ? 1 : -1))
      .slice(-30)
      .map((i) => ({
        date: i.usage_date.slice(5),
        production: Number(i.production_kwh) || 0,
        consumption: Number(i.consumption_kwh) || 0,
      }));
  }, [items]);

  const monthlyData = useMemo(() => {
    const map = {};
    items.forEach((i) => {
      if (!i.usage_date) return;
      const month = i.usage_date.slice(0, 7);
      if (!map[month]) map[month] = { month, production: 0, consumption: 0 };
      map[month].production += Number(i.production_kwh) || 0;
      map[month].consumption += Number(i.consumption_kwh) || 0;
    });
    return Object.values(map).sort((a, b) => (a.month > b.month ? 1 : -1));
  }, [items]);

  if (items.length === 0) return null;

  const fmt = (v) => (v != null ? Number(v).toFixed(1) : "0");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 mb-1">
          <Sun className="w-4 h-4 text-amber-500" />
          <h3 className="text-sm font-semibold text-foreground">{t("solarData.charts.daily.title")}</h3>
        </div>
        <p className="text-xs text-muted-foreground mb-4">{t("solarData.charts.daily.sub")}</p>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={dailyData}>
            <defs>
              <linearGradient id="gProd" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="gCons" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
            <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
            <Tooltip
              contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
              formatter={(v) => fmt(v)}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Area type="monotone" dataKey="production" name={t("solarData.col.production")} stroke="#f59e0b" fill="url(#gProd)" strokeWidth={2} />
            <Area type="monotone" dataKey="consumption" name={t("solarData.col.consumption")} stroke="#3b82f6" fill="url(#gCons)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 mb-1">
          <BarChart3 className="w-4 h-4 text-blue-500" />
          <h3 className="text-sm font-semibold text-foreground">{t("solarData.charts.monthly.title")}</h3>
        </div>
        <p className="text-xs text-muted-foreground mb-4">{t("solarData.charts.monthly.sub")}</p>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
            <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
            <Tooltip
              contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
              formatter={(v) => fmt(v)}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="production" name={t("solarData.col.production")} fill="#f59e0b" radius={[4, 4, 0, 0]} />
            <Bar dataKey="consumption" name={t("solarData.col.consumption")} fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}