import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, Calendar, FileText, Sun, Users, Wrench } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useT } from "@/lib/i18n";

const Spinner = () => (
  <div className="flex items-center justify-center h-64">
    <div className="w-8 h-8 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
  </div>
);

function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <div className="rounded-xl bg-card border border-border p-4">
      <div className="flex items-center gap-2">
        <Icon className={`w-4 h-4 ${accent}`} />
        <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">{label}</p>
      </div>
      <p className="text-2xl font-bold mt-2 text-foreground">{value}</p>
    </div>
  );
}

export default function AdminDashboard() {
  const { t } = useT();
  const [data, setData] = useState({ customers: [], bills: [], maintenance: [], solar: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.Customer.list().catch(() => []),
      base44.entities.Billing.list().catch(() => []),
      base44.entities.MaintenanceRequest.list().catch(() => []),
      base44.entities.SolarData.list().catch(() => []),
    ]).then(([customers, bills, maintenance, solar]) => {
      setData({ customers, bills, maintenance, solar });
      setLoading(false);
    });
  }, []);

  if (loading) return <Spinner />;

  const openMaintenance = data.maintenance.filter((item) => item.status !== "completed").length;
  const overdueBills = data.bills.filter((item) => item.status === "overdue").length;
  const activeCustomers = data.customers.filter((item) => item.status !== "inactive").length;
  const latestSolar = data.solar[data.solar.length - 1];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">{t("nav.dashboard")}</h1>
          <p className="text-muted-foreground mt-0.5 text-sm">{t("home.subtitle")}</p>
        </div>
        <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-card border border-border text-sm text-muted-foreground">
          <Calendar className="w-4 h-4 text-orange-400" />
          {new Date().toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" })}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={Users} label={t("home.cards.activeCustomers")} value={activeCustomers} accent="text-blue-400" />
        <StatCard icon={FileText} label={t("home.cards.overdue")} value={overdueBills} accent="text-red-400" />
        <StatCard icon={Wrench} label={t("home.cards.openRequests")} value={openMaintenance} accent="text-amber-400" />
        <StatCard icon={Sun} label={t("home.status.todayProduction")} value={latestSolar?.energy_produced ?? 0} accent="text-emerald-400" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Link to="/macaamiisha" className="rounded-xl bg-card border border-border p-4 hover:border-orange-400/50 transition-colors">
          <Users className="w-5 h-5 text-blue-400 mb-3" />
          <p className="font-semibold text-foreground">{t("nav.customers")}</p>
          <p className="text-sm text-muted-foreground mt-1">{t("home.cards.activeCustomers")}</p>
        </Link>
        <Link to="/billing" className="rounded-xl bg-card border border-border p-4 hover:border-orange-400/50 transition-colors">
          <FileText className="w-5 h-5 text-amber-400 mb-3" />
          <p className="font-semibold text-foreground">{t("nav.billing")}</p>
          <p className="text-sm text-muted-foreground mt-1">{t("home.cards.billing.sub")}</p>
        </Link>
        <Link to="/dayactir" className="rounded-xl bg-card border border-border p-4 hover:border-orange-400/50 transition-colors">
          <AlertTriangle className="w-5 h-5 text-red-400 mb-3" />
          <p className="font-semibold text-foreground">{t("nav.maintenance")}</p>
          <p className="text-sm text-muted-foreground mt-1">{t("home.cards.openRequests")}</p>
        </Link>
      </div>
    </div>
  );
}
