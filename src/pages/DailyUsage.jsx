import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Search, X, Zap, TrendingUp, Calendar, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useT } from "@/lib/i18n";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function DailyUsage() {
  const { t } = useT();
  const [usages, setUsages] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [filterCustomer, setFilterCustomer] = useState("all");
  const { toast } = useToast();

  const [form, setForm] = useState({ customer: "", usage_date: "", kwh_used: "", reading_type: "meter", notes: "" });

  const load = () => {
    setLoading(true);
    Promise.all([
      base44.entities.DailyUsage.list("-usage_date"),
      base44.entities.Customer.list(),
    ]).then(([u, c]) => {
      setUsages(u);
      setCustomers(c);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await base44.entities.DailyUsage.create({
      ...form,
      kwh_used: Number(form.kwh_used),
    });
    toast({ title: t("customers.toast.created.title"), description: t("usage.toast.created.desc") });
    setShowForm(false);
    setForm({ customer: "", usage_date: "", kwh_used: "", reading_type: "meter", notes: "" });
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm(t("usage.confirmDelete"))) return;
    await base44.entities.DailyUsage.delete(id);
    toast({ title: t("customers.toast.deleted.title") });
    load();
  };

  const getCustomerName = (id) => customers.find((c) => c.id === id)?.full_name || "—";

  const filtered = usages.filter((u) => {
    const matchSearch = getCustomerName(u.customer).toLowerCase().includes(search.toLowerCase());
    const matchCustomer = filterCustomer === "all" || u.customer === filterCustomer;
    return matchSearch && matchCustomer;
  });

  // Chart: last 7 days total usage
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    const dayTotal = usages.filter((u) => u.usage_date === key).reduce((s, u) => s + (u.kwh_used || 0), 0);
    const label = d.toLocaleDateString("en", { weekday: "short", day: "numeric" });
    last7Days.push({ name: label, kwh: dayTotal });
  }

  const totalToday = usages.filter((u) => u.usage_date === new Date().toISOString().split("T")[0]).reduce((s, u) => s + (u.kwh_used || 0), 0);
  const total7Days = last7Days.reduce((s, d) => s + d.kwh, 0);
  const avgPerDay = last7Days.length ? (total7Days / 7).toFixed(1) : "0";

  const readingTypeLabel = { meter: t("reading.meter"), estimated: t("reading.estimated"), manual: t("reading.manual") };
  const readingTypeColor = {
    meter: "text-emerald-400 bg-emerald-500/10",
    estimated: "text-amber-400 bg-amber-500/10",
    manual: "text-blue-400 bg-blue-500/10",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">{t("usage.title")}</h1>
          <p className="text-zinc-400 text-sm mt-1">{t("usage.subtitle")}</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-amber-500 hover:bg-amber-600 text-black font-semibold">
          <Plus className="w-4 h-4 mr-2" /> {t("usage.new")}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-amber-500/10 border border-amber-500/20 p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-zinc-400 text-xs uppercase tracking-wider">{t("home.daily.today")}</p>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-amber-400">{totalToday.toFixed(1)} KWh</p>
          <p className="text-zinc-500 text-xs mt-1">{t("usage.todaySub")}</p>
        </div>
        <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-zinc-400 text-xs uppercase tracking-wider">{t("usage.week")}</p>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-400">{total7Days.toFixed(1)} KWh</p>
          <p className="text-zinc-500 text-xs mt-1">{t("usage.weekSub")}</p>
        </div>
        <div className="rounded-2xl bg-blue-500/10 border border-blue-500/20 p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-zinc-400 text-xs uppercase tracking-wider">{t("home.daily.avg")}</p>
            <Calendar className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-blue-400">{avgPerDay} KWh</p>
          <p className="text-zinc-500 text-xs mt-1">{t("usage.perDay")}</p>
        </div>
      </div>

      {/* Chart */}
      <div className="rounded-2xl bg-zinc-900/50 border border-zinc-800/50 p-6">
        <h3 className="text-white font-semibold mb-1 flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" />
          {t("usage.chart.title")}
        </h3>
        <p className="text-zinc-500 text-xs mb-6">{t("usage.chart.sub")}</p>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={last7Days}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="name" stroke="#71717a" fontSize={12} />
              <YAxis stroke="#71717a" fontSize={12} />
              <Tooltip
                contentStyle={{ background: "#18181b", border: "1px solid #3f3f46", borderRadius: "12px", color: "#fff" }}
                labelStyle={{ color: "#a1a1aa" }}
              />
              <Bar dataKey="kwh" fill="#f59e0b" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <Input
            placeholder={t("usage.searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600"
          />
        </div>
        <Select value={filterCustomer} onValueChange={setFilterCustomer}>
          <SelectTrigger className="w-48 bg-zinc-900 border-zinc-800 text-white"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("usage.filter.all")}</SelectItem>
            {customers.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.full_name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-5 border-b border-zinc-800">
              <h2 className="text-white font-semibold">{t("usage.form.title")}</h2>
              <button onClick={() => setShowForm(false)} className="text-zinc-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <Label className="text-zinc-300 text-xs">{t("billing.form.customer")} *</Label>
                <Select value={form.customer} onValueChange={(v) => setForm((p) => ({ ...p, customer: v }))}>
                  <SelectTrigger className="mt-1 bg-zinc-800 border-zinc-700 text-white"><SelectValue placeholder={t("billing.form.customerPlaceholder")} /></SelectTrigger>
                  <SelectContent>
                    {customers.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.full_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-zinc-300 text-xs">{t("usage.form.date")} *</Label>
                  <Input required type="date" value={form.usage_date} onChange={(e) => setForm((p) => ({ ...p, usage_date: e.target.value }))} className="mt-1 bg-zinc-800 border-zinc-700 text-white" />
                </div>
                <div>
                  <Label className="text-zinc-300 text-xs">{t("billing.form.kwh")} *</Label>
                  <Input required type="number" step="0.1" value={form.kwh_used} onChange={(e) => setForm((p) => ({ ...p, kwh_used: e.target.value }))} className="mt-1 bg-zinc-800 border-zinc-700 text-white" />
                </div>
              </div>
              <div>
                <Label className="text-zinc-300 text-xs">{t("usage.form.readingType")}</Label>
                <Select value={form.reading_type} onValueChange={(v) => setForm((p) => ({ ...p, reading_type: v }))}>
                  <SelectTrigger className="mt-1 bg-zinc-800 border-zinc-700 text-white"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="meter">{t("reading.meter")}</SelectItem>
                    <SelectItem value="estimated">{t("reading.estimated")}</SelectItem>
                    <SelectItem value="manual">{t("reading.manual")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-zinc-300 text-xs">{t("form.notes")}</Label>
                <textarea value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} rows={2} className="mt-1 w-full bg-zinc-800 border border-zinc-700 text-white rounded-md px-3 py-2 text-sm" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">{t("common.cancel")}</Button>
                <Button type="submit" className="bg-amber-500 hover:bg-amber-600 text-black font-semibold">{t("form.submit.create")}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-zinc-500">
          <Zap className="w-12 h-12 mx-auto mb-3 text-zinc-700" />
          <p className="text-lg font-medium">{t("usage.empty")}</p>
          <p className="text-sm mt-1">{t("usage.empty.sub")}</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-zinc-800/50">
          <table className="w-full">
            <thead>
              <tr className="bg-zinc-900/80 border-b border-zinc-800/50">
                <th className="text-left p-4 text-xs font-medium text-zinc-400 uppercase tracking-wider">{t("billing.form.customer")}</th>
                <th className="text-left p-4 text-xs font-medium text-zinc-400 uppercase tracking-wider">{t("usage.form.date")}</th>
                <th className="text-left p-4 text-xs font-medium text-zinc-400 uppercase tracking-wider">KWh</th>
                <th className="text-left p-4 text-xs font-medium text-zinc-400 uppercase tracking-wider hidden md:table-cell">{t("usage.form.readingType")}</th>
                <th className="text-right p-4 text-xs font-medium text-zinc-400 uppercase tracking-wider">{t("common.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/30">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-zinc-900/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-sm">
                        {getCustomerName(u.customer).charAt(0)}
                      </div>
                      <span className="text-white font-medium text-sm">{getCustomerName(u.customer)}</span>
                    </div>
                  </td>
                  <td className="p-4 text-zinc-300 text-sm">{u.usage_date}</td>
                  <td className="p-4 text-white text-sm font-semibold">{u.kwh_used} KWh</td>
                  <td className="p-4 hidden md:table-cell">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${readingTypeColor[u.reading_type] || readingTypeColor.meter}`}>
                      {readingTypeLabel[u.reading_type] || u.reading_type}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => handleDelete(u.id)} className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-red-400 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}