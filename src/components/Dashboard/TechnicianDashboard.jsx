import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { useT } from "@/lib/i18n";
import {
  Calendar, Package, Siren, ClipboardList, Wrench, ArrowRight
} from "lucide-react";

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

function QuickLink({ to, icon: Icon, label }) {
  return (
    <Link to={to} className="rounded-xl bg-card border border-border p-4 hover:border-orange-400/50 transition-colors flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-orange-400" />
        <span className="text-sm font-medium text-foreground">{label}</span>
      </div>
      <ArrowRight className="w-4 h-4 text-muted-foreground" />
    </Link>
  );
}

// Dashboard for Technicians — equipment, alarms, maintenance, tasks only.
export default function TechnicianDashboard() {
  const { t } = useT();
  const [equipment, setEquipment] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [alarms, setAlarms] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.Equipment.list().catch(() => []),
      base44.entities.Task.list().catch(() => []),
      base44.entities.Alarm.list().catch(() => []),
      base44.entities.MaintenanceRequest.list().catch(() => []),
    ]).then(([eq, tk, al, mt]) => {
      setEquipment(eq);
      setTasks(tk);
      setAlarms(al);
      setMaintenance(mt);
      setLoading(false);
    });
  }, []);

  if (loading) return <Spinner />;

  const online = equipment.filter((e) => e.status === "online").length;
  const warning = equipment.filter((e) => e.status === "warning").length;
  const offline = equipment.filter((e) => e.status === "offline").length;
  const openTasks = tasks.filter((t) => t.status !== "completed");
  const openAlarms = alarms.filter((a) => !a.acknowledged);
  const openMaintenance = maintenance.filter((m) => m.status !== "resolved");

  const myTasks = [...openTasks]
    .sort((a, b) => new Date(b.created_date || 0) - new Date(a.created_date || 0))
    .slice(0, 6);

  const recentAlarms = [...alarms]
    .sort((a, b) => new Date(b.created_date || 0) - new Date(a.created_date || 0))
    .slice(0, 5);

  const statusColor = (s) =>
    s === "online" ? "text-emerald-400" : s === "warning" ? "text-amber-400" : "text-red-400";

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">{t("rbac.technician.title")}</h1>
          <p className="text-muted-foreground mt-0.5 text-sm">{t("rbac.technician.subtitle")}</p>
        </div>
        <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-card border border-border text-sm text-muted-foreground">
          <Calendar className="w-4 h-4 text-orange-400" />
          {new Date().toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <StatCard icon={Package} label={t("rbac.technician.equipmentOnline")} value={online} accent="text-emerald-400" />
        <StatCard icon={Package} label={t("rbac.technician.equipmentWarning")} value={warning} accent="text-amber-400" />
        <StatCard icon={Package} label={t("rbac.technician.equipmentOffline")} value={offline} accent="text-red-400" />
        <StatCard icon={ClipboardList} label={t("rbac.technician.openTasks")} value={openTasks.length} accent="text-blue-400" />
        <StatCard icon={Siren} label={t("rbac.technician.openAlarms")} value={openAlarms.length} accent="text-red-400" />
        <StatCard icon={Wrench} label={t("rbac.technician.openMaintenance")} value={openMaintenance.length} accent="text-amber-400" />
      </div>

      <div className="rounded-xl bg-card border border-border p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-foreground font-semibold text-sm flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-blue-400" />
            {t("rbac.technician.myTasks")}
          </h3>
          <Link to="/hawlaha" className="inline-flex items-center gap-1 text-xs font-semibold text-orange-400 hover:text-orange-500">
            {t("rbac.viewAll")} <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="space-y-2">
          {myTasks.length === 0 && (
            <p className="text-muted-foreground text-sm py-4 text-center">{t("task.empty")}</p>
          )}
          {myTasks.map((t) => (
            <div key={t.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <div>
                <p className="text-sm font-medium text-foreground">{t.title}</p>
                <p className="text-xs text-muted-foreground">{t.location || "-"}</p>
              </div>
              <span className="text-xs font-semibold text-muted-foreground">{t(`task.status.${t.status}`)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl bg-card border border-border p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-foreground font-semibold text-sm flex items-center gap-2">
            <Siren className="w-4 h-4 text-red-400" />
            {t("rbac.technician.recentAlarms")}
          </h3>
          <Link to="/ciladaha" className="inline-flex items-center gap-1 text-xs font-semibold text-orange-400 hover:text-orange-500">
            {t("rbac.viewAll")} <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="space-y-2">
          {recentAlarms.length === 0 && (
            <p className="text-muted-foreground text-sm py-4 text-center">{t("alarms")}</p>
          )}
          {recentAlarms.map((a) => (
            <div key={a.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <div>
                <p className="text-sm font-medium text-foreground">{a.name}</p>
                <p className="text-xs text-muted-foreground">{a.location || "-"}</p>
              </div>
              <span className={`text-xs font-semibold ${statusColor(a.severity === "critical" ? "offline" : a.severity === "warning" ? "warning" : "online")}`}>
                {a.severity}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <QuickLink to="/qalabka" icon={Package} label={t("nav.equipment")} />
        <QuickLink to="/hawlaha" icon={ClipboardList} label={t("nav.tasks")} />
        <QuickLink to="/ciladaha" icon={Siren} label={t("nav.alarms")} />
        <QuickLink to="/dayactir" icon={Wrench} label={t("nav.maintenance")} />
      </div>
    </div>
  );
}