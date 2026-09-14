import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { useT } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Search, Trash2, Pencil, Wallet, FileText, AlertCircle } from "lucide-react";

const CATEGORIES = ["maintenance", "salaries", "equipment", "transport", "utilities", "rent", "other"];
const PAYMENT_METHODS = ["cash", "evc_plus", "zaad", "bank_transfer"];
const STATUSES = ["pending", "paid", "overdue"];

const STATUS_STYLE = {
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
  paid: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
  overdue: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400",
};

const emptyForm = {
  title: "",
  category: "maintenance",
  amount: "",
  expense_date: new Date().toISOString().slice(0, 10),
  payment_method: "cash",
  vendor: "",
  status: "pending",
  notes: "",
};

export default function Expenses() {
  const { toast } = useToast();
  const { t } = useT();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const catLabel = (v) => t(`expense.category.${v}`);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const data = await base44.entities.Expense.list("-expense_date", 200);
      setExpenses(data);
    } catch {
      toast({ variant: "destructive", title: t("common.error"), description: t("expenses.error.load") });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchExpenses(); }, []);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (exp) => {
    setEditing(exp);
    setForm({ ...emptyForm, ...exp, amount: String(exp.amount || "") });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, amount: Number(form.amount) };
      if (editing) {
        await base44.entities.Expense.update(editing.id, payload);
        toast({ title: t("customers.toast.updated.title"), description: t("expenses.toast.updated.desc") });
      } else {
        await base44.entities.Expense.create(payload);
        toast({ title: t("customers.toast.created.title"), description: t("expenses.toast.created.desc") });
      }
      setModalOpen(false);
      fetchExpenses();
    } catch {
      toast({ variant: "destructive", title: t("common.error"), description: t("expenses.error.save") });
    }
  };

  const handleDelete = async (id) => {
    try {
      await base44.entities.Expense.delete(id);
      toast({ title: t("customers.toast.deleted.title"), description: t("expenses.toast.deleted.desc") });
      fetchExpenses();
    } catch {
      toast({ variant: "destructive", title: t("common.error"), description: t("expenses.error.delete") });
    }
  };

  const filtered = expenses.filter((e) => {
    const q = search.toLowerCase();
    return !q || e.title?.toLowerCase().includes(q) || e.vendor?.toLowerCase().includes(q) || catLabel(e.category)?.toLowerCase().includes(q);
  });

  const totalExpenses = filtered.reduce((s, e) => s + (e.amount || 0), 0);
  const overdueCount = filtered.filter((e) => e.status === "overdue").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("expenses.title")}</h1>
          <p className="text-muted-foreground text-sm mt-1">{t("expenses.subtitle")}</p>
        </div>
        <Button onClick={openCreate} className="gap-2 bg-amber-500 hover:bg-amber-600 text-white">
          <Plus className="w-4 h-4" /> {t("expenses.new")}
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={<Wallet className="w-5 h-5" />} label={t("expenses.total")} value={`$${totalExpenses.toLocaleString()}`} tone="amber" />
        <StatCard icon={<FileText className="w-5 h-5" />} label={t("expenses.records")} value={filtered.length} tone="blue" />
        <StatCard icon={<AlertCircle className="w-5 h-5" />} label={t("expenses.overdue")} value={overdueCount} tone="red" />
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder={t("expenses.searchPlaceholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {loading ? (
          <div className="p-12 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <Wallet className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">{t("expenses.empty")}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-muted-foreground text-xs uppercase tracking-wider">
                  <th className="text-left px-5 py-3 font-medium">{t("expenses.col.title")}</th>
                  <th className="text-left px-5 py-3 font-medium">{t("expenses.col.category")}</th>
                  <th className="text-left px-5 py-3 font-medium">{t("expenses.col.vendor")}</th>
                  <th className="text-right px-5 py-3 font-medium">{t("expenses.col.amount")}</th>
                  <th className="text-left px-5 py-3 font-medium">{t("expenses.col.date")}</th>
                  <th className="text-left px-5 py-3 font-medium">{t("expenses.col.status")}</th>
                  <th className="text-right px-5 py-3 font-medium">{t("common.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((exp) => {
                  const st = exp.status || "pending";
                  return (
                    <tr key={exp.id} className="border-b border-border/60 last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-3 text-foreground font-medium">{exp.title}</td>
                      <td className="px-5 py-3 text-muted-foreground">{catLabel(exp.category)}</td>
                      <td className="px-5 py-3 text-muted-foreground">{exp.vendor || "—"}</td>
                      <td className="px-5 py-3 text-right text-foreground font-semibold">${(exp.amount || 0).toLocaleString()}</td>
                      <td className="px-5 py-3 text-muted-foreground">{exp.expense_date || "—"}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_STYLE[st]}`}>
                          {t(`status.${st}`)}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(exp)} className="h-8 w-8 text-muted-foreground hover:text-foreground">
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(exp.id)} className="h-8 w-8 text-muted-foreground hover:text-red-500">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? t("expenses.edit") : t("expenses.new")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>{t("expenses.form.title")}</Label>
              <Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder={t("expenses.form.titlePlaceholder")} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("expenses.col.category")}</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{catLabel(c)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("expenses.form.amount")}</Label>
                <Input required type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0.00" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("usage.form.date")}</Label>
                <Input required type="date" value={form.expense_date} onChange={(e) => setForm({ ...form, expense_date: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>{t("expenses.form.paymentMethod")}</Label>
                <Select value={form.payment_method} onValueChange={(v) => setForm({ ...form, payment_method: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PAYMENT_METHODS.map((p) => <SelectItem key={p} value={p}>{t(`payment.${p}`)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("expenses.form.vendor")}</Label>
                <Input value={form.vendor} onChange={(e) => setForm({ ...form, vendor: e.target.value })} placeholder={t("expenses.form.vendorPlaceholder")} />
              </div>
              <div className="space-y-2">
                <Label>{t("expenses.col.status")}</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => <SelectItem key={s} value={s}>{t(`status.${s}`)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t("form.notes")}</Label>
              <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder={t("expenses.form.notesPlaceholder")} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>{t("common.cancel")}</Button>
              <Button type="submit" className="bg-amber-500 hover:bg-amber-600 text-white">{editing ? t("common.save") : t("common.add")}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatCard({ icon, label, value, tone }) {
  const tones = {
    amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    red: "bg-red-500/10 text-red-600 dark:text-red-400",
  };
  return (
    <div className="rounded-xl border border-border bg-card p-5 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-lg flex items-center justify-center ${tones[tone]}`}>
        {icon}
      </div>
      <div>
        <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
      </div>
    </div>
  );
}