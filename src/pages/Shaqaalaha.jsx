import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { useT } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Search, Trash2, Pencil, HardHat } from "lucide-react";

const ROLE_META = {
  technician: { labelSo: "Farsamoyaqaani", labelEn: "Technician", labelAr: "فني" },
  operator: { labelSo: "Hawl-galiye", labelEn: "Operator", labelAr: "مشغل" },
  manager: { labelSo: "Maamule", labelEn: "Manager", labelAr: "مدير" },
  other: { labelSo: "Kale", labelEn: "Other", labelAr: "أخرى" },
};

const STATUS_META = {
  available: { bg: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" },
  on_task: { bg: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" },
  inactive: { bg: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300" },
};

const emptyForm = { full_name: "", phone: "", role: "technician", location: "", specialization: "", status: "available", hire_date: "" };

export default function Shaqaalaha() {
  const { toast } = useToast();
  const { t } = useT();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await base44.entities.Staff.list("-created_date", 200);
      setItems(data);
    } catch {
      toast({ variant: "destructive", title: t("common.error"), description: t("staff.error.load") });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => { setEditing(null); setForm({ ...emptyForm, hire_date: new Date().toISOString().slice(0, 10) }); setModalOpen(true); };
  const openEdit = (item) => { setEditing(item); setForm({ ...item }); setModalOpen(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await base44.entities.Staff.update(editing.id, form);
        toast({ description: t("staff.toast.updated") });
      } else {
        await base44.entities.Staff.create(form);
        toast({ description: t("staff.toast.created") });
      }
      setModalOpen(false);
      fetchData();
    } catch {
      toast({ variant: "destructive", title: t("common.error"), description: t("staff.error.save") });
    }
  };

  const handleDelete = async (item) => {
    try {
      await base44.entities.Staff.delete(item.id);
      toast({ description: t("staff.toast.deleted") });
      fetchData();
    } catch {
      toast({ variant: "destructive", title: t("common.error"), description: t("staff.error.delete") });
    }
  };

  const filtered = items.filter((i) => {
    const q = search.toLowerCase();
    return !q || i.full_name?.toLowerCase().includes(q) || i.phone?.toLowerCase().includes(q) || i.location?.toLowerCase().includes(q) || i.specialization?.toLowerCase().includes(q);
  });

  const Pill = ({ label, cls }) => (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}`}>{label}</span>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("staff.title")}</h1>
          <p className="text-muted-foreground text-sm mt-1">{t("staff.subtitle")}</p>
        </div>
        <Button onClick={openCreate} className="gap-2 bg-orange-500 hover:bg-orange-600 text-white rounded-full px-5">
          <Plus className="w-4 h-4" /> {t("staff.new")}
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder={t("staff.searchPlaceholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {loading ? (
          <div className="p-12 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <HardHat className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">{t("staff.empty")}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-muted-foreground text-xs uppercase tracking-wider">
                  <th className="text-left px-5 py-3 font-medium">{t("staff.col.name")}</th>
                  <th className="text-left px-5 py-3 font-medium">{t("staff.col.phone")}</th>
                  <th className="text-left px-5 py-3 font-medium">{t("staff.col.specialty")}</th>
                  <th className="text-left px-5 py-3 font-medium">{t("staff.col.location")}</th>
                  <th className="text-left px-5 py-3 font-medium">{t("staff.col.hireDate")}</th>
                  <th className="text-left px-5 py-3 font-medium">{t("staff.col.status")}</th>
                  <th className="text-right px-5 py-3 font-medium">{t("common.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id} className="border-b border-border/60 last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3">
                      <div className="text-foreground font-medium">{item.full_name}</div>
                    </td>
                    <td className="px-5 py-3 text-foreground">{item.phone}</td>
                    <td className="px-5 py-3 text-muted-foreground">{item.specialization || "—"}</td>
                    <td className="px-5 py-3 text-muted-foreground">{item.location || "—"}</td>
                    <td className="px-5 py-3 text-muted-foreground">{item.hire_date ? new Date(item.hire_date).toLocaleDateString() : "—"}</td>
                    <td className="px-5 py-3"><Pill label={t(`staff.status.${item.status}`)} cls={STATUS_META[item.status]?.bg || STATUS_META.available.bg} /></td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" title={t("common.edit")} onClick={() => openEdit(item)} className="h-8 w-8 text-muted-foreground hover:text-foreground">
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" title={t("common.delete")} onClick={() => handleDelete(item)} className="h-8 w-8 text-muted-foreground hover:text-red-500">
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
            <DialogTitle>{editing ? t("staff.edit") : t("staff.new")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("staff.col.name")}</Label>
                <Input required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} placeholder="Cabdi Rahman" />
              </div>
              <div className="space-y-2">
                <Label>{t("staff.col.phone")}</Label>
                <Input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="2526..." />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("staff.col.role")}</Label>
                <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(ROLE_META).map(([v, m]) => (
                      <SelectItem key={v} value={v}>{t(`staff.role.${v}`)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("staff.col.location")}</Label>
                <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Hargeisa" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("staff.col.specialty")}</Label>
                <Input value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} placeholder={t("staff.placeholder.specialty")} />
              </div>
              <div className="space-y-2">
                <Label>{t("staff.col.hireDate")}</Label>
                <Input type="date" value={form.hire_date} onChange={(e) => setForm({ ...form, hire_date: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t("staff.col.status")}</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.keys(STATUS_META).map((v) => (
                    <SelectItem key={v} value={v}>{t(`staff.status.${v}`)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>{t("common.cancel")}</Button>
              <Button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white">{editing ? t("common.save") : t("common.add")}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}