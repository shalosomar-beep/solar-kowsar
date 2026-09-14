import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { useT } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Store, Pencil, Trash2, Search } from "lucide-react";

const emptyForm = { name: "", contact: "", phone: "", category: "", payment_terms: "" };

export default function Tixdeliyayaasha() {
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
      const data = await base44.entities.Vendor.list("-created_date", 200);
      setItems(data);
    } catch {
      toast({ variant: "destructive", title: t("common.error"), description: t("vendor.error.load") });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (item) => {
    setEditing(item);
    setForm({
      name: item.name ?? "",
      contact: item.contact ?? "",
      phone: item.phone ?? "",
      category: item.category ?? "",
      payment_terms: item.payment_terms ?? "",
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await base44.entities.Vendor.update(editing.id, form);
        toast({ title: t("customers.toast.updated.title"), description: t("vendor.toast.updated") });
      } else {
        await base44.entities.Vendor.create(form);
        toast({ title: t("customers.toast.created.title"), description: t("vendor.toast.created") });
      }
      setModalOpen(false);
      fetchData();
    } catch {
      toast({ variant: "destructive", title: t("common.error"), description: t("vendor.error.save") });
    }
  };

  const handleDelete = async (item) => {
    try {
      await base44.entities.Vendor.delete(item.id);
      toast({ title: t("customers.toast.deleted.title"), description: t("vendor.toast.deleted") });
      fetchData();
    } catch {
      toast({ variant: "destructive", title: t("common.error"), description: t("vendor.error.delete") });
    }
  };

  const filtered = items.filter((i) => {
    const q = search.toLowerCase();
    return !q ||
      (i.name || "").toLowerCase().includes(q) ||
      (i.contact || "").toLowerCase().includes(q) ||
      (i.phone || "").includes(q) ||
      (i.category || "").toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("vendor.title")}</h1>
          <p className="text-muted-foreground text-sm mt-1">{t("vendor.subtitle")}</p>
        </div>
        <Button onClick={openCreate} className="gap-2 bg-amber-500 hover:bg-amber-600 text-white">
          <Plus className="w-4 h-4" /> {t("vendor.new")}
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder={t("vendor.searchPlaceholder")}
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
            <Store className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">{t("vendor.empty")}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-muted-foreground text-xs uppercase tracking-wider">
                  <th className="text-left px-5 py-3 font-medium">{t("vendor.col.name")}</th>
                  <th className="text-left px-5 py-3 font-medium">{t("vendor.col.contact")}</th>
                  <th className="text-left px-5 py-3 font-medium">{t("vendor.col.phone")}</th>
                  <th className="text-left px-5 py-3 font-medium">{t("vendor.col.category")}</th>
                  <th className="text-left px-5 py-3 font-medium">{t("vendor.col.paymentTerms")}</th>
                  <th className="text-right px-5 py-3 font-medium">{t("common.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id} className="border-b border-border/60 last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3 text-foreground font-medium">{item.name || "—"}</td>
                    <td className="px-5 py-3 text-muted-foreground">{item.contact || "—"}</td>
                    <td className="px-5 py-3 text-foreground">{item.phone || "—"}</td>
                    <td className="px-5 py-3 text-muted-foreground">{item.category || "—"}</td>
                    <td className="px-5 py-3 text-muted-foreground">{item.payment_terms || "—"}</td>
                    <td className="px-5 py-3 text-right">
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? t("vendor.edit") : t("vendor.new")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>{t("vendor.col.name")}</Label>
              <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="T.c. Hargeisa Solar Supplies" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("vendor.col.contact")}</Label>
                <Input value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} placeholder="T.c. Axmed Nur" />
              </div>
              <div className="space-y-2">
                <Label>{t("vendor.col.phone")}</Label>
                <Input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="2526..." />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t("vendor.col.category")}</Label>
              <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="T.c. Panels & Inverters" />
            </div>
            <div className="space-y-2">
              <Label>{t("vendor.col.paymentTerms")}</Label>
              <Input value={form.payment_terms} onChange={(e) => setForm({ ...form, payment_terms: e.target.value })} placeholder="T.c. 30 days after delivery" />
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