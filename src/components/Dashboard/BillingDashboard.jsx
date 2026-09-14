import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { useT } from "@/lib/i18n";
import {
  Calendar, Banknote, Users, AlertTriangle, DollarSign, FileText, ArrowRight
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

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

// Dashboard for Billing staff — invoices, payments, customers only.
export default function BillingDashboard() {
  const { t } = useT();
  const [customers, setCustomers] = useState([]);
  const [billings, setBillings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.Customer.list().catch(() => []),
      base44.entities.Billing.list().catch(() => []),
    ]).then(([c, b]) => {
      setCustomers(c);
      setBillings(b);
      setLoading(false);
    });
  }, []);

  if (loading) return <Spinner />;

  const pending = billings.filter((b) => b.status === "pending");
  const overdue = billings.filter((b) => b.status === "overdue");
  const collected = billings
    .filter((b) => b.status === "paid")
    .reduce((s, b) => s + (b.total_amount || 0), 0);

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const revenueByMonth = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const rev = billings
      .filter((b) => b.billing_month?.startsWith(key) && b.status === "paid")
      .reduce((s, b) => s + (b.total_amount || 0), 0);
    revenueByMonth.push({ name: monthNames[d.getMonth()], lacag: Number(rev.toFixed(2)) });
  }

  const recentBills = [...billings]
    .sort((a, b) => new Date(b.created_date || 0) - new Date(a.created_date || 0))
    .slice(0, 6);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">{t("rbac.billing.title")}</h1>
          <p className="text-muted-foreground mt-0.5 text-sm">{t("rbac.billing.subtitle")}</p>
        </div>
        <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-card border border-border text-sm text-muted-foreground">
          <Calendar className="w-4 h-4 text-orange-400" />
          {new Date().toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={Users} label={t("rbac.billing.customers")} value={customers.length} accent="text-blue-400" />
        <StatCard icon={FileText} label={t("rbac.billing.pending")} value={pending.length} accent="text-amber-400" />
        <StatCard icon={AlertTriangle} label={t("rbac.billing.overdue")} value={overdue.length} accent="text-red-400" />
        <StatCard icon={DollarSign} label={t("rbac.billing.collected")} value={`$${collected.toFixed(2)}`} accent="text-emerald-400" />
      </div>

      <div className="rounded-xl bg-card border border-border p-4">
        <h3 className="text-foreground font-semibold text-sm mb-3 flex items-center gap-2">
          <Banknote className="w-4 h-4 text-amber-400" />
          {t("rbac.billing.revenue")}
        </h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenueByMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "12px" }} />
              <Bar dataKey="lacag" fill="#f59e0b" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-xl bg-card border border-border p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-foreground font-semibold text-sm">{t("rbac.billing.recentBills")}</h3>
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
                <p className="text-sm font-medium text-foreground">{b.customer || "-"}</p>
                <p className="text-xs text-muted-foreground">{b.billing_month} · {b.kwh_used} kWh</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-foreground">${(b.total_amount || 0).toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">{t(`status.${b.status}`)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <QuickLink to="/billing" icon={FileText} label={t("nav.billing")} />
        <QuickLink to="/lacagaha" icon={DollarSign} label={t("payments.title")} />
        <QuickLink to="/macaamiisha" icon={Users} label={t("nav.customers")} />
      </div>
    </div>
  );
}