import React from "react";
import { Users, Zap, DollarSign, Bell, Wallet, UserX, FileText, Wifi } from "lucide-react";
import { useT } from "@/lib/i18n";

export default function StatGrid({
  customersCount,
  totalKW,
  collectedAmount,
  pendingAmount,
  unreadNotifications,
  totalBalance,
  suspendedCount,
  billingCount,
  pendingBillsCount,
  onlineMeters,
}) {
  const { t } = useT();

  const cards = [
    { titleKey: "statgrid.customers.title", subKey: "statgrid.customers.sub", subParams: { count: customersCount }, value: customersCount, icon: Users, accent: "orange" },
    { titleKey: "statgrid.currentPower.title", subKey: "statgrid.currentPower.sub", value: `${totalKW.toFixed(1)} KW`, icon: Zap, accent: "green" },
    { titleKey: "statgrid.paidAmount.title", subKey: "statgrid.paidAmount.sub", subParams: { amount: pendingAmount.toFixed(2) }, value: `$${collectedAmount.toFixed(2)}`, icon: DollarSign, accent: "blue" },
    { titleKey: "statgrid.newNotifications.title", subKey: "statgrid.newNotifications.sub", value: unreadNotifications, icon: Bell, accent: "purple" },
    { titleKey: "statgrid.totalBalance.title", subKey: "statgrid.totalBalance.sub", value: `$${totalBalance.toFixed(2)}`, icon: Wallet, accent: "red" },
    { titleKey: "statgrid.suspended.title", subKey: "statgrid.suspended.sub", value: suspendedCount, icon: UserX, accent: "yellow" },
    { titleKey: "statgrid.billingRecords.title", subKey: "statgrid.billingRecords.sub", subParams: { count: pendingBillsCount }, value: billingCount, icon: FileText, accent: "indigo" },
    { titleKey: "statgrid.onlineMeters.title", subKey: "statgrid.onlineMeters.sub", value: onlineMeters, icon: Wifi, accent: "teal" },
  ];

  const styles = {
    orange: { bg: "bg-orange-500/10", border: "border-orange-500/20", text: "text-orange-400", iconBg: "bg-orange-500/15" },
    green: { bg: "bg-emerald-500/10", border: "border-emerald-500/20", text: "text-emerald-400", iconBg: "bg-emerald-500/15" },
    blue: { bg: "bg-blue-500/10", border: "border-blue-500/20", text: "text-blue-400", iconBg: "bg-blue-500/15" },
    purple: { bg: "bg-purple-500/10", border: "border-purple-500/20", text: "text-purple-400", iconBg: "bg-purple-500/15" },
    red: { bg: "bg-rose-500/10", border: "border-rose-500/20", text: "text-rose-400", iconBg: "bg-rose-500/15" },
    yellow: { bg: "bg-amber-500/10", border: "border-amber-500/20", text: "text-amber-400", iconBg: "bg-amber-500/15" },
    indigo: { bg: "bg-indigo-500/10", border: "border-indigo-500/20", text: "text-indigo-400", iconBg: "bg-indigo-500/15" },
    teal: { bg: "bg-teal-500/10", border: "border-teal-500/20", text: "text-teal-400", iconBg: "bg-teal-500/15" },
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((card) => {
        const s = styles[card.accent];
        const Icon = card.icon;
        return (
          <div key={card.titleKey} className={`group rounded-xl ${s.bg} border ${s.border} p-4 transition-all hover:shadow-lg hover:-translate-y-0.5 duration-200`}>
            <div className="flex items-start justify-between">
              <div className="min-w-0">
                <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">{t(card.titleKey)}</p>
                <p className={`text-2xl font-bold mt-2 ${s.text}`}>{card.value}</p>
                <p className="text-muted-foreground text-xs mt-0.5 truncate">{t(card.subKey, card.subParams)}</p>
              </div>
              <div className={`p-2 rounded-lg ${s.iconBg} transition-transform group-hover:scale-110`}>
                <Icon className={`w-4 h-4 ${s.text}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}