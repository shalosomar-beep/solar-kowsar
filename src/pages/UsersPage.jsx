import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { useT } from "@/lib/i18n";
import {
  UserCog, UserPlus, ShieldCheck, ShieldBan, KeyRound,
  PowerOff, Power, Search, Loader2, ScrollText, Users as UsersIcon, Mail
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem
} from "@/components/ui/select";
import { ROLE_LABELS } from "@/lib/permissions";

const ROLE_OPTIONS = ["admin", "manager", "technician", "billing", "customer"];

const STATUS_META = {
  active: { label: "Furu", color: "bg-emerald-500/15 text-emerald-400" },
  suspended: { label: "La Joojiyay", color: "bg-amber-500/15 text-amber-400" },
  deactivated: { label: "La Xiray", color: "bg-red-500/15 text-red-400" },
};

const ACTION_LABELS = {
  employee_created: "Akawnta la abuuray",
  employee_updated: "Akawnta la beddelay",
  employee_suspended: "Akawnta la joojiyay",
  employee_reactivated: "Akawnta la soo celiyay",
  employee_deactivated: "Akawnta la xiray",
  password_reset: "Lambarka sirta ah la fur mar kale",
};

const emptyForm = { email: "", full_name: "", role: "technician", phone: "", department: "", hired_date: "", notes: "" };

