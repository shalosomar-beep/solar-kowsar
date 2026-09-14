import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { CheckCircle2, Clock, XCircle, Search, CheckCheck, Loader2, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useT } from "@/lib/i18n";

export default function Payments() {
  const { t } = useT();
  const [billings, setBillings] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [confirming, setConfirming] = useState(null);
  const { toast } = useToast();

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

  const getCustomerName = (id) => customers.find((c) => c.id === id)?.full_name || "—";
  const getCustomerPhone = (id) => customers.find((c) => c.id === id)?.phone || "—";

  const paidBills = billings.filter((b) => b.status === "paid");
  const pendingBills = billings.filter((b) => b.status === "pending");
  const overdueBills = billings.filter((b) => b.status === "overdue");
  const remainingBills = [...pendingBills, ...overdueBills];

  const totalPaidAmount = paidBills.reduce((s, b) => s + (b.total_amount || 0), 0);
  const totalRemainingAmount = remainingBills.reduce((s, b) => s + (b.total_amount || 0), 0);
  const totalBills = billings.length;
  const collectionRate = totalBills > 0 ? ((paidBills.length / totalBills) * 100).toFixed(0) : 0;

  const confirmPayment = async (bill) => {
    setConfirming(bill.id);
    await base44.entities.Billing.update(bill.id, {
      status: "paid",
      payment_date: new Date().toISOString().split("T")[0],
    });
    toast({ title: t("payments.toast.confirmed"), description: `${getCustomerName(bill.customer)} - $${bill.total_amount}` });
    setConfirming(null);
    load();
  };

  const filtered = billings.filter((b) => {
    const name = getCustomerName(b.customer).toLowerCase();
    const matchSearch = name.includes(search.toLowerCase()) || b.billing_month?.includes(search);
    const matchFilter = filter === "all" || b.status === filter;
    return matchSearch && matchFilter;
  });

  const statusConfig = {
    paid: { icon: CheckCircle2, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", label: t("status.paid") },
    pending: { icon: Clock, color: "text-amber-400 bg-amber-500/10 border-amber-500/20", label: t("status.pending") },
    overdue: { icon: XCircle, color: "text-red-400 bg-red-500/10 border-red-500/20", label: t("status.overdue") },
    cancelled: { icon: XCircle, color: "text-zinc-400 bg-zinc-500/10 border-zinc-500/20", label: t("status.suspended") },
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">{t("payments.title")}</h1>
        <p className="text-zinc-400 text-sm mt-1">{t("payments.subtitle")}</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/15 p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-zinc-400 text-xs font-medium uppercase tracking-wider">{t("status.paid")}</p>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-400">{paidBills.length}</p>
          <p className="text-zinc-500 text-xs mt-1">${totalPaidAmount.toLocaleString()}</p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/15 p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-zinc-400 text-xs font-medium uppercase tracking-wider">{t("payments.remaining")}</p>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-amber-400">{remainingBills.length}</p>
          <p className="text-zinc-500 text-xs mt-1">${totalRemainingAmount.toLocaleString()}</p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/15 p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-zinc-400 text-xs font-medium uppercase tracking-wider">{t("payments.totalBills")}</p>
            <TrendingUp className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-blue-400">{totalBills}</p>
          <p className="text-zinc-500 text-xs mt-1">${(totalPaidAmount + totalRemainingAmount).toLocaleString()}</p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/15 p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-zinc-400 text-xs font-medium uppercase tracking-wider">{t("payments.collectionRate")}</p>
            <CheckCheck className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-purple-400">{collectionRate}%</p>
          <div className="mt-2 h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-purple-400 rounded-full transition-all" style={{ width: `${collectionRate}%` }} />
          </div>
        </div>
      </div>

      {/* Filters */}
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
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-44 bg-zinc-900 border-zinc-800 text-white"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("billing.filter.all")}</SelectItem>
            <SelectItem value="paid">{t("status.paid")}</SelectItem>
            <SelectItem value="pending">{t("status.pending")}</SelectItem>
            <SelectItem value="overdue">{t("status.overdue")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-zinc-500">
          <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-zinc-700" />
          <p className="text-lg font-medium">{t("payments.empty")}</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-zinc-800/50">
          <table className="w-full">
            <thead>
              <tr className="bg-zinc-900/80 border-b border-zinc-800/50">
                <th className="text-left p-4 text-xs font-medium text-zinc-400 uppercase tracking-wider">{t("billing.form.customer")}</th>
                <th className="text-left p-4 text-xs font-medium text-zinc-400 uppercase tracking-wider hidden sm:table-cell">{t("billing.col.month")}</th>
                <th className="text-left p-4 text-xs font-medium text-zinc-400 uppercase tracking-wider">{t("billing.col.amount")}</th>
                <th className="text-left p-4 text-xs font-medium text-zinc-400 uppercase tracking-wider">{t("common.status")}</th>
                <th className="text-left p-4 text-xs font-medium text-zinc-400 uppercase tracking-wider hidden md:table-cell">{t("payments.paymentDate")}</th>
                <th className="text-right p-4 text-xs font-medium text-zinc-400 uppercase tracking-wider">{t("common.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/30">
              {filtered.map((b) => {
                const cfg = statusConfig[b.status] || statusConfig.pending;
                const SIcon = cfg.icon;
                return (
                  <tr key={b.id} className="hover:bg-zinc-900/50 transition-colors">
                    <td className="p-4">
                      <p className="text-white text-sm font-medium">{getCustomerName(b.customer)}</p>
                      <p className="text-zinc-500 text-xs">{getCustomerPhone(b.customer)}</p>
                    </td>
                    <td className="p-4 text-zinc-300 text-sm hidden sm:table-cell">{b.billing_month}</td>
                    <td className="p-4 text-white text-sm font-semibold">${b.total_amount?.toLocaleString()}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.color}`}>
                        <SIcon className="w-3 h-3" />
                        {cfg.label}
                      </span>
                    </td>
                    <td className="p-4 text-zinc-300 text-sm hidden md:table-cell">{b.payment_date || "—"}</td>
                    <td className="p-4 text-right">
                      {b.status === "pending" || b.status === "overdue" ? (
                        <Button
                          size="sm"
                          onClick={() => confirmPayment(b)}
                          disabled={confirming === b.id}
                          className="bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 text-xs"
                        >
                          {confirming === b.id ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <CheckCheck className="w-3 h-3 mr-1" />}
                          {t("payments.confirm")}
                        </Button>
                      ) : b.status === "paid" ? (
                        <span className="text-emerald-400 text-xs flex items-center justify-end gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> {t("payments.confirmed")}
                        </span>
                      ) : null}
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