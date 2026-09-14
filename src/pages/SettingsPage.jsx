import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Save, Building2, DollarSign, Phone, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

export default function Settings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const [form, setForm] = useState({
    company_name: "",
    company_phone: "",
    company_email: "",
    currency: "USD",
    rate_per_kwh: "0.15",
    billing_cycle: "monthly",
    late_fee: "5",
    grace_period_days: "7",
    min_balance_alert: "10",
    evc_plus_number: "",
    zaad_number: "",
  });

  useEffect(() => {
    base44.entities.Settings.list().then((s) => {
      if (s.length > 0) {
        setSettings(s[0]);
        setForm({
          company_name: s[0].company_name || "",
          company_phone: s[0].company_phone || "",
          company_email: s[0].company_email || "",
          currency: s[0].currency || "USD",
          rate_per_kwh: String(s[0].rate_per_kwh ?? "0.15"),
          billing_cycle: s[0].billing_cycle || "monthly",
          late_fee: String(s[0].late_fee ?? "5"),
          grace_period_days: String(s[0].grace_period_days ?? "7"),
          min_balance_alert: String(s[0].min_balance_alert ?? "10"),
          evc_plus_number: s[0].evc_plus_number || "",
          zaad_number: s[0].zaad_number || "",
        });
      }
    }).finally(() => setLoading(false));
  }, []);

  const update = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const data = {
      ...form,
      rate_per_kwh: Number(form.rate_per_kwh),
      late_fee: Number(form.late_fee),
      grace_period_days: Number(form.grace_period_days),
      min_balance_alert: Number(form.min_balance_alert),
    };
    if (settings) {
      await base44.entities.Settings.update(settings.id, data);
    } else {
      await base44.entities.Settings.create(data);
    }
    toast({ title: "Waa la keydiyay", description: "Boggooyinka waa la cusbooneysiiyay." });
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  const currencySymbol = form.currency === "SOS" ? "SOS" : "$";

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Boggooyinka Nidaamka</h1>
        <p className="text-zinc-400 text-sm mt-1">Qiimaha, lacagta, iyo habka billing-ka</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Company Info */}
        <div className="rounded-2xl bg-zinc-900/50 border border-zinc-800/50 p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="p-2 rounded-lg bg-amber-500/20">
              <Building2 className="w-4 h-4 text-amber-400" />
            </div>
            <h2 className="text-white font-semibold">Macluumaadka Shirkadda</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-zinc-300 text-xs">Magaca Shirkadda *</Label>
              <Input required value={form.company_name} onChange={(e) => update("company_name", e.target.value)} className="mt-1 bg-zinc-800 border-zinc-700 text-white" />
            </div>
            <div>
              <Label className="text-zinc-300 text-xs">Telefoonka</Label>
              <Input value={form.company_phone} onChange={(e) => update("company_phone", e.target.value)} className="mt-1 bg-zinc-800 border-zinc-700 text-white" />
            </div>
            <div className="sm:col-span-2">
              <Label className="text-zinc-300 text-xs">Email</Label>
              <Input value={form.company_email} onChange={(e) => update("company_email", e.target.value)} className="mt-1 bg-zinc-800 border-zinc-700 text-white" />
            </div>
          </div>
        </div>

        {/* Billing & Tariff */}
        <div className="rounded-2xl bg-zinc-900/50 border border-zinc-800/50 p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="p-2 rounded-lg bg-emerald-500/20">
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <h2 className="text-white font-semibold">Qiimaha & Billing</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-zinc-300 text-xs">Lacagta</Label>
              <Select value={form.currency} onValueChange={(v) => update("currency", v)}>
                <SelectTrigger className="mt-1 bg-zinc-800 border-zinc-700 text-white"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="SOS">Soomaali Shiling (SOS)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-zinc-300 text-xs">Qiimaha KWh ({currencySymbol})</Label>
              <Input type="number" step="0.01" value={form.rate_per_kwh} onChange={(e) => update("rate_per_kwh", e.target.value)} className="mt-1 bg-zinc-800 border-zinc-700 text-white" />
            </div>
            <div>
              <Label className="text-zinc-300 text-xs">Habka Billing</Label>
              <Select value={form.billing_cycle} onValueChange={(v) => update("billing_cycle", v)}>
                <SelectTrigger className="mt-1 bg-zinc-800 border-zinc-700 text-white"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Bishiiba</SelectItem>
                  <SelectItem value="bi_monthly">Laba Bishiba</SelectItem>
                  <SelectItem value="weekly">Toddobaadkiiba</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-zinc-300 text-xs">Cadaadis Lacag Dhaafis ({currencySymbol})</Label>
              <Input type="number" step="0.01" value={form.late_fee} onChange={(e) => update("late_fee", e.target.value)} className="mt-1 bg-zinc-800 border-zinc-700 text-white" />
            </div>
            <div>
              <Label className="text-zinc-300 text-xs">Maalmaha Dhaafinta</Label>
              <Input type="number" value={form.grace_period_days} onChange={(e) => update("grace_period_days", e.target.value)} className="mt-1 bg-zinc-800 border-zinc-700 text-white" />
            </div>
            <div>
              <Label className="text-zinc-300 text-xs">Haraaga Ugu Hooseeya ({currencySymbol})</Label>
              <Input type="number" step="0.01" value={form.min_balance_alert} onChange={(e) => update("min_balance_alert", e.target.value)} className="mt-1 bg-zinc-800 border-zinc-700 text-white" />
            </div>
          </div>
        </div>

        {/* Mobile Money */}
        <div className="rounded-2xl bg-zinc-900/50 border border-zinc-800/50 p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <Phone className="w-4 h-4 text-blue-400" />
            </div>
            <h2 className="text-white font-semibold">Lacagta Mobile-ka (Mobile Money)</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-zinc-300 text-xs">Lambarka EVC Plus</Label>
              <Input value={form.evc_plus_number} onChange={(e) => update("evc_plus_number", e.target.value)} placeholder="0615XXXXXX" className="mt-1 bg-zinc-800 border-zinc-700 text-white" />
            </div>
            <div>
              <Label className="text-zinc-300 text-xs">Lambarka Zaad</Label>
              <Input value={form.zaad_number} onChange={(e) => update("zaad_number", e.target.value)} placeholder="0634XXXXXX" className="mt-1 bg-zinc-800 border-zinc-700 text-white" />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={saving} className="bg-amber-500 hover:bg-amber-600 text-black font-semibold px-8">
            {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Kaydinaya...</> : <><Save className="w-4 h-4 mr-2" /> Keydi Boggooyinka</>}
          </Button>
        </div>
      </form>
    </div>
  );
}