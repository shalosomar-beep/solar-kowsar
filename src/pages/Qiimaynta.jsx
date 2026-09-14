import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, Pencil, Tag } from "lucide-react";

const STATUS_META = {
  active: { label: "Firfircoon", bg: "bg-emerald-500/15", text: "text-emerald-400" },
  inactive: { label: "Daman", bg: "bg-zinc-500/15", text: "text-zinc-400" },
};

const emptyForm = { name: "", description: "", rate_per_kwh: "", currency: "USD", effective_date: "", status: "active", is_default: false };

export default function Qiimaynta() {
  const { toast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const fetch = async () => {
    try {
      setLoading(true);
      const data = await base44.entities.Tariff.list("-effective_date", 200);
      setItems(data);
    } catch {
      toast({ variant: "destructive", title: "Khalad", description: "Qiimaynta lama keeni karo" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, []);

  const openCreate = () => { setEditing(null); setForm({ ...emptyForm, effective_date: new Date().toISOString().slice(0, 10) }); setModalOpen(true); };
  const openEdit = (item) => { setEditing(item); setForm({ ...item, rate_per_kwh: item.rate_per_kwh ?? "" }); setModalOpen(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, rate_per_kwh: Number(form.rate_per_kwh) || 0 };
      // Only one default at a time
      if (payload.is_default) {
        await base44.entities.Tariff.updateMany({ is_default: true }, { $set: { is_default: false } }).catch(() => {});
      }
      if (editing) {
        await base44.entities.Tariff.update(editing.id, payload);
        toast({ title: "Waa la cusboonaysiiyay" });
      } else {
        await base44.entities.Tariff.create(payload);
        toast({ title: "Qiimayn waa la diiwaangeliyay" });
      }
      setModalOpen(false);
      fetch();
    } catch {
      toast({ variant: "destructive", title: "Khalad", description: "Hawl lama soosaarin karo" });
    }
  };

  const handleDelete = async (item) => {
    try {
      await base44.entities.Tariff.delete(item.id);
      toast({ title: "Waa la tirtiray" });
      fetch();
    } catch {
      toast({ variant: "destructive", title: "Khalad", description: "Lama tirtiri karo" });
    }
  };

  const activeDefault = items.find((i) => i.is_default && i.status === "active") || items.find((i) => i.status === "active");

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
            <Tag className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Qiimaynta (Tariffs)</h1>
            <p className="text-muted-foreground text-sm">Isku beddel qiimaha kWh ee macaamiisha la iibiyo</p>
          </div>
        </div>
        <Button onClick={openCreate} className="gap-2 bg-orange-500 hover:bg-orange-600 text-white">
          <Plus className="w-4 h-4" /> Qiimayn Cusub
        </Button>
      </div>

      {activeDefault && (
        <div className="rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 p-5 text-white flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider opacity-90">Qiimaha hadda firfircoon</p>
            <p className="text-3xl font-bold mt-1">${Number(activeDefault.rate_per_kwh).toFixed(2)} <span className="text-lg font-medium opacity-90">/ kWh</span></p>
            <p className="text-xs opacity-80 mt-1">{activeDefault.name}</p>
          </div>
          {activeDefault.is_default && (
            <span className="px-3 py-1.5 rounded-full bg-black/30 text-white text-xs font-semibold whitespace-nowrap">Qiimaynta Caadiga ah</span>
          )}
        </div>
      )}

      <div className="rounded-2xl bg-card border border-border overflow-hidden">
        {loading ? (
          <div className="p-12 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <Tag className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Qiimayn lama helin. Ku dar qiimayn cusub.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground text-xs uppercase tracking-wider">
                  <th className="text-left px-6 py-3 font-medium">Qiimaynta</th>
                  <th className="text-left px-6 py-3 font-medium">Qiimaha/kWh</th>
                  <th className="text-left px-6 py-3 font-medium">Lacagta</th>
                  <th className="text-left px-6 py-3 font-medium">Taariikhda</th>
                  <th className="text-left px-6 py-3 font-medium">Xaaladda</th>
                  <th className="text-right px-6 py-3 font-medium">Tallaabo</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const st = STATUS_META[item.status] || STATUS_META.active;
                  return (
                    <tr key={item.id} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                      <td className="px-6 py-3">
                        <div className="text-foreground font-medium flex items-center gap-2">
                          {item.name}
                          {item.is_default && <span className="text-xs text-orange-400">★</span>}
                        </div>
                        {item.description && <div className="text-muted-foreground text-xs">{item.description}</div>}
                      </td>
                      <td className="px-6 py-3 text-foreground font-semibold">${Number(item.rate_per_kwh).toFixed(2)}</td>
                      <td className="px-6 py-3 text-muted-foreground">{item.currency}</td>
                      <td className="px-6 py-3 text-muted-foreground">{item.effective_date ? new Date(item.effective_date).toLocaleDateString() : "—"}</td>
                      <td className="px-6 py-3">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${st.bg} ${st.text}`}>{st.label}</span>
                      </td>
                      <td className="px-6 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(item)} className="h-8 w-8 text-muted-foreground hover:text-blue-400">
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(item)} className="h-8 w-8 text-muted-foreground hover:text-red-400">
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
        <DialogContent className="bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle>{editing ? "Wax Ka Bedel Qiimaynta" : "Kudar Qiimayn Cusub"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Magaca Qiimaynta</Label>
              <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-background border-border text-foreground" placeholder="T.c. Qiimaynta Caadiga ah" />
            </div>
            <div className="space-y-2">
              <Label>Faahfaahinta</Label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="bg-background border-border text-foreground" placeholder="Sharax qiimaynta..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Qiimaha/kWh</Label>
                <Input required type="number" step="0.01" value={form.rate_per_kwh} onChange={(e) => setForm({ ...form, rate_per_kwh: e.target.value })} className="bg-background border-border text-foreground" placeholder="0.15" />
              </div>
              <div className="space-y-2">
                <Label>Lacagta</Label>
                <Select value={form.currency} onValueChange={(v) => setForm({ ...form, currency: v })}>
                  <SelectTrigger className="bg-background border-border text-foreground"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="SOS">SOS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Taariikhda</Label>
                <Input type="date" value={form.effective_date} onChange={(e) => setForm({ ...form, effective_date: e.target.value })} className="bg-background border-border text-foreground" />
              </div>
              <div className="space-y-2">
                <Label>Xaaladda</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger className="bg-background border-border text-foreground"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(STATUS_META).map(([v, m]) => (
                      <SelectItem key={v} value={v}>{m.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <Checkbox checked={form.is_default} onCheckedChange={(v) => setForm({ ...form, is_default: v })} />
              Qiimaynta Caadiga ah
            </label>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)} className="border-border text-muted-foreground">Jooji</Button>
              <Button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white">{editing ? "Cusboonaysii" : "Ku Dar"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}