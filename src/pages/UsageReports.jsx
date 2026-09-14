import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { Zap, TrendingUp, TrendingDown, Users, BarChart3 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useT } from "@/lib/i18n";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, LineChart, Line,
} from "recharts";

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const CHART_COLORS = ["#f59e0b", "#10b981", "#3b82f6", "#a855f7", "#ec4899", "#14b8a6", "#f97316", "#8b5cf6"];

export default function UsageReports() {
  const { t } = useT();
  const [usages, setUsages] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCustomer, setFilterCustomer] = useState("all");

  useEffect(() => {
    Promise.all([
      base44.entities.DailyUsage.list("-usage_date", 2000),
      base44.entities.Customer.list(),
    ]).then(([u, c]) => {
      setUsages(u);
      setCustomers(c);
    }).finally(() => setLoading(false));
  }, []);

  const custMap = useMemo(() => {
    const m = {};
    customers.forEach((c) => { m[c.id] = c.full_name || "—"; });
    return m;
  }, [customers]);

  // Build last 12 months keys (YYYY-MM) ascending
  const months = useMemo(() => {
    const arr = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      arr.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
    }
    return arr;
  }, []);

  const monthLabel = (key) => {
    const [y, m] = key.split("-").map(Number);
    return `${MONTH_NAMES[m - 1]} ${String(y).slice(2)}`;
  };

  // Aggregate usage per month (total)
  const monthlyTotals = useMemo(() => {
    const byMonth = {};
    usages.forEach((u) => {
      if (!u.usage_date) return;
      const key = u.usage_date.slice(0, 7);
      byMonth[key] = (byMonth[key] || 0) + Number(u.kwh_used || 0);
    });
    return months
      .filter((m) => byMonth[m] !== undefined)
      .map((m) => ({ name: monthLabel(m), kwh: Number((byMonth[m] || 0).toFixed(1)) }));
  }, [usages, months]);

  // Aggregate usage per customer per month
  const customerMonthly = useMemo(() => {
    const byCustMonth = {};
    usages.forEach((u) => {
      if (!u.usage_date || !u.customer) return;
      const key = u.usage_date.slice(0, 7);
      if (!byCustMonth[u.customer]) byCustMonth[u.customer] = {};
      byCustMonth[u.customer][key] = (byCustMonth[u.customer][key] || 0) + Number(u.kwh_used || 0);
    });
    return byCustMonth;
  }, [usages]);

  // Bar chart data: grouped bars per customer per month
  const barData = useMemo(() => {
    const activeMonths = months.filter((m) =>
      Object.values(customerMonthly).some((cm) => cm[m])
    );
    return activeMonths.map((m) => {
      const row = { name: monthLabel(m) };
      Object.keys(customerMonthly).forEach((custId) => {
        if (customerMonthly[custId][m]) {
          row[custMap[custId] || custId] = Number(customerMonthly[custId][m].toFixed(1));
        }
      });
      return row;
    });
  }, [customerMonthly, months, custMap]);

  // Single customer trend (line chart) when filtered
  const customerTrend = useMemo(() => {
    if (filterCustomer === "all") return [];
    const cm = customerMonthly[filterCustomer] || {};
    return months
      .filter((m) => cm[m] !== undefined)
      .map((m) => ({ name: monthLabel(m), kwh: Number((cm[m] || 0).toFixed(1)) }));
  }, [filterCustomer, customerMonthly, months]);

  const customersWithUsage = Object.keys(customerMonthly);

  // Stats
  const totalKwh = monthlyTotals.reduce((s, d) => s + d.kwh, 0);
  const avgPerMonth = monthlyTotals.length ? (totalKwh / monthlyTotals.length).toFixed(1) : "0";
  const peakMonth = monthlyTotals.reduce((max, d) => (d.kwh > (max?.kwh || 0) ? d : max), null);
  const lastTwo = monthlyTotals.slice(-2);
  const changePct = lastTwo.length === 2 && lastTwo[0].kwh > 0
    ? (((lastTwo[1].kwh - lastTwo[0].kwh) / lastTwo[0].kwh) * 100).toFixed(1)
    : null;

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">{t("usageReports.title")}</h1>
        <p className="text-zinc-400 text-sm mt-1">{t("usageReports.subtitle")}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-amber-500/10 border border-amber-500/20 p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-zinc-400 text-xs uppercase tracking-wider">{t("usageReports.total")}</p>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-amber-400">{totalKwh.toFixed(1)} KWh</p>
          <p className="text-zinc-500 text-xs mt-1">{monthlyTotals.length} {t("usageReports.months")}</p>
        </div>
        <div className="rounded-2xl bg-blue-500/10 border border-blue-500/20 p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-zinc-400 text-xs uppercase tracking-wider">{t("usageReports.avg")}</p>
            <BarChart3 className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-blue-400">{avgPerMonth} KWh</p>
          <p className="text-zinc-500 text-xs mt-1">{t("usageReports.perMonth")}</p>
        </div>
        <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-zinc-400 text-xs uppercase tracking-wider">{t("usageReports.peak")}</p>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-400">{peakMonth ? peakMonth.kwh.toFixed(1) : "0"} KWh</p>
          <p className="text-zinc-500 text-xs mt-1">{peakMonth ? peakMonth.name : "—"}</p>
        </div>
        <div className="rounded-2xl bg-purple-500/10 border border-purple-500/20 p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-zinc-400 text-xs uppercase tracking-wider">{t("usageReports.change")}</p>
            {changePct !== null && Number(changePct) >= 0
              ? <TrendingUp className="w-4 h-4 text-purple-400" />
              : <TrendingDown className="w-4 h-4 text-purple-400" />}
          </div>
          <p className={`text-2xl font-bold ${changePct !== null && Number(changePct) >= 0 ? "text-red-400" : "text-emerald-400"}`}>
            {changePct !== null ? `${changePct}%` : "—"}
          </p>
          <p className="text-zinc-500 text-xs mt-1">{t("usageReports.changeSub")}</p>
        </div>
      </div>

      {/* Customer filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <span className="text-zinc-400 text-sm">{t("usageReports.filterCustomer")}:</span>
        <Select value={filterCustomer} onValueChange={setFilterCustomer}>
          <SelectTrigger className="w-full sm:w-64 bg-zinc-900 border-zinc-800 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("usageReports.allCustomers")}</SelectItem>
            {customersWithUsage.map((id) => (
              <SelectItem key={id} value={id}>{custMap[id] || id}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {usages.length === 0 ? (
        <div className="text-center py-20 text-zinc-500">
          <Zap className="w-12 h-12 mx-auto mb-3 text-zinc-700" />
          <p className="text-lg font-medium">{t("usageReports.empty")}</p>
          <p className="text-sm mt-1">{t("usageReports.empty.sub")}</p>
        </div>
      ) : (
        <>
          {/* Total monthly trend */}
          <div className="rounded-2xl bg-zinc-900/50 border border-zinc-800/50 p-6">
            <h3 className="text-white font-semibold mb-1 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              {t("usageReports.trend.title")}
            </h3>
            <p className="text-zinc-500 text-xs mb-6">{t("usageReports.trend.sub")}</p>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyTotals}>
                  <defs>
                    <linearGradient id="colorKwh" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="name" stroke="#71717a" fontSize={12} />
                  <YAxis stroke="#71717a" fontSize={12} />
                  <Tooltip
                    contentStyle={{ background: "#18181b", border: "1px solid #3f3f46", borderRadius: "12px", color: "#fff" }}
                    labelStyle={{ color: "#a1a1aa" }}
                  />
                  <Area type="monotone" dataKey="kwh" stroke="#f59e0b" strokeWidth={2} fill="url(#colorKwh)" name="KWh" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Per-customer comparison OR single customer trend */}
          {filterCustomer === "all" ? (
            <div className="rounded-2xl bg-zinc-900/50 border border-zinc-800/50 p-6">
              <h3 className="text-white font-semibold mb-1 flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" />
                {t("usageReports.byCustomer.title")}
              </h3>
              <p className="text-zinc-500 text-xs mb-6">{t("usageReports.byCustomer.sub")}</p>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis dataKey="name" stroke="#71717a" fontSize={12} />
                    <YAxis stroke="#71717a" fontSize={12} />
                    <Tooltip
                      contentStyle={{ background: "#18181b", border: "1px solid #3f3f46", borderRadius: "12px", color: "#fff" }}
                      labelStyle={{ color: "#a1a1aa" }}
                    />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    {customersWithUsage.map((id, i) => (
                      <Bar
                        key={id}
                        dataKey={custMap[id] || id}
                        fill={CHART_COLORS[i % CHART_COLORS.length]}
                        radius={[4, 4, 0, 0]}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl bg-zinc-900/50 border border-zinc-800/50 p-6">
              <h3 className="text-white font-semibold mb-1 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-400" />
                {custMap[filterCustomer] || filterCustomer}
              </h3>
              <p className="text-zinc-500 text-xs mb-6">{t("usageReports.customerTrend.sub")}</p>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={customerTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis dataKey="name" stroke="#71717a" fontSize={12} />
                    <YAxis stroke="#71717a" fontSize={12} />
                    <Tooltip
                      contentStyle={{ background: "#18181b", border: "1px solid #3f3f46", borderRadius: "12px", color: "#fff" }}
                      labelStyle={{ color: "#a1a1aa" }}
                    />
                    <Line type="monotone" dataKey="kwh" stroke="#3b82f6" strokeWidth={3} dot={{ r: 5, fill: "#3b82f6" }} name="KWh" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}