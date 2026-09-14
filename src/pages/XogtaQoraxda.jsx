import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { useT } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Sun, Pencil, Trash2, Search } from "lucide-react";
import SolarCharts from "@/components/solar/SolarCharts";

const emptyForm = {
  usage_date: new Date().toISOString().slice(0, 10),
  production_kwh: "",
  consumption_kwh: "",
  location: "",
  efficiency: "",
  weather: "",
};

export default function XogtaQoraxda() {
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
      const data = await base44.entities.SolarData.list("-usage_date", 200);
      setItems(data);
    } catch {
      toast({ variant: "destructive", title: t("common.error"), description: t("solarData.error.load") });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (item) => {
    setEditing(item);
    setForm({
      usage_date: item.usage_date ? item.usage_date.slice(0, 10) : "",
      production_kwh: item.production_kwh ?? "",
      consumption_kwh: item.consumption_kwh ?? "",
      location: item.location ?? "",
      efficiency: item.efficiency ?? "",
      weather: item.weather ?? "",
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      production_kwh: Number(form.production_kwh),
      consumption_kwh: form.consumption_kwh === "" ? null : Number(form.consumption_kwh),
      efficiency: form.efficiency === "" ? null : Number(form.efficiency),
    };
    try {
      if (editing) {
        await base44.entities.SolarData.update(editing.id, payload);
        toast({ title: t("customers.toast.updated.title"), description: t("solarData.toast.updated") });
      } else {
        await base44.entities.SolarData.create(payload);
        toast({ title: t("customers.toast.created.title"), description: t("solarData.toast.created") });
      }
      setModalOpen(false);
      fetchData();
    } catch {
      toast({ variant: "destructive", title: t("common.error"), description: t("solarData.error.save") });
    }
  };

  const handleDelete = async (item) => {
    try {
      await base44.entities.SolarData.delete(item.id);
      toast({ title: t("customers.toast.deleted.title"), description: t("solarData.toast.deleted") });
      fetchData();
    } catch {
      toast({ variant: "destructive", title: t("common.error"), description: t("solarData.error.delete") });
    }
  };

  const filtered = items.filter((i) => {
    const q = search.toLowerCase();
    const d = i.usage_date || "";
    const loc = i.location || "";
    return !q || d.includes(q) || loc.toLowerCase().includes(q) || String(i.production_kwh || "").includes(q);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("solarData.title")}</h1>
          <p className="text-muted-foreground text-sm mt-1">{t("solarData.subtitle")}</p>
        </div>
        <Button onClick={openCreate} className="gap-2 bg-amber-500 hover:bg-amber-600 text-white">
          <Plus className="w-4 h-4" /> {t("solarData.new")}
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder={t("solarData.searchPlaceholder")}
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
            <Sun className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">{t("solarData.empty")}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-muted-foreground text-xs uppercase tracking-wider">
                  <th className="text-left px-5 py-3 font-medium">{t("solarData.col.date")}</th>
                  <th className="text-left px-5 py-3 font-medium">{t("solarData.col.production")}</th>
                  <th className="text-left px-5 py-3 font-medium">{t("solarData.col.consumption")}</th>
                  <th className="text-left px-5 py-3 font-medium">{t("solarData.col.location")}</th>
                  <th className="text-left px-5 py-3 font-medium">{t("solarData.col.efficiency")}</th>
                  <th className="text-left px-5 py-3 font-medium">{t("solarData.col.weather")}</th>
                  <th className="text-right px-5 py-3 font-medium">{t("common.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id} className="border-b border-border/60 last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3 text-foreground font-medium">{item.usage_date || "—"}</td>
                    <td className="px-5 py-3 text-amber-600 dark:text-amber-400 font-semibold">{item.production_kwh ?? "—"}</td>
                    <td className="px-5 py-3 text-foreground">{item.consumption_kwh ?? "—"}</td>
                    <td className="px-5 py-3 text-muted-foreground">{item.location || "—"}</td>
                    <td className="px-5 py-3 text-foreground">{item.efficiency != null ? `${item.efficiency}%` : "—"}</td>
                    <td className="px-5 py-3 text-muted-foreground">{item.weather || "—"}</td>
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

      {!loading && filtered.length > 0 && <SolarCharts items={filtered} />}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? t("solarData.edit") : t("solarData.new")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>{t("solarData.form.date")}</Label>
              <Input type="date" required value={form.usage_date} onChange={(e) => setForm({ ...form, usage_date: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("solarData.form.production")}</Label>
                <Input type="number" step="0.1" required value={form.production_kwh} onChange={(e) => setForm({ ...form, production_kwh: e.target.value })} placeholder="0.0" />
              </div>
              <div className="space-y-2">
                <Label>{t("solarData.form.consumption")}</Label>
                <Input type="number" step="0.1" value={form.consumption_kwh} onChange={(e) => setForm({ ...form, consumption_kwh: e.target.value })} placeholder="0.0" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("solarData.form.location")}</Label>
                <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="T.c. Saqafka A" />
              </div>
              <div className="space-y-2">
                <Label>{t("solarData.form.efficiency")}</Label>
                <Input type="number" step="0.1" value={form.efficiency} onChange={(e) => setForm({ ...form, efficiency: e.target.value })} placeholder="0.0" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t("solarData.form.weather")}</Label>
              <Input value={form.weather} onChange={(e) => setForm({ ...form, weather: e.target.value })} placeholder={t("solarData.form.weatherPlaceholder")} />
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