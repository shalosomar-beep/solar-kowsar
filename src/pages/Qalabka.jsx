import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Package } from "lucide-react";
import EquipmentCard, { CATEGORY_META, STATUS_META } from "@/components/equipment/EquipmentCard";
import { notifyEquipmentStatusChange } from "@/lib/alertNotifications";

const emptyForm = {
  name: "", category: "battery", status: "online", location: "",
  battery_level: "", temperature: "", health: "", serial_number: "",
};

export default function Qalabka() {
  const { toast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const fetch = async () => {
    try {
      setLoading(true);
      const data = await base44.entities.Equipment.list("-created_date", 200);
      setItems(data);
    } catch {
      toast({ variant: "destructive", title: "Khalad", description: "Qalabka lama keeni karo" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, []);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (item) => {
    setEditing(item);
    setForm({
      ...item,
      battery_level: item.battery_level ?? "",
      temperature: item.temperature ?? "",
      health: item.health ?? "",
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      battery_level: form.battery_level === "" ? null : Number(form.battery_level),
      temperature: form.temperature === "" ? null : Number(form.temperature),
      health: form.health === "" ? null : Number(form.health),
    };
    try {
      if (editing) {
        await base44.entities.Equipment.update(editing.id, payload);
        await notifyEquipmentStatusChange(payload, editing.status);
        toast({ title: "Waa la cusboonaysiiyay", description: "Qalabka waa la bedelay" });
      } else {
        await base44.entities.Equipment.create(payload);
        await notifyEquipmentStatusChange(payload);
        toast({ title: "Waa la diiwaangeliyay", description: "Qalab cusub waa la xareeyay" });
      }
      setModalOpen(false);
      fetch();
    } catch {
      toast({ variant: "destructive", title: "Khalad", description: "Hawl lama soosaarin karo" });
    }
  };

  const handleDelete = async (item) => {
    try {
      await base44.entities.Equipment.delete(item.id);
      toast({ title: "Waa la tirtiray", description: "Qalabka waa la saaray" });
      fetch();
    } catch {
      toast({ variant: "destructive", title: "Khalad", description: "Lama tirtiri karo" });
    }
  };

  const onlineCount = items.filter((i) => i.status === "online").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Qalabka</h1>
          <p className="text-zinc-400 text-sm mt-1">Kormeerka qalabka solar-ka iyo korontada</p>
        </div>
        <Button onClick={openCreate} className="gap-2 bg-orange-500 hover:bg-orange-600 text-white">
          <Plus className="w-4 h-4" /> Kudar Qalab
        </Button>
      </div>

      <div className="flex items-center gap-4 text-sm text-zinc-400">
        <span><span className="text-white font-semibold">{items.length}</span> qalab</span>
        <span className="text-zinc-700">·</span>
        <span><span className="text-emerald-400 font-semibold">{onlineCount}</span> online</span>
      </div>

      {loading ? (
        <div className="py-20 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="py-20 text-center text-zinc-500">
          <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Qalab lama helin. Ku dar qalab cusub.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <EquipmentCard key={item.id} item={item} onEdit={openEdit} onDelete={handleDelete} />
          ))}
        </div>
      )}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle>{editing ? "Wax Ka Beddel Qalabka" : "Kudar Qalab Cusub"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-zinc-300">Magaca Qalabka</Label>
              <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-zinc-800 border-zinc-700 text-white" placeholder="T.c. Battery Bank A" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-zinc-300">Nooca Qalabka</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800">
                    {Object.entries(CATEGORY_META).map(([v, m]) => (
                      <SelectItem key={v} value={v}>{m.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">Xaaladda</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800">
                    {Object.entries(STATUS_META).map(([v, m]) => (
                      <SelectItem key={v} value={v}>{m.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-zinc-300">Goobta</Label>
                <Input required value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="bg-zinc-800 border-zinc-700 text-white" placeholder="T.c. Hodan" />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">Lambarka Siiraadka</Label>
                <Input required value={form.serial_number} onChange={(e) => setForm({ ...form, serial_number: e.target.value })} className="bg-zinc-800 border-zinc-700 text-white" placeholder="T.c. BAT-2025-001" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-zinc-300">Battery (%)</Label>
                <Input type="number" value={form.battery_level} onChange={(e) => setForm({ ...form, battery_level: e.target.value })} className="bg-zinc-800 border-zinc-700 text-white" placeholder="—" />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">Kulka (°C)</Label>
                <Input type="number" value={form.temperature} onChange={(e) => setForm({ ...form, temperature: e.target.value })} className="bg-zinc-800 border-zinc-700 text-white" placeholder="—" />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">Caafimaadka (%)</Label>
                <Input type="number" value={form.health} onChange={(e) => setForm({ ...form, health: e.target.value })} className="bg-zinc-800 border-zinc-700 text-white" placeholder="—" />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)} className="border-zinc-700 text-zinc-300">Jooji</Button>
              <Button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white">{editing ? "Kaydi" : "Ku Dar"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}