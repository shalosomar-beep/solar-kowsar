import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Users, Banknote, Package, UserPlus, Wallet,
  BarChart3, Bell, Activity, MapPin, History as HistoryIcon,
  FileText, Settings, Menu, X, LogOut, ChevronRight, Sun, Clock, Siren, HardHat, Tag, Store, ClipboardList, TrendingUp
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useT } from "@/lib/i18n";
import { useAuth } from "@/lib/AuthContext";
import { filterNavByRole } from "@/lib/permissions";
import SolarKowsarLogo from "@/components/SolarKowsarLogo";

const navItems = [
  { labelKey: "nav.home", path: "/", icon: LayoutDashboard },
  { labelKey: "nav.customers", path: "/macaamiisha", icon: Users },
  { labelKey: "nav.billing", path: "/billing", icon: Banknote },
  { labelKey: "nav.equipment", path: "/qalabka", icon: Package },
  { labelKey: "nav.solarData", path: "/xogta-qoraxda", icon: Sun },
  { labelKey: "nav.users", path: "/isticmaalayaasha", icon: UserPlus },
  { labelKey: "nav.usage", path: "/isticmaalka", icon: BarChart3 },
  { labelKey: "nav.usageReports", path: "/warbixin-isticmaalka", icon: TrendingUp },
  { labelKey: "nav.notifications", path: "/ogeysiisyada", icon: Bell },
  { labelKey: "nav.maintenance", path: "/dayactir", icon: Activity },
  { labelKey: "nav.alarms", path: "/ciladaha", icon: Siren },
  { labelKey: "nav.staff", path: "/shaqaalaha", icon: HardHat },
  { labelKey: "nav.tariffs", path: "/qiimaynta", icon: Tag },
  { labelKey: "nav.locations", path: "/goobaha", icon: MapPin },
  { labelKey: "nav.history", path: "/taariikhda", icon: HistoryIcon },
  { labelKey: "nav.reports", path: "/warbixin", icon: FileText },
  { labelKey: "nav.expenses", path: "/kharashaadka", icon: Wallet },
  { labelKey: "nav.vendors", path: "/tixdeliyayaasha", icon: Store },
  { labelKey: "nav.tasks", path: "/hawlaha", icon: ClipboardList },
];

export default function Sidebar() {
  const location = useLocation();
  const { t, dir } = useT();
  const { jobRole } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [solarHours, setSolarHours] = useState(null);

  const visibleNav = filterNavByRole(jobRole, navItems);

  useEffect(() => {
    base44.entities.SolarData.list("-usage_date", 1)
      .then((data) => {
        if (data && data.length > 0) {
          setSolarHours(Number(data[0].sun_hours) || 0);
        }
      })
      .catch(() => {});
  }, []);

  const handleLogout = () => {
    base44.auth.logout("/login");
  };

  const hiddenTranslate = dir === "rtl" ? "translate-x-full" : "-translate-x-full";

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-5">
        <div className="flex items-center gap-2.5">
          <SolarKowsarLogo size={36} textClass="text-lg" />
        </div>
      </div>

      {/* Divider */}
      <div className="border-b border-sidebar-border mx-3" />

      {/* Solar Hours Widget */}
      <Link
        to="/xogta-qoraxda"
        onClick={() => setMobileOpen(false)}
        className="mx-3 mt-3 rounded-lg bg-gradient-to-br from-orange-500/15 to-amber-500/10 border border-orange-500/20 p-3 hover:from-orange-500/25 hover:to-amber-500/20 transition-colors block"
      >
        <div className="flex items-center gap-2 text-orange-400">
          <Clock className="w-4 h-4" />
          <span className="text-xs font-medium uppercase tracking-wider">{t("sidebar.solarHoursTitle")}</span>
        </div>
        <p className="text-2xl font-bold text-foreground mt-1">
          {solarHours === null ? "—" : `${solarHours.toFixed(1)} h`}
        </p>
        <p className="text-[10px] text-muted-foreground mt-0.5">{t("sidebar.solarHoursSub")}</p>
      </Link>

      {/* Nav */}
      <nav className="flex-1 px-3 mt-3 space-y-0.5 overflow-y-auto">
        {visibleNav.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
              }`}
            >
              <item.icon className="w-[18px] h-[18px] shrink-0" />
              {t(item.labelKey)}
              {isActive && <ChevronRight className="w-4 h-4 ms-auto" />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="p-3 mt-auto space-y-0.5">
        <Link
          to="/boggooyinka"
          onClick={() => setMobileOpen(false)}
          className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            location.pathname === "/boggooyinka"
              ? "bg-sidebar-accent text-sidebar-primary"
              : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
          }`}
        >
          <Settings className="w-[18px] h-[18px]" />
          {t("nav.settings")}
          {location.pathname === "/boggooyinka" && <ChevronRight className="w-4 h-4 ms-auto" />}
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground/70 hover:text-red-400 hover:bg-sidebar-accent/50 transition-colors w-full"
        >
          <LogOut className="w-[18px] h-[18px]" />
          {t("nav.logout")}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 start-4 z-50 p-2 bg-sidebar-background border border-sidebar-border rounded-lg text-foreground"
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/60 z-40" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 start-0 h-screen w-64 bg-sidebar-background z-40 transition-transform duration-300 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : hiddenTranslate
        }`}
      >
        <SidebarContent />
      </aside>
    </>
  );
}