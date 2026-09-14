import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Search, X, FileText, CheckCircle, Clock, AlertTriangle, Bell, Loader2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useT } from "@/lib/i18n";

export default function BillingPage() {
  const { t } = useT();
  const [billings, setBillings] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sendingReminders, setSendingReminders] = useState(false);
  const [autoGenOpen, setAutoGenOpen] = useState(false);
  const [autoGenMonth, setAutoGenMonth] = useState("");
  const [autoGenLoading, setAutoGenLoading] = useState(false);
  const { toast } = useToast();

  const [form, setForm] = useState({
    customer: "",
    billing_month: "",
    kwh_used: "",
    rate_per_kwh: "0.15",
    total_amount: "",
    status: "pending",
    payment_method: "",
    notes: "",
  });

  const load = () => {
    setLoading(true);
    Promise.all([
      base44.entities.Billing.list("-created_date"),
      base44.entities.Customer.list(),
    ]).then(([b, c]) => {
      setBillings(b);
      setCustomers(c);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (form.kwh_used && form.rate_per_kwh) {
      setForm((p) => ({ ...p, total_amount: (Number(p.kwh_used) * Number(p.rate_per_kwh)).toFixed(2) }));
    }
  }, [form.kwh_used, form.rate_per_kwh]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const billData = {
      ...form,
      kwh_used: Number(form.kwh_used),
      rate_per_kwh: Number(form.rate_per_kwh),
      total_amount: Number(form.total_amount),
    };
    await base44.entities.Billing.create(billData);
    // Auto-create notification when bill is generated
    const custName = getCustomerName(form.customer);
    await base44.entities.Notification.create({
      title: t("billing.notify.newBill.title"),
      message: t("billing.notify.newBill.message", { name: custName, month: form.billing_month, amount: billData.total_amount, kwh: billData.kwh_used }),
      type: "billing",
      customer: form.customer,
      is_read: false,
    });
    toast({ title: t("customers.toast.created.title"), description: t("billing.toast.created.desc") });
    setShowForm(false);
    setForm({ customer: "", billing_month: "", kwh_used: "", rate_per_kwh: "0.15", total_amount: "", status: "pending", payment_method: "", notes: "" });
    load();
  };

  // Send reminders for pending/overdue bills
  const sendReminders = async () => {
    setSendingReminders(true);
    const dueBills = billings.filter((b) => b.status === "pending" || b.status === "overdue");
    const notifications = dueBills.map((b) => ({
      title: b.status === "overdue" ? t("billing.notify.overdue.title") : t("billing.notify.reminder.title"),
      message: b.status === "overdue"
        ? t("billing.notify.overdue.message", { name: getCustomerName(b.customer), month: b.billing_month, amount: b.total_amount })
        : t("billing.notify.reminder.message", { name: getCustomerName(b.customer), month: b.billing_month, amount: b.total_amount }),
      type: "billing",
      customer: b.customer,
      is_read: false,
    }));
    if (notifications.length > 0) {
      await base44.entities.Notification.bulkCreate(notifications);
    }
    toast({
      title: t("billing.toast.reminders.title"),
      description: t("billing.toast.reminders.desc", { count: notifications.length }),
    });
    setSendingReminders(false);
  };

  const markPaid = async (billing) => {
    await base44.entities.Billing.update(billing.id, {
      status: "paid",
      payment_date: new Date().toISOString().split("T")[0],
    });
    toast({ title: t("status.paid"), description: t("billing.toast.markedPaid.desc") });
    load();
  };

  const runAutoGenerate = async () => {
    setAutoGenLoading(true);
    try {
      const month = autoGenMonth || (() => {
        const d = new Date();
        d.setDate(0);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      })();
      const res = await base44.functions.invoke('generateMonthlyBills', { billing_month: month });
      const data = res.data || res;
      toast({
        title: t("billing.toast.autoGen.title"),
        description: t("billing.toast.autoGen.desc", { count: data.bills_created || 0, month }),
      });
      setAutoGenOpen(false);
      load();
    } catch (e) {
      toast({ variant: "destructive", title: t("common.error"), description: e.message });
    } finally {
      setAutoGenLoading(false);
    }
  };

  const getCustomerName = (id) => customers.find((c) => c.id === id)?.full_name || "—";

  const filtered = billings.filter((b) => {
    const matchSearch = getCustomerName(b.customer).toLowerCase().includes(search.toLowerCase()) || b.billing_month?.includes(search);
    const matchStatus = filterStatus === "all" || b.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const statusIcon = { paid: CheckCircle, pending: Clock, overdue: AlertTriangle, cancelled: X };
  const statusColor = {
    paid: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    pending: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    overdue: "text-red-400 bg-red-500/10 border-red-500/20",
    cancelled: "text-zinc-400 bg-zinc-500/10 border-zinc-500/20",
  };
  const statusLabel = { paid: t("status.paid"), pending: t("status.pending"), overdue: t("status.overdue"), cancelled: t("status.suspended") };

  const totalPaid = billings.filter((b) => b.status === "paid").reduce((s, b) => s + (b.total_amount || 0), 0);
  const totalPending = billings.filter((b) => b.status === "pending").reduce((s, b) => s + (b.total_amount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">{t("billing.title")}</h1>
          <p className="text-zinc-400 text-sm mt-1">{t("billing.subtitle")}</p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => {
              const d = new Date();
              d.setDate(0);
              setAutoGenMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
              setAutoGenOpen(true);
            }}
            variant="outline"
            className="border-amber-500/40 text-amber-400 hover:bg-amber-500/10"
          >
            <Zap className="w-4 h-4 mr-2" /> {t("billing.autoGenerate")}
          </Button>
          <Button
            onClick={sendReminders}
            disabled={sendingReminders}
            variant="outline"
            className="border-zinc-700 text-zinc-200 hover:bg-zinc-800"
          >
            {sendingReminders ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Bell className="w-4 h-4 mr-2" />}
            {t("billing.sendReminders")}
          </Button>
          <Button onClick={() => setShowForm(true)} className="bg-amber-500 hover:bg-amber-600 text-black font-semibold">
            <Plus className="w-4 h-4 mr-2" /> {t("billing.new")}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-5">
          <p className="text-zinc-400 text-xs uppercase tracking-wider">{t("billing.totalPaid")}</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">${totalPaid.toLocaleString()}</p>
        </div>
        <div className="rounded-2xl bg-amber-500/10 border border-amber-500/20 p-5">
          <p className="text-zinc-400 text-xs uppercase tracking-wider">{t("status.pending")}</p>
          <p className="text-2xl font-bold text-amber-400 mt-1">${totalPending.toLocaleString()}</p>
        </div>
        <div className="rounded-2xl bg-blue-500/10 border border-blue-500/20 p-5">
          <p className="text-zinc-400 text-xs uppercase tracking-wider">{t("billing.totalRecords")}</p>
          <p className="text-2xl font-bold text-blue-400 mt-1">{billings.length}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <Input
            placeholder={t("billing.searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40 bg-zinc-900 border-zinc-800 text-white"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("billing.filter.all")}</SelectItem>
            <SelectItem value="paid">{t("status.paid")}</SelectItem>
            <SelectItem value="pending">{t("status.pending")}</SelectItem>
            <SelectItem value="overdue">{t("status.overdue")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-5 border-b border-zinc-800">
              <h2 className="text-white font-semibold">{t("billing.new")}</h2>
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
                  <Label className="text-zinc-300 text-xs">{t("billing.form.month")} *</Label>
                  <Input required type="month" value={form.billing_month} onChange={(e) => setForm((p) => ({ ...p, billing_month: e.target.value }))} className="mt-1 bg-zinc-800 border-zinc-700 text-white" />
                </div>
                <div>
                  <Label className="text-zinc-300 text-xs">{t("billing.form.kwh")} *</Label>
                  <Input required type="number" value={form.kwh_used} onChange={(e) => setForm((p) => ({ ...p, kwh_used: e.target.value }))} className="mt-1 bg-zinc-800 border-zinc-700 text-white" />
                </div>
                <div>
                  <Label className="text-zinc-300 text-xs">{t("billing.form.rate")}</Label>
                  <Input type="number" step="0.01" value={form.rate_per_kwh} onChange={(e) => setForm((p) => ({ ...p, rate_per_kwh: e.target.value }))} className="mt-1 bg-zinc-800 border-zinc-700 text-white" />
                </div>
                <div>
                  <Label className="text-zinc-300 text-xs">{t("billing.form.total")}</Label>
                  <Input type="number" step="0.01" value={form.total_amount} onChange={(e) => setForm((p) => ({ ...p, total_amount: e.target.value }))} className="mt-1 bg-zinc-800 border-zinc-700 text-white" />
                </div>
              </div>
              <div>
                <Label className="text-zinc-300 text-xs">{t("billing.form.paymentMethod")}</Label>
                <Select value={form.payment_method} onValueChange={(v) => setForm((p) => ({ ...p, payment_method: v }))}>
                  <SelectTrigger className="mt-1 bg-zinc-800 border-zinc-700 text-white"><SelectValue placeholder={t("billing.form.methodPlaceholder")} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">{t("payment.cash")}</SelectItem>
                    <SelectItem value="evc_plus">{t("payment.evc_plus")}</SelectItem>
                    <SelectItem value="zaad">{t("payment.zaad")}</SelectItem>
                    <SelectItem value="bank_transfer">{t("payment.bank_transfer")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">{t("common.cancel")}</Button>
                <Button type="submit" className="bg-amber-500 hover:bg-amber-600 text-black font-semibold">{t("form.submit.create")}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {autoGenOpen && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-zinc-800">
              <h2 className="text-white font-semibold flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400" /> {t("billing.autoGenerate")}
              </h2>
              <button onClick={() => setAutoGenOpen(false)} className="text-zinc-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-zinc-400 text-sm leading-relaxed">{t("billing.autoGenerate.desc")}</p>
              <div>
                <Label className="text-zinc-300 text-xs">{t("billing.autoGenerate.month")}</Label>
                <Input type="month" value={autoGenMonth} onChange={(e) => setAutoGenMonth(e.target.value)} className="mt-1 bg-zinc-800 border-zinc-700 text-white" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setAutoGenOpen(false)} className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">{t("common.cancel")}</Button>
                <Button type="button" onClick={runAutoGenerate} disabled={autoGenLoading} className="bg-amber-500 hover:bg-amber-600 text-black font-semibold">
                  {autoGenLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Zap className="w-4 h-4 mr-2" />}
                  {t("billing.autoGenerate.confirm")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-zinc-500">
          <FileText className="w-12 h-12 mx-auto mb-3 text-zinc-700" />
          <p className="text-lg font-medium">{t("billing.empty")}</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-zinc-800/50">
          <table className="w-full">
            <thead>
              <tr className="bg-zinc-900/80 border-b border-zinc-800/50">
                <th className="text-left p-4 text-xs font-medium text-zinc-400 uppercase tracking-wider">{t("billing.form.customer")}</th>
                <th className="text-left p-4 text-xs font-medium text-zinc-400 uppercase tracking-wider hidden sm:table-cell">{t("billing.col.month")}</th>
                <th className="text-left p-4 text-xs font-medium text-zinc-400 uppercase tracking-wider hidden md:table-cell">KWh</th>
                <th className="text-left p-4 text-xs font-medium text-zinc-400 uppercase tracking-wider">{t("billing.col.amount")}</th>
                <th className="text-left p-4 text-xs font-medium text-zinc-400 uppercase tracking-wider">{t("common.status")}</th>
                <th className="text-right p-4 text-xs font-medium text-zinc-400 uppercase tracking-wider">{t("common.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/30">
              {filtered.map((b) => {
                const SIcon = statusIcon[b.status] || Clock;
                return (
                  <tr key={b.id} className="hover:bg-zinc-900/50 transition-colors">
                    <td className="p-4 text-white text-sm font-medium">{getCustomerName(b.customer)}</td>
                    <td className="p-4 text-zinc-300 text-sm hidden sm:table-cell">{b.billing_month}</td>
                    <td className="p-4 text-zinc-300 text-sm hidden md:table-cell">{b.kwh_used}</td>
                    <td className="p-4 text-white text-sm font-semibold">${b.total_amount?.toLocaleString()}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusColor[b.status]}`}>
                        <SIcon className="w-3 h-3" />
                        {statusLabel[b.status] || b.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {b.status === "pending" && (
                        <Button size="sm" onClick={() => markPaid(b)} className="bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 text-xs">
                          {t("billing.pay")}
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}