export default function UsersPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useT();
  const [tab, setTab] = useState("employees");
  const [employees, setEmployees] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [emps, auditLogs] = await Promise.all([
        base44.entities.Employee.list("-created_date"),
        base44.entities.AuditLog.list("-timestamp", 50).catch(() => []),
      ]);
      setEmployees(emps || []);
      setLogs(auditLogs || []);
    } catch (e) {
      toast({ title: t("emp.error.load"), description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast, t]);

  useEffect(() => { load(); }, [load]);

  // Realtime: refresh when employees or audit logs change
  useEffect(() => {
    const u1 = base44.entities.Employee.subscribe(() => { load(); });
    const u2 = base44.entities.AuditLog.subscribe(() => { load(); });
    return () => { u1?.(); u2?.(); };
  }, [load]);

  const invoke = (payload) => base44.functions.invoke("manageEmployee", payload).then((r) => r.data);

  const openCreate = () => {
    setEditTarget(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (emp) => {
    setEditTarget(emp);
    setForm({
      email: emp.email || "", full_name: emp.full_name || "", role: emp.role || "technician",
      phone: emp.phone || "", department: emp.department || "",
      hired_date: emp.hired_date || "", notes: emp.notes || ""
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.email || !form.full_name) {
      toast({ title: t("emp.error.missing"), variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      if (editTarget) {
        await invoke({ action: "update", employeeId: editTarget.id, email: editTarget.email, changes: form });
        toast({ title: t("emp.toast.updated") });
      } else {
        // Invite the platform user, then create the employee profile + audit log
        try {
          await base44.users.inviteUser(form.email, "user");
        } catch (inviteErr) {
          // User may already be invited — continue creating the profile
        }
        await invoke({ action: "create", employee: { ...form, status: "active" } });
        toast({ title: t("emp.toast.created"), description: t("emp.toast.invited") });
      }
      setModalOpen(false);
      await load();
    } catch (err) {
      const msg = err?.response?.data?.error || err.message;
      toast({ title: t("emp.error.save"), description: msg, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const changeStatus = async (emp, status) => {
    setBusyId(emp.id);
    try {
      const action = status === "active" ? "reactivate" : status === "suspended" ? "suspend" : "deactivate";
      await invoke({ action, employeeId: emp.id, email: emp.email });
      toast({ title: t("emp.toast.statusChanged") });
      await load();
    } catch (err) {
      toast({ title: t("emp.error.save"), description: err.message, variant: "destructive" });
    } finally {
      setBusyId(null);
    }
  };

  const resetPassword = async (emp) => {
    setBusyId(emp.id);
    try {
      try { await base44.auth.resetPasswordRequest(emp.email); } catch {}
      await invoke({ action: "audit", auditAction: "password_reset", email: emp.email, details: "Password reset requested" });
      toast({ title: t("emp.toast.resetSent") });
      await load();
    } catch (err) {
      toast({ title: t("emp.error.save"), description: err.message, variant: "destructive" });
    } finally {
      setBusyId(null);
    }
  };

  const filtered = employees.filter((e) => {
    const q = search.toLowerCase();
    return !q || (e.full_name || "").toLowerCase().includes(q) || (e.email || "").toLowerCase().includes(q) || (e.role || "").toLowerCase().includes(q);
  });

  const stats = {
    total: employees.length,
    active: employees.filter((e) => e.status === "active").length,
    suspended: employees.filter((e) => e.status === "suspended").length,
    deactivated: employees.filter((e) => e.status === "deactivated").length,
  };

  if (loading && employees.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t("emp.title")}</h1>
            <p className="text-muted-foreground text-sm">{t("emp.subtitle")}</p>
          </div>
        </div>
        <Button onClick={openCreate} className="bg-amber-600 hover:bg-amber-700 text-white">
          <UserPlus className="w-4 h-4" />
          {t("emp.add")}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={UsersIcon} label={t("emp.stat.total")} value={stats.total} tone="text-blue-400" />
        <StatCard icon={ShieldCheck} label={t("emp.stat.active")} value={stats.active} tone="text-emerald-400" />
        <StatCard icon={ShieldBan} label={t("emp.stat.suspended")} value={stats.suspended} tone="text-amber-400" />
        <StatCard icon={PowerOff} label={t("emp.stat.deactivated")} value={stats.deactivated} tone="text-red-400" />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        <TabButton active={tab === "employees"} onClick={() => setTab("employees")} icon={UsersIcon} label={t("emp.tab.employees")} />
        <TabButton active={tab === "audit"} onClick={() => setTab("audit")} icon={ScrollText} label={t("emp.tab.audit")} />
      </div>

      {tab === "employees" ? (
        <>
          <div className="relative max-w-md">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("emp.search")}
              className="ps-9 bg-background border-border"
            />
          </div>

          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="text-start px-4 py-3 font-medium">{t("emp.col.name")}</th>
                    <th className="text-start px-4 py-3 font-medium">{t("emp.col.role")}</th>
                    <th className="text-start px-4 py-3 font-medium">{t("emp.col.status")}</th>
                    <th className="text-start px-4 py-3 font-medium hidden md:table-cell">{t("emp.col.department")}</th>
                    <th className="text-end px-4 py-3 font-medium">{t("emp.col.actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">{t("emp.empty")}</td></tr>
                  ) : filtered.map((emp) => {
                    const st = STATUS_META[emp.status] || STATUS_META.active;
                    const isSelf = emp.email === user?.email;
                    return (
                      <tr key={emp.id} className="border-b border-border/50 hover:bg-muted/40">
                        <td className="px-4 py-3">
                          <div className="font-medium text-foreground">{emp.full_name || "—"}</div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <Mail className="w-3 h-3" />{emp.email}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">
                            {ROLE_LABELS[emp.role] || emp.role}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${st.color}`}>{st.label}</span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{emp.department || "—"}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <IconBtn title={t("common.edit")} disabled={busyId === emp.id || isSelf} onClick={() => openEdit(emp)}>
                              <UserCog className="w-4 h-4" />
                            </IconBtn>
                            {emp.status === "active" ? (
                              <IconBtn title={t("emp.action.suspend")} disabled={busyId === emp.id || isSelf} onClick={() => changeStatus(emp, "suspended")} danger="amber">
                                <ShieldBan className="w-4 h-4" />
                              </IconBtn>
                            ) : (
                              <IconBtn title={t("emp.action.reactivate")} disabled={busyId === emp.id || isSelf} onClick={() => changeStatus(emp, "active")}>
                                <Power className="w-4 h-4" />
                              </IconBtn>
                            )}
                            {emp.status !== "deactivated" && (
                              <IconBtn title={t("emp.action.deactivate")} disabled={busyId === emp.id || isSelf} onClick={() => changeStatus(emp, "deactivated")} danger="red">
                                <PowerOff className="w-4 h-4" />
                              </IconBtn>
                            )}
                            <IconBtn title={t("emp.action.resetPassword")} disabled={busyId === emp.id} onClick={() => resetPassword(emp)}>
                              <KeyRound className="w-4 h-4" />
                            </IconBtn>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="text-start px-4 py-3 font-medium">{t("audit.col.action")}</th>
                  <th className="text-start px-4 py-3 font-medium">{t("audit.col.admin")}</th>
                  <th className="text-start px-4 py-3 font-medium">{t("audit.col.target")}</th>
                  <th className="text-start px-4 py-3 font-medium hidden md:table-cell">{t("audit.col.details")}</th>
                  <th className="text-start px-4 py-3 font-medium">{t("audit.col.time")}</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">{t("audit.empty")}</td></tr>
                ) : logs.map((log) => (
                  <tr key={log.id} className="border-b border-border/50 hover:bg-muted/40">
                    <td className="px-4 py-3">
                      <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-amber-500/10 text-amber-500">
                        {ACTION_LABELS[log.action] || log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-foreground">{log.performed_by_name || log.performed_by_email}</td>
                    <td className="px-4 py-3 text-muted-foreground">{log.target_email || "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell max-w-xs truncate">{log.details || "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                      {log.timestamp ? new Date(log.timestamp).toLocaleString() : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit dialog */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editTarget ? t("emp.edit") : t("emp.add")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label>{t("emp.field.email")} *</Label>
              <Input
                type="email" value={form.email} required
                disabled={!!editTarget}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="name@qoraxsolar.so"
                className="bg-background border-border"
              />
            </div>
            <div className="space-y-2">
              <Label>{t("emp.field.name")} *</Label>
              <Input value={form.full_name} required
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                className="bg-background border-border" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("emp.field.role")} *</Label>
                <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                  <SelectTrigger className="bg-background border-border"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ROLE_OPTIONS.map((r) => (
                      <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("emp.field.phone")}</Label>
                <Input value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="bg-background border-border" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("emp.field.department")}</Label>
                <Input value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                  className="bg-background border-border" />
              </div>
              <div className="space-y-2">
                <Label>{t("emp.field.hiredDate")}</Label>
                <Input type="date" value={form.hired_date}
                  onChange={(e) => setForm({ ...form, hired_date: e.target.value })}
                  className="bg-background border-border" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t("emp.field.notes")}</Label>
              <Input value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="bg-background border-border" />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">{t("emp.cancel")}</Button>
              </DialogClose>
              <Button type="submit" disabled={saving} className="bg-amber-600 hover:bg-amber-700 text-white">
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {editTarget ? t("emp.save") : t("emp.create")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, tone }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-muted-foreground text-xs">
        <Icon className={`w-4 h-4 ${tone}`} />
        {label}
      </div>
      <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
        active ? "border-amber-500 text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}

function IconBtn({ children, title, onClick, disabled, danger }) {
  const tone = danger === "red" ? "hover:text-red-400" : danger === "amber" ? "hover:text-amber-400" : "hover:text-blue-400";
  return (
    <button
      type="button" title={title} onClick={onClick} disabled={disabled}
      className={`p-1.5 rounded-md text-muted-foreground ${tone} disabled:opacity-30 disabled:cursor-not-allowed transition-colors`}
    >
      {children}
    </button>
  );
}