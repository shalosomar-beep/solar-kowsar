import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Search, Edit2, Trash2, Eye, UserX, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useT } from "@/lib/i18n";
import CustomerForm from "@/components/customers/CustomerForm";
import CustomerDetail from "@/components/customers/CustomerDetail";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [viewingCustomer, setViewingCustomer] = useState(null);
  const { toast } = useToast();
  const { t } = useT();

  const load = () => {
    setLoading(true);
    base44.entities.Customer.list("-created_date").then(setCustomers).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!confirm(t("common.confirmDelete"))) return;
    await base44.entities.Customer.delete(id);
    toast({ title: t("customers.toast.deleted.title"), description: t("customers.toast.deleted.desc") });
    load();
  };

  const filtered = customers.filter((c) =>
    c.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search) ||
    c.meter_number?.includes(search)
  );

  const statusColor = {
    active: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    inactive: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
    suspended: "bg-red-500/20 text-red-400 border-red-500/30",
  };

  const statusLabel = { active: t("status.active"), inactive: t("status.inactive"), suspended: t("status.suspended") };

  if (viewingCustomer) {
    return <CustomerDetail customer={viewingCustomer} onBack={() => { setViewingCustomer(null); load(); }} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">{t("customers.title")}</h1>
          <p className="text-zinc-400 text-sm mt-1">{t("customers.subtitle")}</p>
        </div>
        <Button onClick={() => { setEditingCustomer(null); setShowForm(true); }} className="bg-amber-500 hover:bg-amber-600 text-black font-semibold">
          <Plus className="w-4 h-4 mr-2" /> {t("customers.add")}
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <Input
          placeholder={t("customers.searchPlaceholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600"
        />
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-zinc-800">
              <h2 className="text-white font-semibold">{editingCustomer ? t("common.edit") : t("customers.new")}</h2>
              <button onClick={() => setShowForm(false)} className="text-zinc-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <CustomerForm
              customer={editingCustomer}
              onSaved={() => { setShowForm(false); load(); }}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-zinc-500">
          <UserX className="w-12 h-12 mx-auto mb-3 text-zinc-700" />
          <p className="text-lg font-medium">{t("customers.empty.title")}</p>
          <p className="text-sm mt-1">{t("customers.empty.sub")}</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-zinc-800/50">
          <table className="w-full">
            <thead>
              <tr className="bg-zinc-900/80 border-b border-zinc-800/50">
                <th className="text-left p-4 text-xs font-medium text-zinc-400 uppercase tracking-wider">{t("customers.col.name")}</th>
                <th className="text-left p-4 text-xs font-medium text-zinc-400 uppercase tracking-wider hidden md:table-cell">{t("customers.col.phone")}</th>
                <th className="text-left p-4 text-xs font-medium text-zinc-400 uppercase tracking-wider hidden lg:table-cell">{t("customers.col.meter")}</th>
                <th className="text-left p-4 text-xs font-medium text-zinc-400 uppercase tracking-wider hidden lg:table-cell">{t("customers.col.solar")}</th>
                <th className="text-left p-4 text-xs font-medium text-zinc-400 uppercase tracking-wider">{t("customers.col.status")}</th>
                <th className="text-right p-4 text-xs font-medium text-zinc-400 uppercase tracking-wider">{t("customers.col.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/30">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-zinc-900/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-sm">
                        {c.full_name?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">{c.full_name}</p>
                        <p className="text-zinc-500 text-xs md:hidden">{c.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-zinc-300 text-sm hidden md:table-cell">{c.phone}</td>
                  <td className="p-4 text-zinc-300 text-sm font-mono hidden lg:table-cell">{c.meter_number}</td>
                  <td className="p-4 text-zinc-300 text-sm hidden lg:table-cell">{c.solar_capacity_kw || "—"}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${statusColor[c.status] || statusColor.active}`}>
                      {statusLabel[c.status] || c.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => setViewingCustomer(c)} className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"><Eye className="w-4 h-4" /></button>
                      <button onClick={() => { setEditingCustomer(c); setShowForm(true); }} className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-amber-400 transition-colors"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(c.id)} className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
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