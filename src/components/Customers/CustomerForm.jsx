import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useT } from "@/lib/i18n";

export default function CustomerForm({ customer, onSaved, onCancel }) {
  const { t } = useT();
  const [form, setForm] = useState({
    full_name: customer?.full_name || "",
    phone: customer?.phone || "",
    email: customer?.email || "",
    address: customer?.address || "",
    city: customer?.city || "",
    meter_number: customer?.meter_number || "",
    solar_panel_type: customer?.solar_panel_type || "",
    solar_capacity_kw: customer?.solar_capacity_kw || "",
    monthly_rate: customer?.monthly_rate || "",
    status: customer?.status || "active",
    meter_status: customer?.meter_status || "online",
    notes: customer?.notes || "",
  });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const data = {
      ...form,
      solar_capacity_kw: form.solar_capacity_kw ? Number(form.solar_capacity_kw) : undefined,
      monthly_rate: form.monthly_rate ? Number(form.monthly_rate) : undefined,
    };
    if (customer) {
      await base44.entities.Customer.update(customer.id, data);
      toast({ title: t("customers.toast.updated.title"), description: t("customers.toast.updated.desc") });
    } else {
      await base44.entities.Customer.create(data);
      toast({ title: t("customers.toast.created.title"), description: t("customers.toast.created.desc") });
    }
    setSaving(false);
    onSaved();
  };

  const update = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  const inputCls = "mt-1 bg-zinc-800 border-zinc-700 text-white";

  return (
    <form onSubmit={handleSubmit} className="p-5 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label className="text-zinc-300 text-xs">{t("form.full_name")} *</Label>
          <Input required value={form.full_name} onChange={(e) => update("full_name", e.target.value)} className={inputCls} />
        </div>
        <div>
          <Label className="text-zinc-300 text-xs">{t("form.phone")} *</Label>
          <Input required value={form.phone} onChange={(e) => update("phone", e.target.value)} className={inputCls} />
        </div>
        <div>
          <Label className="text-zinc-300 text-xs">{t("form.email")}</Label>
          <Input value={form.email} onChange={(e) => update("email", e.target.value)} className={inputCls} />
        </div>
        <div>
          <Label className="text-zinc-300 text-xs">{t("form.city")}</Label>
          <Input value={form.city} onChange={(e) => update("city", e.target.value)} className={inputCls} />
        </div>
        <div className="sm:col-span-2">
          <Label className="text-zinc-300 text-xs">{t("form.address")}</Label>
          <Input value={form.address} onChange={(e) => update("address", e.target.value)} className={inputCls} />
        </div>
        <div>
          <Label className="text-zinc-300 text-xs">{t("form.meter_number")} *</Label>
          <Input required value={form.meter_number} onChange={(e) => update("meter_number", e.target.value)} className={inputCls} />
        </div>
        <div>
          <Label className="text-zinc-300 text-xs">{t("form.solar_panel_type")}</Label>
          <Input value={form.solar_panel_type} onChange={(e) => update("solar_panel_type", e.target.value)} className={inputCls} />
        </div>
        <div>
          <Label className="text-zinc-300 text-xs">{t("form.solar_capacity")}</Label>
          <Input type="number" step="0.1" value={form.solar_capacity_kw} onChange={(e) => update("solar_capacity_kw", e.target.value)} className={inputCls} />
        </div>
        <div>
          <Label className="text-zinc-300 text-xs">{t("form.monthly_rate")}</Label>
          <Input type="number" step="0.01" value={form.monthly_rate} onChange={(e) => update("monthly_rate", e.target.value)} className={inputCls} />
        </div>
        <div>
          <Label className="text-zinc-300 text-xs">{t("form.status")}</Label>
          <Select value={form.status} onValueChange={(v) => update("status", v)}>
            <SelectTrigger className={inputCls}><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="active">{t("status.active")}</SelectItem>
              <SelectItem value="inactive">{t("status.inactive")}</SelectItem>
              <SelectItem value="suspended">{t("status.suspended")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-zinc-300 text-xs">{t("form.meter_status")}</Label>
          <Select value={form.meter_status} onValueChange={(v) => update("meter_status", v)}>
            <SelectTrigger className={inputCls}><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="online">{t("status.online")}</SelectItem>
              <SelectItem value="offline">{t("status.offline")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label className="text-zinc-300 text-xs">{t("form.notes")}</Label>
        <textarea value={form.notes} onChange={(e) => update("notes", e.target.value)} rows={2} className="mt-1 w-full bg-zinc-800 border border-zinc-700 text-white rounded-md px-3 py-2 text-sm" />
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">{t("common.cancel")}</Button>
        <Button type="submit" disabled={saving} className="bg-amber-500 hover:bg-amber-600 text-black font-semibold">
          {saving ? t("common.saving") : customer ? t("form.submit.update") : t("form.submit.create")}
        </Button>
      </div>
    </form>
  );
}