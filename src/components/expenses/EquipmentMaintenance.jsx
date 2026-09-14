import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Wrench, Trash2, Pencil, X } from "lucide-react";

const EQUIPMENT_TYPES = [
  "Solar Panel",
  "Inverter",
  "Battery",
  "Charge Controller",
  "Wiring/Cable",
  "Meter",
  "Mounting Structure",
  "Kale",
];

const PAYMENT_METHODS = [
  { value: "cash", label: "Cash" },
  { value: "evc_plus", label: "EVC Plus" },
  { value: "zaad", label: "Zaad" },
  { value: "bank_transfer", label: "Bank Transfer" },
];

export default function EquipmentMaintenance({ expenses, onRefresh }) {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const emptyForm = { equipment_name: "", title: "", amount: "", expense_date: new Date().toISOString().slice(0, 10), payment_method: "cash" };
  const [form, setForm] = useState(emptyForm);

  const equipmentExpenses = expenses.filter((e) => e.category === "maintenance" || e.category === "equipment");
  const totalEquipmentCost = equipmentExpenses.reduce((s, e) => s + (e.amount || 0), 0);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setShowForm(true); };
  const openEdit = (exp) => {
    setEditing(exp);
    setForm({ equipment_name: exp.equipment_name || "", title: exp.title || "", amount: String(exp.amount || ""), expense_date: exp.expense_date || "", payment_method: exp.payment_method || "cash" });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.equipment_name || !form.amount || !form.expense_date) return;
    try {
      const payload = {
        equipment_name: form.equipment_name,
        title: form.title || `Dayactirka ${form.equipment_name}`,
        amount: Number(form.amount),
        expense_date: form.expense_date,
        category: editing?.category || "maintenance",
        payment_method: form.payment_method || "cash",
        vendor: editing?.vendor || "",
        notes: editing?.notes || "",
      };
      if (editing) {
        await base44.entities.Expense.update(editing.id, payload);
        toast({ title: "Waa la cusboonaysiiyay", description: "Dayactirka qalabka waa la bedelay" });
      } else {
        await base44.entities.Expense.create(payload);
        toast({ title: "Waa la diiwaangeliyay", description: "Dayactirka qalabka waa la xareeyay" });
      }
      setShowForm(false);
      onRefresh();
    } catch (err) {
      toast({ variant: "destructive", title: "Khalad", description: "Hawl lama soosaarin karo" });
    }
  };

  const handleDelete = async (id) => {
    try {
      await base44.entities.Expense.delete(id);
      toast({ title: "Waa la tirtiray", description: "Dayactirka waa la saaray" });
      onRefresh();
    } catch (err) {
      toast({ variant: "destructive", title: "Khalad", description: "Lama tirtiri karo" });
    }
  };

  return (
    <div className="rounded-2xl bg-zinc-900/50 border border-zinc-800/50 overflow-hidden">
      <div className="flex items-center justify-between p-5 border-b border-zinc-800/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 flex items-center justify-center">
            <Wrench className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold">Dayactirka Qalabka Solar-ka</h3>
            <p className="text-zinc-500 text-xs mt-0.5">Ku diiwaan geli kharashaadka dayactirka qalabka</p>
          </div>
        </div>
        <Button onClick={openCreate} size="sm" className="gap-2 bg-amber-500 hover:bg-amber-600 text-black">
          + Dar Dayactir
        </Button>
      </div>

      {/* Summary bar */}
      <div className="flex items-center gap-6 px-5 py-3 bg-zinc-800/20 border-b border-zinc-800/50">
        <div>
          <p className="text-zinc-500 text-xs">Wadarta Dayactirka</p>
          <p className="text-amber-400 font-bold text-lg">${totalEquipmentCost.toLocaleString()}</p>
        </div>
        <div className="w-px h-8 bg-zinc-800" />
        <div>
          <p className="text-zinc-500 text-xs">Tirada Dayactirka</p>
          <p className="text-white font-bold text-lg">{equipmentExpenses.length}</p>
        </div>
      </div>

      {/* Inline form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="p-5 bg-zinc-800/30 border-b border-zinc-800/50 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-white text-sm font-medium">{editing ? "Wax Ka Beddel Dayactirka" : "Dayactir Cusub"}</p>
            <Button type="button" variant="ghost" size="icon" onClick={() => setShowForm(false)} className="h-7 w-7 text-zinc-400">
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="space-y-1.5">
              <Label className="text-zinc-400 text-xs">Magaca Qalabka</Label>
              <Input required list="equipment-types" value={form.equipment_name} onChange={(e) => setForm({ ...form, equipment_name: e.target.value })} className="bg-zinc-900 border-zinc-700 text-white text-sm" placeholder="T.c. Inverter 5KW" />
              <datalist id="equipment-types">
                {EQUIPMENT_TYPES.map((t) => <option key={t} value={t} />)}
              </datalist>
            </div>
            <div className="space-y-1.5">
              <Label className="text-zinc-400 text-xs">Faahfaahin (optional)</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="bg-zinc-900 border-zinc-700 text-white text-sm" placeholder="T.c. Beddelay capacitor" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-zinc-400 text-xs">Qiimaha ($)</Label>
              <Input required type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="bg-zinc-900 border-zinc-700 text-white text-sm" placeholder="0.00" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-zinc-400 text-xs">Taariikhda</Label>
              <Input required type="date" value={form.expense_date} onChange={(e) => setForm({ ...form, expense_date: e.target.value })} className="bg-zinc-900 border-zinc-700 text-white text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-zinc-400 text-xs">Habka Bixinta</Label>
              <Select value={form.payment_method} onValueChange={(v) => setForm({ ...form, payment_method: v })}>
                <SelectTrigger className="bg-zinc-900 border-zinc-700 text-white text-sm"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800">
                  {PAYMENT_METHODS.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setShowForm(false)} className="border-zinc-700 text-zinc-300">Jooji</Button>
            <Button type="submit" size="sm" className="bg-amber-500 hover:bg-amber-600 text-black">{editing ? "Kaydi" : "Ku Dar"}</Button>
          </div>
        </form>
      )}

      {/* Equipment table */}
      {equipmentExpenses.length === 0 ? (
        <div className="p-10 text-center text-zinc-500">
          <Wrench className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm">Dayactir qalab lama helin. Ku dar mid cusub.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400 text-xs uppercase tracking-wider">
                <th className="text-left p-4 font-medium">Magaca Qalabka</th>
                <th className="text-left p-4 font-medium hidden sm:table-cell">Faahfaahin</th>
                <th className="text-right p-4 font-medium">Qiimaha</th>
                <th className="text-left p-4 font-medium hidden sm:table-cell">Bixinta</th>
                <th className="text-left p-4 font-medium">Taariikhda</th>
                <th className="text-right p-4 font-medium">Tallaabo</th>
              </tr>
            </thead>
            <tbody>
              {equipmentExpenses.map((exp) => (
                <tr key={exp.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                  <td className="p-4 text-white font-medium">
                    <div className="flex items-center gap-2">
                      <Wrench className="w-3.5 h-3.5 text-amber-400/60" />
                      {exp.equipment_name || exp.title}
                    </div>
                  </td>
                  <td className="p-4 text-zinc-400 hidden sm:table-cell">{exp.title || "—"}</td>
                  <td className="p-4 text-right text-amber-400 font-semibold">${(exp.amount || 0).toLocaleString()}</td>
                  <td className="p-4 text-zinc-400 hidden sm:table-cell">{PAYMENT_METHODS.find((p) => p.value === exp.payment_method)?.label || "—"}</td>
                  <td className="p-4 text-zinc-300">{exp.expense_date}</td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(exp)} className="h-8 w-8 text-zinc-400 hover:text-blue-400">
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(exp.id)} className="h-8 w-8 text-zinc-400 hover:text-red-400">
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
  );
}