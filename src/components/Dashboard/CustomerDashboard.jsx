import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { useT } from "@/lib/i18n";
import { useAuth } from "@/lib/AuthContext";
import {
  Calendar, DollarSign, FileText, BarChart3, Bell, ArrowRight, Sun
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

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

// Dashboard for Customers — only their own account, bills, usage, payments,
// solar info and notifications (matched by email).
export default function CustomerDashboard() {
  const { t } = useT();
  const { user } = useAuth();
  const [customer, setCustomer] = useState(null);
  const [billings, setBillings] = useState([]);
  const [usages, setUsages] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const customers = await base44.entities.Customer.filter({ email: user?.email }).catch(() => []);
        const me = customers && customers[0] ? customers[0] : null;
        setCustomer(me);
        if (me) {
          const [bills, usage, notifs] = await Promise.all([
            base44.entities.Billing.filter({ customer: me.id }).catch(() => []),
            base44.entities.DailyUsage.filter({ customer: me.id }).catch(() => []),
            base44.entities.Notification.filter({ customer: me.id }).catch(() => []),
          ]);
          setBillings(bills);
          setUsages(usage);
          setNotifications(notifs);
        }
      } catch {
        // fall through to not-found state
      }
      setLoading(false);
    })();
  }, [user?.email]);

  if (loading) return <Spinner />;

  if (!customer) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground text-sm">{t("rbac.customer.notFound")}</p>
      </div>
    );
  }

  const pendingBills = billings.filter((b) => b.status === "pending" || b.status === "overdue");
  const balance = pendingBills.reduce((s, b) => s + (b.total_amount || 0), 0);

  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const usageMonth = usages
    .filter((u) => u.usage_date?.startsWith(monthKey))
    .reduce((s, u) => s + (u.kwh_used || 0), 0);
  const unreadNotifications = notifications.filter((n) => !n.is_read).length;

  const usageData = [...usages]
    .sort((a, b) => new Date(a.usage_date) - new Date(b.usage_date))
    .slice(-14)
    .map((u) => ({
      name: u.usage_date ? new Date(u.usage_date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "",
      kwh: Number(u.kwh_used) || 0,
    }));

  const recentBills = [...billings]
    .sort((a, b) => new Date(b.created_date || 0) - new Date(a.created_date || 0))
    .slice(0, 5);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">
            {t("rbac.customer.welcome")}, {customer.full_name?.split(" ")[0] || ""}
          </h1>
          <p className="text-muted-foreground mt-0.5 text-sm">{t("rbac.customer.subtitle")}</p>
        </div>
        <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-card border border-border text-sm text-muted-foreground">
          <Calendar className="w-4 h-4 text-orange-400" />
          {new Date().toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={DollarSign} label={t("rbac.customer.myBalance")} value={`$${balance.toFixed(2)}`} accent="text-red-400" />
        <StatCard icon={FileText} label={t("rbac.customer.pendingBills")} value={pendingBills.length} accent="text-amber-400" />
        <StatCard icon={BarChart3} label={t("rbac.customer.usageMonth")} value={`${usageMonth.toFixed(1)} kWh`} accent="text-cyan-400" />
        <StatCard icon={Bell} label={t("rbac.customer.myNotifications")} value={unreadNotifications} accent="text-blue-400" />
      </div>

      <div className="rounded-xl bg-card border border-border p-4">
        <h3 className="text-foreground font-semibold text-sm mb-3 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-cyan-400" />
          {t("rbac.customer.myUsage")}
        </h3>
        <div className="h-48">
          {usageData.length === 0 ? (
            <p className="text-muted-foreground text-sm py-8 text-center">{t("usageReports.empty")}</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={usageData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} angle={-30} textAnchor="end" height={60} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "12px" }} />
                <Line type="monotone" dataKey="kwh" stroke="#06b6d4" strokeWidth={2.5} dot={{ fill: "#06b6d4", r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="rounded-xl bg-card border border-border p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-foreground font-semibold text-sm">{t("rbac.customer.myBills")}</h3>
          <Link to="/billing" className="inline-flex items-center gap-1 text-xs font-semibold text-orange-400 hover:text-orange-500">
            {t("rbac.viewAll")} <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="space-y-2">
          {recentBills.length === 0 && (
            <p className="text-muted-foreground text-sm py-4 text-center">{t("billing.empty")}</p>
          )}
          {recentBills.map((b) => (
            <div key={b.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <div>
                <p className="text-sm font-medium text-foreground">{b.billing_month}</p>
                <p className="text-xs text-muted-foreground">{b.kwh_used} kWh</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-foreground">${(b.total_amount || 0).toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">{t(`status.${b.status}`)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <QuickLink to="/macaamiisha" icon={Sun} label={t("nav.customers")} />
        <QuickLink to="/billing" icon={FileText} label={t("nav.billing")} />
        <QuickLink to="/lacagaha" icon={DollarSign} label={t("payments.title")} />
        <QuickLink to="/ogeysiisyada" icon={Bell} label={t("nav.notifications")} />
      </div>
    </div>
  );
}