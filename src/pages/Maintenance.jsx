import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Search, Trash2, Wrench } from "lucide-react";

const PRIORITY_META = {
  low: { label: "low", bg: "bg-zinc-500/15", text: "text-zinc-300" },
  medium: { label: "medium", bg: "bg-blue-500/15", text: "text-blue-400" },
  high: { label: "high", bg: "bg-amber-500/15", text: "text-amber-400" },
  critical: { label: "critical", bg: "bg-red-500/15", text: "text-red-400" },
};

const STATUS_META = {
  open: { label: "open", bg: "bg-amber-500/15", text: "text-amber-400" },
  in_progress: { label: "in_progress", bg: "bg-blue-500/15", text: "text-blue-400" },
  resolved: { label: "resolved", bg: "bg-emerald-500/15", text: "text-emerald-400" },
};

const emptyForm = { title: "", customer_name: "", priority: "medium", status: "open" };

export default function Maintenance() {
  const { toast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const fetch = async () => {
    try {
      setLoading(true);
      const data = await base44.entities.MaintenanceRequest.list("-created_date", 200);
      setItems(data);
    } catch {
      toast({ variant: "destructive", title: "Khalad", description: "Codsigga lama keeni karo" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, []);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await base44.entities.MaintenanceRequest.update(editing.id, form);
        toast({ title: "Waa la cusboonaysiiyay" });
      } else {
        await base44.entities.MaintenanceRequest.create(form);
        toast({ title: "Waa la diiwaangeliyay", description: "Codsi cusub waa la xareeyay" });
      }
      setModalOpen(false);
      fetch();
    } catch {
      toast({ variant: "destructive", title: "Khalad", description: "Hawl lama soosaarin karo" });
    }
  };

  const handleDelete = async (item) => {
    try {
      await base44.entities.MaintenanceRequest.delete(item.id);
      toast({ title: "Waa la tirtiray", description: "Codsigga waa la saaray" });
      fetch();
    } catch {
      toast({ variant: "destructive", title: "Khalad", description: "Lama tirtiri karo" });
    }
  };

  const filtered = items.filter((i) => {
    const q = search.toLowerCase();
    return !q || i.title?.toLowerCase().includes(q) || i.customer_name?.toLowerCase().includes(q) || i.status?.toLowerCase().includes(q);
  });

  const counts = {
    total: items.length,
    open: items.filter((i) => i.status === "open").length,
    in_progress: items.filter((i) => i.status === "in_progress").length,
    resolved: items.filter((i) => i.status === "resolved").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
            <Wrench className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Dayactir</h1>
            <p className="text-zinc-400 text-sm">Maamulka codsigga dayactirka</p>
          </div>
        </div>
        <Button onClick={openCreate} className="gap-2 bg-orange-500 hover:bg-orange-600 text-white">
          <Plus className="w-4 h-4" /> Kudar Codsi
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Guud" sub="Codsiyada oo dhan" value={counts.total} bg="bg-zinc-800/60" text="text-white" />
        <StatCard label="U Baahan" sub="U baahan in la bilaabo" value={counts.open} bg="bg-amber-500/10" text="text-amber-400" />
        <StatCard label="Socda" sub="Si socota" value={counts.in_progress} bg="bg-blue-500/10" text="text-blue-400" />
        <StatCard label="Dhameeyay" sub="La dhammeeyay" value={counts.resolved} bg="bg-emerald-500/10" text="text-emerald-400" />
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <Input
          placeholder="Raadi codsi, macmiil, ama xaalad..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600"
        />
      </div>

      <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800 overflow-hidden">
        {loading ? (
          <div className="p-12 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-zinc-500">
            <Wrench className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Codsi lama helin. Ku dar codsi cusub.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400 text-xs uppercase tracking-wider">
                  <th className="text-left px-6 py-3 font-medium">Cinwaanka</th>
                  <th className="text-left px-6 py-3 font-medium">Macaamisha</th>
                  <th className="text-left px-6 py-3 font-medium">Priority</th>
                  <th className="text-left px-6 py-3 font-medium">Xaaladda</th>
                  <th className="text-left px-6 py-3 font-medium">Taariikh</th>
                  <th className="text-right px-6 py-3 font-medium">Fal</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => {
                  const pr = PRIORITY_META[item.priority] || PRIORITY_META.medium;
                  const st = STATUS_META[item.status] || STATUS_META.open;
                  return (
                    <tr key={item.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                      <td className="px-6 py-3 text-white font-medium">{item.title}</td>
                      <td className="px-6 py-3 text-zinc-300">{item.customer_name}</td>
                      <td className="px-6 py-3">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${pr.bg} ${pr.text}`}>{pr.label}</span>
                      </td>
                      <td className="px-6 py-3">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${st.bg} ${st.text}`}>{st.label}</span>
                      </td>
                      <td className="px-6 py-3 text-zinc-400">{item.created_date ? new Date(item.created_date).toLocaleDateString() : "—"}</td>
                      <td className="px-6 py-3 text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(item)} className="h-8 w-8 text-zinc-400 hover:text-red-400">
                          <Trash2 className="w-4 h-4" />
                        </Button>
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
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle>Kudar Codsi Dayactir Cusub</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-zinc-300">Cinwaanka Codsiga</Label>
              <Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="bg-zinc-800 border-zinc-700 text-white" placeholder="T.c. Battery replacement needed" />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Macaamisha</Label>
              <Input required value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} className="bg-zinc-800 border-zinc-700 text-white" placeholder="T.c. Axmed Xasan" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-zinc-300">Muhimada</Label>
                <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800">
                    {Object.entries(PRIORITY_META).map(([v, m]) => (
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
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)} className="border-zinc-700 text-zinc-300">Jooji</Button>
              <Button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white">Ku Dar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatCard({ label, sub, value, bg, text }) {
  return (
    <div className={`rounded-2xl border border-zinc-800 p-5 ${bg}`}>
      <p className="text-zinc-400 text-xs font-medium uppercase tracking-wider">{label}</p>
      <p className={`text-3xl font-bold mt-2 ${text}`}>{value}</p>
      <p className="text-zinc-500 text-xs mt-1">{sub}</p>
    </div>
  );
}