import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { TrendingUp, AlertCircle, DollarSign, FileText, Download, Zap, Users, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { generateFinancialPDF } from "@/utils/pdfExport";

export default function FinancialReport() {
  const [billings, setBillings] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const { toast } = useToast();

  useEffect(() => {
    Promise.all([
      base44.entities.Billing.list("-created_date"),
      base44.entities.Customer.list(),
    ]).then(([b, c]) => {
      setBillings(b);
      setCustomers(c);
    }).finally(() => setLoading(false));
  }, []);

  const getCustomerName = (id) => customers.find((c) => c.id === id)?.full_name || "—";
  const getCustomerEmail = (id) => customers.find((c) => c.id === id)?.email || "";

  // Filter bills for the selected month
  const monthBills = billings.filter((b) => b.billing_month?.startsWith(selectedMonth));

  const paidBills = monthBills.filter((b) => b.status === "paid");
  const pendingBills = monthBills.filter((b) => b.status === "pending");
  const overdueBills = monthBills.filter((b) => b.status === "overdue");

  const totalCollected = paidBills.reduce((s, b) => s + (b.total_amount || 0), 0);
  const totalPending = pendingBills.reduce((s, b) => s + (b.total_amount || 0), 0);
  const totalOverdue = overdueBills.reduce((s, b) => s + (b.total_amount || 0), 0);
  const totalOutstanding = totalPending + totalOverdue;
  const totalBilled = monthBills.reduce((s, b) => s + (b.total_amount || 0), 0);
  const totalKwh = monthBills.reduce((s, b) => s + (b.kwh_used || 0), 0);

  // Per-customer breakdown
  const customerMap = {};
  monthBills.forEach((b) => {
    if (!customerMap[b.customer]) {
      customerMap[b.customer] = { name: getCustomerName(b.customer), paid: 0, pending: 0, overdue: 0, total: 0, kwh: 0, bills: 0 };
    }
    const amt = b.total_amount || 0;
    if (b.status === "paid") customerMap[b.customer].paid += amt;
    else if (b.status === "pending") customerMap[b.customer].pending += amt;
    else if (b.status === "overdue") customerMap[b.customer].overdue += amt;
    customerMap[b.customer].total += amt;
    customerMap[b.customer].kwh += b.kwh_used || 0;
    customerMap[b.customer].bills += 1;
  });
  const customerBreakdown = Object.values(customerMap).sort((a, b) => b.total - a.total);

  // Pie chart data
  const pieData = [
    { name: "La Bixiyay", value: totalCollected, color: "#10b981" },
    { name: "Sugaya", value: totalPending, color: "#f59e0b" },
    { name: "Dhaafay", value: totalOverdue, color: "#ef4444" },
  ].filter((d) => d.value > 0);

  // Bar chart: top customers by outstanding
  const topOutstanding = customerBreakdown
    .filter((c) => c.pending + c.overdue > 0)
    .slice(0, 8)
    .map((c) => ({ name: c.name, lacag: c.pending + c.overdue }));

  // Previous month for comparison
  const prevDate = new Date(selectedMonth + "-01");
  prevDate.setMonth(prevDate.getMonth() - 1);
  const prevMonthKey = prevDate.toISOString().slice(0, 7);
  const prevMonthBills = billings.filter((b) => b.billing_month?.startsWith(prevMonthKey));
  const prevRevenue = prevMonthBills.filter((b) => b.status === "paid").reduce((s, b) => s + (b.total_amount || 0), 0);
  const prevKwh = prevMonthBills.reduce((s, b) => s + (b.kwh_used || 0), 0);
  const prevCustomerCount = new Set(prevMonthBills.map((b) => b.customer)).size;

  const revenueChange = prevRevenue > 0 ? (((totalCollected - prevRevenue) / prevRevenue) * 100).toFixed(1) : null;
  const kwhChange = prevKwh > 0 ? (((totalKwh - prevKwh) / prevKwh) * 100).toFixed(1) : null;
  const activeCustomerCount = new Set(monthBills.map((b) => b.customer)).size;
  const customerChange = prevCustomerCount > 0 ? (((activeCustomerCount - prevCustomerCount) / prevCustomerCount) * 100).toFixed(1) : null;
  const avgKwhPerCustomer = activeCustomerCount > 0 ? (totalKwh / activeCustomerCount).toFixed(1) : 0;
  const avgRevenuePerCustomer = activeCustomerCount > 0 ? (totalCollected / activeCustomerCount).toFixed(0) : 0;
  const collectionRate = totalBilled > 0 ? ((totalCollected / totalBilled) * 100).toFixed(1) : 0;

  const exportCSV = () => {
    const headers = ["Macmiilka", "Bisha", "KWh", "Qiimaha KWh", "Wadarta", "Xaalada"];
    const rows = monthBills.map((b) => [
      getCustomerName(b.customer),
      b.billing_month,
      b.kwh_used,
      b.rate_per_kwh,
      b.total_amount,
      b.status,
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `warbixin-maaliyadeed-${selectedMonth}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Waa la soo dejiyay", description: "Warbixin CSV ah ayaa la soo dejiyay." });
  };

  const exportPDF = () => {
    generateFinancialPDF({
      selectedMonth,
      totalCollected,
      totalPending,
      totalOverdue,
      totalOutstanding,
      totalBilled,
      totalKwh,
      collectionRate,
      activeCustomerCount,
      avgKwhPerCustomer,
      avgRevenuePerCustomer,
      customerBreakdown,
    });
    toast({ title: "Waa la soo dejiyay", description: "Warbixin PDF ah ayaa la soo dejiyay." });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Warbixin Maaliyadeed</h1>
          <p className="text-zinc-400 text-sm mt-1">Kooban dakhiga iyo xisaabaadka bil walba</p>
        </div>
        <div className="flex gap-3">
          <Input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-zinc-900 border-zinc-800 text-white w-44"
          />
          <Button onClick={exportCSV} variant="outline" className="border-zinc-700 text-zinc-200 hover:bg-zinc-800">
            <Download className="w-4 h-4 mr-2" /> CSV
          </Button>
          <Button onClick={exportPDF} className="bg-amber-500 hover:bg-amber-600 text-black">
            <FileText className="w-4 h-4 mr-2" /> PDF
          </Button>
        </div>
      </div>

      {/* Monthly Concise Summary */}
      <div className="rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-900/50 border border-amber-500/20 p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-white font-semibold flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-400" />
              Warbixin Kooban — {selectedMonth}
            </h2>
            <p className="text-zinc-500 text-xs mt-1">Kooban isticmaalka korontada iyo dakhiga bishan</p>
          </div>
          {revenueChange !== null && (
            <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium ${Number(revenueChange) >= 0 ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"}`}>
              {Number(revenueChange) >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
              {Math.abs(revenueChange)}% vs bishii hore
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl bg-zinc-800/40 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              <p className="text-zinc-400 text-xs font-medium">Isticmaalka KWh</p>
            </div>
            <p className="text-xl font-bold text-cyan-400">{totalKwh.toFixed(1)}</p>
            {kwhChange !== null && (
              <p className={`text-xs mt-1 ${Number(kwhChange) >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {Number(kwhChange) >= 0 ? "↑" : "↓"} {Math.abs(kwhChange)}% vs hore
              </p>
            )}
          </div>
          <div className="rounded-xl bg-zinc-800/40 p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <p className="text-zinc-400 text-xs font-medium">Dakhiga Soo Xarooday</p>
            </div>
            <p className="text-xl font-bold text-emerald-400">${totalCollected.toLocaleString()}</p>
            <p className="text-zinc-500 text-xs mt-1">{collectionRate}% ururinta</p>
          </div>
          <div className="rounded-xl bg-zinc-800/40 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-blue-400" />
              <p className="text-zinc-400 text-xs font-medium">Macaamiil Bishan</p>
            </div>
            <p className="text-xl font-bold text-blue-400">{activeCustomerCount}</p>
            {customerChange !== null && (
              <p className={`text-xs mt-1 ${Number(customerChange) >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {Number(customerChange) >= 0 ? "↑" : "↓"} {Math.abs(customerChange)}% vs hore
              </p>
            )}
          </div>
          <div className="rounded-xl bg-zinc-800/40 p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              <p className="text-zinc-400 text-xs font-medium">Celcelis Macmiil</p>
            </div>
            <p className="text-xl font-bold text-amber-400">${avgRevenuePerCustomer}</p>
            <p className="text-zinc-500 text-xs mt-1">{avgKwhPerCustomer} KWh / macmiil</p>
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/15 p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-zinc-400 text-xs font-medium uppercase tracking-wider">Dakhiga La Ururiyay</p>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-400">${totalCollected.toLocaleString()}</p>
          <p className="text-zinc-500 text-xs mt-1">{paidBills.length} bill la bixiyay</p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/15 p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-zinc-400 text-xs font-medium uppercase tracking-wider">Sugaya La Bixin</p>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-amber-400">${totalPending.toLocaleString()}</p>
          <p className="text-zinc-500 text-xs mt-1">{pendingBills.length} bill</p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-red-500/10 to-red-600/5 border border-red-500/15 p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-zinc-400 text-xs font-medium uppercase tracking-wider">Dhaafay</p>
            <AlertCircle className="w-4 h-4 text-red-400" />
          </div>
          <p className="text-2xl font-bold text-red-400">${totalOverdue.toLocaleString()}</p>
          <p className="text-zinc-500 text-xs mt-1">{overdueBills.length} bill</p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/15 p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-zinc-400 text-xs font-medium uppercase tracking-wider">Xisaabaha Sugan</p>
            <FileText className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-blue-400">${totalOutstanding.toLocaleString()}</p>
          <p className="text-zinc-500 text-xs mt-1">Celcelis: {collectionRate}% la ururiyay</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-zinc-900/50 border border-zinc-800/50 p-6">
          <h3 className="text-white font-semibold mb-1">Wadarta Bill-ka Bishan</h3>
          <p className="text-zinc-500 text-xs mb-4">La bixiyay vs sugaya vs dhaafay</p>
          {pieData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={(e) => `$${e.value.toLocaleString()}`}>
                    {pieData.map((d) => <Cell key={d.name} fill={d.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#18181b", border: "1px solid #3f3f46", borderRadius: "12px", color: "#fff" }} />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-zinc-600 text-sm">Bilkan bill lama helin</div>
          )}
        </div>

        <div className="rounded-2xl bg-zinc-900/50 border border-zinc-800/50 p-6">
          <h3 className="text-white font-semibold mb-1">Macaamiisha Xisaabka Sugan</h3>
          <p className="text-zinc-500 text-xs mb-4">Kuwa ugu badan ee aan wali la bixin</p>
          {topOutstanding.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topOutstanding} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
                  <XAxis type="number" stroke="#71717a" fontSize={11} />
                  <YAxis type="category" dataKey="name" stroke="#71717a" fontSize={10} width={80} />
                  <Tooltip contentStyle={{ background: "#18181b", border: "1px solid #3f3f46", borderRadius: "12px", color: "#fff" }} />
                  <Bar dataKey="lacag" fill="#f59e0b" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-zinc-600 text-sm">Xisaab sugan lama jiro</div>
          )}
        </div>
      </div>

      {/* Customer breakdown table */}
      <div className="rounded-2xl bg-zinc-900/50 border border-zinc-800/50 overflow-hidden">
        <div className="p-5 border-b border-zinc-800/50">
          <h3 className="text-white font-semibold">Faahfaasha Macaamiisha</h3>
          <p className="text-zinc-500 text-xs mt-1">Bishan: {selectedMonth} | Wadarta: ${totalBilled.toLocaleString()} | KWh: {totalKwh.toFixed(1)}</p>
        </div>
        {customerBreakdown.length === 0 ? (
          <div className="text-center py-16 text-zinc-600">
            <FileText className="w-10 h-10 mx-auto mb-3 text-zinc-700" />
            <p>Bilican xog lama helin</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-zinc-900/80 border-b border-zinc-800/50">
                  <th className="text-left p-4 text-xs font-medium text-zinc-400 uppercase tracking-wider">Macmiilka</th>
                  <th className="text-left p-4 text-xs font-medium text-zinc-400 uppercase tracking-wider hidden sm:table-cell">Bills</th>
                  <th className="text-left p-4 text-xs font-medium text-zinc-400 uppercase tracking-wider hidden md:table-cell">KWh</th>
                  <th className="text-right p-4 text-xs font-medium text-zinc-400 uppercase tracking-wider text-emerald-400">Bixiyay</th>
                  <th className="text-right p-4 text-xs font-medium text-zinc-400 uppercase tracking-wider text-amber-400">Sugaya</th>
                  <th className="text-right p-4 text-xs font-medium text-zinc-400 uppercase tracking-wider text-red-400">Dhaafay</th>
                  <th className="text-right p-4 text-xs font-medium text-zinc-400 uppercase tracking-wider">Guud</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/30">
                {customerBreakdown.map((c, i) => (
                  <tr key={i} className="hover:bg-zinc-900/50 transition-colors">
                    <td className="p-4 text-white text-sm font-medium">{c.name}</td>
                    <td className="p-4 text-zinc-300 text-sm hidden sm:table-cell">{c.bills}</td>
                    <td className="p-4 text-zinc-300 text-sm hidden md:table-cell">{c.kwh.toFixed(1)}</td>
                    <td className="p-4 text-right text-emerald-400 text-sm font-medium">${c.paid.toLocaleString()}</td>
                    <td className="p-4 text-right text-amber-400 text-sm font-medium">${c.pending.toLocaleString()}</td>
                    <td className="p-4 text-right text-red-400 text-sm font-medium">${c.overdue.toLocaleString()}</td>
                    <td className="p-4 text-right text-white text-sm font-bold">${c.total.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}