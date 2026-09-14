import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Search, Trash2, Pencil, Check, AlertTriangle, ShieldAlert, Info, Siren } from "lucide-react";
import { notifyAlarmCreated } from "@/lib/alertNotifications";

const SEVERITY_META = {
  critical: { label: "Hala", bg: "bg-red-500/15", text: "text-red-400", border: "border-red-500/30", icon: ShieldAlert },
  warning: { label: "Digiin", bg: "bg-amber-500/15", text: "text-amber-400", border: "border-amber-500/30", icon: AlertTriangle },
  info: { label: "War", bg: "bg-blue-500/15", text: "text-blue-400", border: "border-blue-500/30", icon: Info },
};

const TYPE_META = {
  power_outage: "Koronto la'aan",
  cable_damage: "Xadhig gubay",
  battery_low: "Baytari hoose",
  meter_stopped: "Mitaar damay",
  inverter_warning: "Inverter digniin",
  other: "Kale",
};

const emptyForm = { name: "", alarm_id: "", severity: "warning", type: "other", location: "", description: "", alarm_date: "", alarm_time: "", acknowledged: false };

export default function Alarms() {
  const { toast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sevFilter, setSevFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [ackOnly, setAckOnly] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const fetch = async () => {
    try {
      setLoading(true);
      const data = await base44.entities.Alarm.list("-created_date", 200);
      setItems(data);
    } catch {
      toast({ variant: "destructive", title: "Khalad", description: "Ciladaha lama keeni karo" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, []);

  const openCreate = () => { setEditing(null); setForm({ ...emptyForm, alarm_date: new Date().toISOString().slice(0, 10), alarm_time: new Date().toTimeString().slice(0, 5) }); setModalOpen(true); };
  const openEdit = (item) => { setEditing(item); setForm({ ...item }); setModalOpen(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await base44.entities.Alarm.update(editing.id, form);
        toast({ title: "Waa la cusboonaysiiyay" });
      } else {
        await base44.entities.Alarm.create(form);
        await notifyAlarmCreated(form);
        toast({ title: "Cilad waa la diiwaangeliyay" });
      }
      setModalOpen(false);
      fetch();
    } catch {
      toast({ variant: "destructive", title: "Khalad", description: "Hawl lama soosaarin karo" });
    }
  };

  const handleDelete = async (item) => {
    try {
      await base44.entities.Alarm.delete(item.id);
      toast({ title: "Waa la tirtiray" });
      fetch();
    } catch {
      toast({ variant: "destructive", title: "Khalad", description: "Lama tirtiri karo" });
    }
  };

  const handleAck = async (item) => {
    try {
      await base44.entities.Alarm.update(item.id, { acknowledged: !item.acknowledged });
      toast({ title: item.acknowledged ? "Firtirkaan laga saaray" : "Waa la firtiray" });
      fetch();
    } catch {
      toast({ variant: "destructive", title: "Khalad", description: "Lama cusboonaysiin karo" });
    }
  };

  const filtered = items.filter((i) => {
    const q = search.toLowerCase();
    const matchQ = !q || i.name?.toLowerCase().includes(q) || i.alarm_id?.toLowerCase().includes(q) || i.location?.toLowerCase().includes(q);
    const matchSev = sevFilter === "all" || i.severity === sevFilter;
    const matchType = typeFilter === "all" || i.type === typeFilter;
    const matchAck = !ackOnly || i.acknowledged;
    return matchQ && matchSev && matchType && matchAck;
  });

  const counts = {
    critical: items.filter((i) => i.severity === "critical" && !i.acknowledged).length,
    warning: items.filter((i) => i.severity === "warning" && !i.acknowledged).length,
    acknowledged: items.filter((i) => i.acknowledged).length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
            <Siren className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              Ciladaha Farsamada (Alarms)
              <AlertTriangle className="w-5 h-5 text-orange-500" />
            </h1>
            <p className="text-muted-foreground text-sm">Ciladaha qalabka ee degdega ah — si farsamoyaqaannada ay u qortaan</p>
          </div>
        </div>
        <Button onClick={openCreate} className="gap-2 bg-orange-500 hover:bg-orange-600 text-white">
          <Plus className="w-4 h-4" /> Cusboonaysii Qayb
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Halaat" sub="Ciladaha halista ah" value={counts.critical} bg="bg-red-500/10" text="text-red-400" border="border-red-500/20" />
        <StatCard label="Halista" sub="Digiinada furan" value={counts.warning} bg="bg-amber-500/10" text="text-amber-400" border="border-amber-500/20" />
        <StatCard label="La xaliyay" sub="La firtiray" value={counts.acknowledged} bg="bg-emerald-500/10" text="text-emerald-400" border="border-emerald-500/20" />
      </div>

      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Raadi cilad..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-card border-border text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <Select value={sevFilter} onValueChange={setSevFilter}>
          <SelectTrigger className="md:w-44 bg-card border-border text-foreground"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Dhammaan dara</SelectItem>
            <SelectItem value="critical">Hala</SelectItem>
            <SelectItem value="warning">Digiin</SelectItem>
            <SelectItem value="info">War</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="md:w-48 bg-card border-border text-foreground"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Dhammaan nooc</SelectItem>
            {Object.entries(TYPE_META).map(([v, l]) => (
              <SelectItem key={v} value={v}>{l}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <label className="flex items-center gap-2 text-sm text-muted-foreground whitespace-nowrap">
          <Checkbox checked={ackOnly} onCheckedChange={setAckOnly} />
          Firtircoon kaliya
        </label>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="p-12 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl bg-card border border-border p-12 text-center text-muted-foreground">
            <Siren className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Cilad lama helin. Ku dar cilad cusub.</p>
          </div>
        ) : (
          filtered.map((item) => {
            const sev = SEVERITY_META[item.severity] || SEVERITY_META.warning;
            const SevIcon = sev.icon;
            return (
              <div key={item.id} className={`rounded-xl bg-card border ${sev.border} p-4 ${item.acknowledged ? "opacity-60" : ""}`}>
                <div className="flex items-start gap-3">
                  <div className={`p-2.5 rounded-lg ${sev.bg}`}>
                    <SevIcon className={`w-5 h-5 ${sev.text}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-foreground font-semibold">{item.name}</h3>
                      {item.alarm_id && <span className="text-xs text-muted-foreground">#{item.alarm_id}</span>}
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${sev.bg} ${sev.text}`}>{sev.label}</span>
                      <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent text-muted-foreground">{TYPE_META[item.type] || item.type}</span>
                      {item.acknowledged && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-400">
                          <Check className="w-3 h-3" /> La firtiray
                        </span>
                      )}
                    </div>
                    {item.description && <p className="text-muted-foreground text-sm mt-1">{item.description}</p>}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2 flex-wrap">
                      {item.alarm_date && <span>{new Date(item.alarm_date).toLocaleDateString()}{item.alarm_time ? ` · ${item.alarm_time}` : ""}</span>}
                      {item.location && <span className="flex items-center gap-1"><span>📍</span>{item.location}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="icon" onClick={() => handleAck(item)} className={`h-8 w-8 ${item.acknowledged ? "text-muted-foreground" : "text-emerald-400 hover:text-emerald-300"}`} title={item.acknowledged ? "Ka saar firtirkaan" : "Firtir"}>
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => openEdit(item)} className="h-8 w-8 text-muted-foreground hover:text-blue-400" title="Wax ka bedel">
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(item)} className="h-8 w-8 text-muted-foreground hover:text-red-400" title="Tirtir">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle>{editing ? "Wax Ka Bedel Ciladda" : "Kudar Cilad Cusub"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Magaca Ciladda</Label>
              <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-background border-border text-foreground" placeholder="T.c. Koronto la'aan degmo Hodan" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Aqoonsi</Label>
                <Input value={form.alarm_id} onChange={(e) => setForm({ ...form, alarm_id: e.target.value })} className="bg-background border-border text-foreground" placeholder="ALM-001" />
              </div>
              <div className="space-y-2">
                <Label>Goobta</Label>
                <Input required value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="bg-background border-border text-foreground" placeholder="Hodan" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Halista</Label>
                <Select value={form.severity} onValueChange={(v) => setForm({ ...form, severity: v })}>
                  <SelectTrigger className="bg-background border-border text-foreground"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(SEVERITY_META).map(([v, m]) => (
                      <SelectItem key={v} value={v}>{m.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Nooca</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger className="bg-background border-border text-foreground"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(TYPE_META).map(([v, l]) => (
                      <SelectItem key={v} value={v}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Taariikhda</Label>
                <Input type="date" value={form.alarm_date} onChange={(e) => setForm({ ...form, alarm_date: e.target.value })} className="bg-background border-border text-foreground" />
              </div>
              <div className="space-y-2">
                <Label>Saacad</Label>
                <Input type="time" value={form.alarm_time} onChange={(e) => setForm({ ...form, alarm_time: e.target.value })} className="bg-background border-border text-foreground" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Faahfaahinta</Label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="bg-background border-border text-foreground" placeholder="Sharax ciladda..." />
            </div>
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <Checkbox checked={form.acknowledged} onCheckedChange={(v) => setForm({ ...form, acknowledged: v })} />
              La firtiray
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

function StatCard({ label, sub, value, bg, text, border }) {
  return (
    <div className={`rounded-xl border ${border} p-4 ${bg}`}>
      <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">{label}</p>
      <p className={`text-3xl font-bold mt-2 ${text}`}>{value}</p>
      <p className="text-muted-foreground text-xs mt-1">{sub}</p>
    </div>
  );
}