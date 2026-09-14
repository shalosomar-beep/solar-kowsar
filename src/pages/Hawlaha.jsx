import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { useT } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, ClipboardList, Pencil, Trash2, Search } from "lucide-react";

const priorityConfig = {
  low: { cls: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300" },
  medium: { cls: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" },
  high: { cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" },
  urgent: { cls: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300" },
};

const statusConfig = {
  open: { cls: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" },
  assigned: { cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" },
  in_progress: { cls: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300" },
  completed: { cls: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300" },
};

const emptyForm = { title: "", customer: "", location: "", technician: "", priority: "medium", status: "open", due_date: "" };

export default function Hawlaha() {
  const { toast } = useToast();
  const { t } = useT();
  const [items, setItems] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [data, custs, staffs] = await Promise.all([
        base44.entities.Task.list("-created_date", 200),
        base44.entities.Customer.list("-created_date", 200),
        base44.entities.Staff.list("-created_date", 200),
      ]);
      setItems(data);
      setCustomers(custs);
      setStaff(staffs);
    } catch {
      toast({ variant: "destructive", title: t("common.error"), description: t("task.error.load") });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const custName = (id) => {
    if (!id) return "—";
    const c = customers.find((x) => x.id === id);
    return c ? c.full_name : "—";
  };
  const techName = (id) => {
    if (!id) return t("task.unassigned");
    const s = staff.find((x) => x.id === id);
    return s ? s.full_name : t("task.unassigned");
  };

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (item) => {
    setEditing(item);
    setForm({
      title: item.title ?? "",
      customer: item.customer ?? "",
      location: item.location ?? "",
      technician: item.technician ?? "",
      priority: item.priority ?? "medium",
      status: item.status ?? "open",
      due_date: item.due_date ?? "",
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, customer: form.customer || null, technician: form.technician || null };
      if (editing) {
        await base44.entities.Task.update(editing.id, payload);
        toast({ description: t("task.toast.updated") });
      } else {
        await base44.entities.Task.create(payload);
        toast({ description: t("task.toast.created") });
      }
      setModalOpen(false);
      fetchData();
    } catch {
      toast({ variant: "destructive", title: t("common.error"), description: t("task.error.save") });
    }
  };

  const handleDelete = async (item) => {
    try {
      await base44.entities.Task.delete(item.id);
      toast({ description: t("task.toast.deleted") });
      fetchData();
    } catch {
      toast({ variant: "destructive", title: t("common.error"), description: t("task.error.delete") });
    }
  };

  const filtered = items.filter((i) => {
    const q = search.toLowerCase();
    return !q ||
      (i.title || "").toLowerCase().includes(q) ||
      custName(i.customer).toLowerCase().includes(q) ||
      (i.location || "").toLowerCase().includes(q) ||
      techName(i.technician).toLowerCase().includes(q);
  });

  const Pill = ({ label, cls }) => (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>{label}</span>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("task.title")}</h1>
          <p className="text-muted-foreground text-sm mt-1">{t("task.subtitle")}</p>
        </div>
        <Button onClick={openCreate} className="gap-2 bg-amber-500 hover:bg-amber-600 text-white">
          <Plus className="w-4 h-4" /> {t("task.new")}
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder={t("task.searchPlaceholder")}
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
            <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">{t("task.empty")}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-muted-foreground text-xs uppercase tracking-wider">
                  <th className="text-left px-4 py-3 font-medium">{t("task.col.title")}</th>
                  <th className="text-left px-4 py-3 font-medium">{t("task.col.customer")}</th>
                  <th className="text-left px-4 py-3 font-medium">{t("task.col.location")}</th>
                  <th className="text-left px-4 py-3 font-medium">{t("task.col.technician")}</th>
                  <th className="text-left px-4 py-3 font-medium">{t("task.col.priority")}</th>
                  <th className="text-left px-4 py-3 font-medium">{t("task.col.status")}</th>
                  <th className="text-left px-4 py-3 font-medium">{t("task.col.due")}</th>
                  <th className="text-right px-4 py-3 font-medium">{t("common.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id} className="border-b border-border/60 last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-foreground font-medium">{item.title || "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{custName(item.customer)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{item.location || "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{techName(item.technician)}</td>
                    <td className="px-4 py-3"><Pill label={t(`task.priority.${item.priority}`)} cls={priorityConfig[item.priority]?.cls} /></td>
                    <td className="px-4 py-3"><Pill label={t(`task.status.${item.status}`)} cls={statusConfig[item.status]?.cls} /></td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{item.due_date || "—"}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(item)} className="h-8 w-8 text-muted-foreground hover:text-foreground">
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(item)} className="h-8 w-8 text-muted-foreground hover:text-red-500">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? t("task.edit") : t("task.new")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>{t("task.col.title")}</Label>
              <Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder={t("task.placeholder.title")} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("task.col.customer")}</Label>
                <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm" value={form.customer} onChange={(e) => setForm({ ...form, customer: e.target.value })}>
                  <option value="">{t("task.unassigned")}</option>
                  {customers.map((c) => <option key={c.id} value={c.id}>{c.full_name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label>{t("task.col.technician")}</Label>
                <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm" value={form.technician} onChange={(e) => setForm({ ...form, technician: e.target.value })}>
                  <option value="">{t("task.unassigned")}</option>
                  {staff.map((s) => <option key={s.id} value={s.id}>{s.full_name}</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t("task.col.location")}</Label>
              <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder={t("task.placeholder.location")} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>{t("task.col.priority")}</Label>
                <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                  {["low", "medium", "high", "urgent"].map((p) => <option key={p} value={p}>{t(`task.priority.${p}`)}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label>{t("task.col.status")}</Label>
                <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  {["open", "assigned", "in_progress", "completed"].map((s) => <option key={s} value={s}>{t(`task.status.${s}`)}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label>{t("task.col.due")}</Label>
                <Input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
              </div>
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