import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Bell, BellOff, Check, X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useT } from "@/lib/i18n";

export default function Notifications() {
  const { t } = useT();
  const [notifications, setNotifications] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();

  const [form, setForm] = useState({ title: "", message: "", type: "general", customer: "" });

  const load = () => {
    setLoading(true);
    Promise.all([
      base44.entities.Notification.list("-created_date"),
      base44.entities.Customer.list(),
    ]).then(([n, c]) => {
      setNotifications(n);
      setCustomers(c);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { ...form };
    if (!data.customer) delete data.customer;
    await base44.entities.Notification.create(data);
    toast({ title: t("notifications.toast.sent"), description: t("notifications.toast.sent.desc") });
    setShowForm(false);
    setForm({ title: "", message: "", type: "general", customer: "" });
    load();
  };

  const markRead = async (n) => {
    await base44.entities.Notification.update(n.id, { is_read: true });
    load();
  };

  const handleDelete = async (id) => {
    await base44.entities.Notification.delete(id);
    load();
  };

  const getCustomerName = (id) => customers.find((c) => c.id === id)?.full_name || "";

  const typeColor = {
    billing: "bg-blue-500/20 text-blue-400 border-blue-500/20",
    maintenance: "bg-amber-500/20 text-amber-400 border-amber-500/20",
    warning: "bg-red-500/20 text-red-400 border-red-500/20",
    general: "bg-zinc-500/20 text-zinc-400 border-zinc-500/20",
  };
  const typeLabel = { billing: t("notifType.billing"), maintenance: t("notifType.maintenance"), warning: t("notifType.warning"), general: t("notifType.general") };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">{t("notifications.title")}</h1>
          <p className="text-zinc-400 text-sm mt-1">{t("notifications.unread", { count: unreadCount })}</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-amber-500 hover:bg-amber-600 text-black font-semibold">
          <Plus className="w-4 h-4 mr-2" /> {t("notifications.new")}
        </Button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-5 border-b border-zinc-800">
              <h2 className="text-white font-semibold">{t("notifications.new")}</h2>
              <button onClick={() => setShowForm(false)} className="text-zinc-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <Label className="text-zinc-300 text-xs">{t("notifications.form.title")} *</Label>
                <Input required value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} className="mt-1 bg-zinc-800 border-zinc-700 text-white" />
              </div>
              <div>
                <Label className="text-zinc-300 text-xs">{t("notifications.form.message")} *</Label>
                <textarea required value={form.message} onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))} rows={3} className="mt-1 w-full bg-zinc-800 border border-zinc-700 text-white rounded-md px-3 py-2 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-zinc-300 text-xs">{t("notifications.form.type")}</Label>
                  <Select value={form.type} onValueChange={(v) => setForm((p) => ({ ...p, type: v }))}>
                    <SelectTrigger className="mt-1 bg-zinc-800 border-zinc-700 text-white"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">{t("notifType.general")}</SelectItem>
                      <SelectItem value="billing">{t("notifType.billing")}</SelectItem>
                      <SelectItem value="maintenance">{t("notifType.maintenance")}</SelectItem>
                      <SelectItem value="warning">{t("notifType.warning")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-zinc-300 text-xs">{t("notifications.form.customerOptional")}</Label>
                  <Select value={form.customer} onValueChange={(v) => setForm((p) => ({ ...p, customer: v }))}>
                    <SelectTrigger className="mt-1 bg-zinc-800 border-zinc-700 text-white"><SelectValue placeholder={t("billing.filter.all")} /></SelectTrigger>
                    <SelectContent>
                      {customers.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.full_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">{t("common.cancel")}</Button>
                <Button type="submit" className="bg-amber-500 hover:bg-amber-600 text-black font-semibold">{t("notifications.send")}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-20 text-zinc-500">
          <BellOff className="w-12 h-12 mx-auto mb-3 text-zinc-700" />
          <p className="text-lg font-medium">{t("notifications.empty")}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`rounded-2xl border p-5 transition-all ${
                n.is_read
                  ? "bg-zinc-900/30 border-zinc-800/30"
                  : "bg-zinc-900/70 border-zinc-700/50"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-2.5 rounded-xl shrink-0 ${n.is_read ? "bg-zinc-800" : "bg-amber-500/20"}`}>
                  <Bell className={`w-4 h-4 ${n.is_read ? "text-zinc-500" : "text-amber-400"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className={`font-semibold text-sm ${n.is_read ? "text-zinc-400" : "text-white"}`}>{n.title}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${typeColor[n.type]}`}>
                      {typeLabel[n.type] || n.type}
                    </span>
                    {!n.is_read && <span className="w-2 h-2 rounded-full bg-amber-400" />}
                  </div>
                  <p className="text-zinc-400 text-sm mt-1">{n.message}</p>
                  {n.customer && (
                    <p className="text-zinc-500 text-xs mt-2">{t("notifications.customer")}: {getCustomerName(n.customer)}</p>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {!n.is_read && (
                    <button onClick={() => markRead(n)} className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-emerald-400 transition-colors">
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  <button onClick={() => handleDelete(n.id)} className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-red-400 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}