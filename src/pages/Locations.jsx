import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, MapPin, Edit2, Trash2, X, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useT } from "@/lib/i18n";

export default function Locations() {
  const { t } = useT();
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const { toast } = useToast();

  const [form, setForm] = useState({
    name: "", city: "", address: "", total_panels: "", total_capacity_kw: "", status: "active", installation_date: "",
  });

  const load = () => {
    setLoading(true);
    base44.entities.Location.list("-created_date").then(setLocations).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openEdit = (loc) => {
    setEditing(loc);
    setForm({
      name: loc.name || "", city: loc.city || "", address: loc.address || "",
      total_panels: loc.total_panels || "", total_capacity_kw: loc.total_capacity_kw || "",
      status: loc.status || "active", installation_date: loc.installation_date || "",
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      ...form,
      total_panels: form.total_panels ? Number(form.total_panels) : undefined,
      total_capacity_kw: form.total_capacity_kw ? Number(form.total_capacity_kw) : undefined,
    };
    if (editing) {
      await base44.entities.Location.update(editing.id, data);
      toast({ title: t("customers.toast.updated.title") });
    } else {
      await base44.entities.Location.create(data);
      toast({ title: t("customers.toast.created.title"), description: t("locations.toast.created.desc") });
    }
    setShowForm(false);
    setEditing(null);
    setForm({ name: "", city: "", address: "", total_panels: "", total_capacity_kw: "", status: "active", installation_date: "" });
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm(t("locations.confirmDelete"))) return;
    await base44.entities.Location.delete(id);
    toast({ title: t("customers.toast.deleted.title") });
    load();
  };

  const statusColor = {
    active: "bg-emerald-500/20 text-emerald-400 border-emerald-500/20",
    maintenance: "bg-amber-500/20 text-amber-400 border-amber-500/20",
    inactive: "bg-zinc-500/20 text-zinc-400 border-zinc-500/20",
  };
  const statusLabel = { active: t("status.active"), maintenance: t("status.maintenance"), inactive: t("status.inactive") };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">{t("locations.title")}</h1>
          <p className="text-zinc-400 text-sm mt-1">{t("locations.subtitle")}</p>
        </div>
        <Button onClick={() => { setEditing(null); setForm({ name: "", city: "", address: "", total_panels: "", total_capacity_kw: "", status: "active", installation_date: "" }); setShowForm(true); }} className="bg-amber-500 hover:bg-amber-600 text-black font-semibold">
          <Plus className="w-4 h-4 mr-2" /> {t("locations.new")}
        </Button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-5 border-b border-zinc-800">
              <h2 className="text-white font-semibold">{editing ? t("common.edit") : t("locations.new")}</h2>
              <button onClick={() => setShowForm(false)} className="text-zinc-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-zinc-300 text-xs">{t("locations.form.name")} *</Label>
                  <Input required value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className="mt-1 bg-zinc-800 border-zinc-700 text-white" />
                </div>
                <div>
                  <Label className="text-zinc-300 text-xs">{t("form.city")} *</Label>
                  <Input required value={form.city} onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))} className="mt-1 bg-zinc-800 border-zinc-700 text-white" />
                </div>
                <div className="col-span-2">
                  <Label className="text-zinc-300 text-xs">{t("form.address")}</Label>
                  <Input value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} className="mt-1 bg-zinc-800 border-zinc-700 text-white" />
                </div>
                <div>
                  <Label className="text-zinc-300 text-xs">{t("locations.form.panels")}</Label>
                  <Input type="number" value={form.total_panels} onChange={(e) => setForm((p) => ({ ...p, total_panels: e.target.value }))} className="mt-1 bg-zinc-800 border-zinc-700 text-white" />
                </div>
                <div>
                  <Label className="text-zinc-300 text-xs">{t("locations.form.capacity")}</Label>
                  <Input type="number" step="0.1" value={form.total_capacity_kw} onChange={(e) => setForm((p) => ({ ...p, total_capacity_kw: e.target.value }))} className="mt-1 bg-zinc-800 border-zinc-700 text-white" />
                </div>
                <div>
                  <Label className="text-zinc-300 text-xs">{t("form.status")}</Label>
                  <Select value={form.status} onValueChange={(v) => setForm((p) => ({ ...p, status: v }))}>
                    <SelectTrigger className="mt-1 bg-zinc-800 border-zinc-700 text-white"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">{t("status.active")}</SelectItem>
                      <SelectItem value="maintenance">{t("status.maintenance")}</SelectItem>
                      <SelectItem value="inactive">{t("status.inactive")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-zinc-300 text-xs">{t("locations.form.installationDate")}</Label>
                  <Input type="date" value={form.installation_date} onChange={(e) => setForm((p) => ({ ...p, installation_date: e.target.value }))} className="mt-1 bg-zinc-800 border-zinc-700 text-white" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">{t("common.cancel")}</Button>
                <Button type="submit" className="bg-amber-500 hover:bg-amber-600 text-black font-semibold">{editing ? t("common.save") : t("form.submit.create")}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
        </div>
      ) : locations.length === 0 ? (
        <div className="text-center py-20 text-zinc-500">
          <MapPin className="w-12 h-12 mx-auto mb-3 text-zinc-700" />
          <p className="text-lg font-medium">{t("locations.empty")}</p>
          <p className="text-sm mt-1">{t("locations.empty.sub")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {locations.map((loc) => (
            <div key={loc.id} className="rounded-2xl bg-zinc-900/50 border border-zinc-800/50 p-5 hover:border-zinc-700/50 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="p-2.5 rounded-xl bg-amber-500/20">
                  <Sun className="w-5 h-5 text-amber-400" />
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColor[loc.status]}`}>
                  {statusLabel[loc.status] || loc.status}
                </span>
              </div>
              <h3 className="text-white font-semibold">{loc.name}</h3>
              <p className="text-zinc-400 text-sm mt-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> {loc.city}{loc.address ? `, ${loc.address}` : ""}</p>
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div>
                  <p className="text-zinc-500 text-xs">{t("locations.panels")}</p>
                  <p className="text-white font-semibold">{loc.total_panels || "—"}</p>
                </div>
                <div>
                  <p className="text-zinc-500 text-xs">{t("locations.capacity")}</p>
                  <p className="text-white font-semibold">{loc.total_capacity_kw || "—"}</p>
                </div>
              </div>
              <div className="flex justify-end gap-1 mt-4 pt-3 border-t border-zinc-800/30">
                <button onClick={() => openEdit(loc)} className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-amber-400 transition-colors"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(loc.id)} className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}