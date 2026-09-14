import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Phone, Mail, MapPin, Zap, Calendar, Wifi, WifiOff } from "lucide-react";
import { useT } from "@/lib/i18n";

export default function CustomerDetail({ customer, onBack }) {
  const { t } = useT();
  const [billings, setBillings] = useState([]);

  useEffect(() => {
    base44.entities.Billing.filter({ customer: customer.id }).then(setBillings);
  }, [customer.id]);

  const totalPaid = billings.filter((b) => b.status === "paid").reduce((s, b) => s + (b.total_amount || 0), 0);
  const totalPending = billings.filter((b) => b.status === "pending").reduce((s, b) => s + (b.total_amount || 0), 0);

  const statusColor = {
    active: "bg-emerald-500/20 text-emerald-400",
    inactive: "bg-zinc-500/20 text-zinc-400",
    suspended: "bg-red-500/20 text-red-400",
  };
  const statusLabel = { active: t("status.active"), inactive: t("status.inactive"), suspended: t("status.suspended") };
  const billStatusColor = {
    paid: "text-emerald-400",
    pending: "text-amber-400",
    overdue: "text-red-400",
    cancelled: "text-zinc-400",
  };
  const billStatusLabel = { paid: t("status.paid"), pending: t("status.pending"), overdue: t("status.overdue"), cancelled: t("status.suspended") };

  return (
    <div className="space-y-6">
      <button onClick={onBack} className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm">
        <ArrowLeft className="w-4 h-4" /> {t("customers.title")}
      </button>

      <div className="rounded-2xl bg-zinc-900/50 border border-zinc-800/50 p-6">
        <div className="flex flex-col sm:flex-row items-start gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-2xl shrink-0">
            {customer.full_name?.charAt(0)}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-xl font-bold text-white">{customer.full_name}</h2>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor[customer.status]}`}>
                {statusLabel[customer.status]}
              </span>
              {customer.meter_status === "online" ? (
                <span className="flex items-center gap-1 text-emerald-400 text-xs"><Wifi className="w-3 h-3" /> {t("status.online")}</span>
              ) : (
                <span className="flex items-center gap-1 text-red-400 text-xs"><WifiOff className="w-3 h-3" /> {t("status.offline")}</span>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
              {customer.phone && <div className="flex items-center gap-2 text-zinc-400 text-sm"><Phone className="w-4 h-4" />{customer.phone}</div>}
              {customer.email && <div className="flex items-center gap-2 text-zinc-400 text-sm"><Mail className="w-4 h-4" />{customer.email}</div>}
              {customer.city && <div className="flex items-center gap-2 text-zinc-400 text-sm"><MapPin className="w-4 h-4" />{customer.city}{customer.address ? `, ${customer.address}` : ""}</div>}
              {customer.meter_number && <div className="flex items-center gap-2 text-zinc-400 text-sm"><Zap className="w-4 h-4" />{t("form.meter_number")}: {customer.meter_number}</div>}
              {customer.solar_capacity_kw && <div className="flex items-center gap-2 text-zinc-400 text-sm"><Zap className="w-4 h-4" />{customer.solar_capacity_kw} KW</div>}
              {customer.installation_date && <div className="flex items-center gap-2 text-zinc-400 text-sm"><Calendar className="w-4 h-4" />{customer.installation_date}</div>}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-5">
          <p className="text-zinc-400 text-xs uppercase tracking-wider">{t("status.paid")}</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">${totalPaid.toLocaleString()}</p>
        </div>
        <div className="rounded-2xl bg-amber-500/10 border border-amber-500/20 p-5">
          <p className="text-zinc-400 text-xs uppercase tracking-wider">{t("status.pending")}</p>
          <p className="text-2xl font-bold text-amber-400 mt-1">${totalPending.toLocaleString()}</p>
        </div>
        <div className="rounded-2xl bg-blue-500/10 border border-blue-500/20 p-5">
          <p className="text-zinc-400 text-xs uppercase tracking-wider">{t("statgrid.billingRecords.title")}</p>
          <p className="text-2xl font-bold text-blue-400 mt-1">{billings.length}</p>
        </div>
      </div>

      <div className="rounded-2xl bg-zinc-900/50 border border-zinc-800/50">
        <div className="p-5 border-b border-zinc-800/50">
          <h3 className="text-white font-semibold">Taariikhda Billing</h3>
        </div>
        {billings.length === 0 ? (
          <div className="p-10 text-center text-zinc-500 text-sm">—</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800/30">
                  <th className="text-left p-4 text-xs text-zinc-400 uppercase">Bisha</th>
                  <th className="text-left p-4 text-xs text-zinc-400 uppercase">KWh</th>
                  <th className="text-left p-4 text-xs text-zinc-400 uppercase">Lacagta</th>
                  <th className="text-left p-4 text-xs text-zinc-400 uppercase">Xaalada</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/30">
                {billings.map((b) => (
                  <tr key={b.id} className="hover:bg-zinc-800/20">
                    <td className="p-4 text-zinc-300 text-sm">{b.billing_month}</td>
                    <td className="p-4 text-zinc-300 text-sm">{b.kwh_used}</td>
                    <td className="p-4 text-white text-sm font-medium">${b.total_amount?.toLocaleString()}</td>
                    <td className={`p-4 text-sm font-medium ${billStatusColor[b.status]}`}>{billStatusLabel[b.status] || b.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}