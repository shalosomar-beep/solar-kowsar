import React from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Controls from "./Controls";
import { UserPlus } from "lucide-react";
import { useT } from "@/lib/i18n";
import { useAuth } from "@/lib/AuthContext";
import { canAccess, isAdminRole } from "@/lib/permissions";
import SolarKowsarLogo from "@/components/SolarKowsarLogo";

const SOLAR_BG = "https://media.base44.com/images/public/6a59d873561dbe6df255f399/80b59ffac_image.png";

export default function AppLayout() {
  const { user, jobRole } = useAuth();
  const { t } = useT();
  const location = useLocation();
  const navigate = useNavigate();

  // Redirect users away from modules their role cannot access.
  React.useEffect(() => {
    if (jobRole && !canAccess(jobRole, location.pathname) && location.pathname !== "/") {
      navigate("/", { replace: true });
    }
  }, [jobRole, location.pathname, navigate]);

  return (
    <div className="min-h-screen relative">
      {/* Solar background image */}
      <div
        className="fixed inset-0 -z-20 bg-cover bg-center opacity-30"
        style={{ backgroundImage: `url(${SOLAR_BG})` }}
        aria-hidden
      />
      {/* Theme-aware overlay for readability */}
      <div className="fixed inset-0 -z-10 bg-background/85" aria-hidden />

      <Sidebar />
      <div className="lg:ms-64 relative">
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="lg:hidden w-10" />
            <div className="flex-1" />
            <div className="flex items-center gap-2 sm:gap-3">
              {isAdminRole(jobRole) && (
                <Link
                  to="/isticmaalayaasha"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{t("header.invite")}</span>
                </Link>
              )}
              <Controls />
              {user && (
                <div className="flex items-center gap-2">
                  <span className="hidden sm:inline text-xs font-medium text-foreground max-w-[140px] truncate">
                    {user.full_name || user.email}
                  </span>
                  <SolarKowsarLogo size={36} showText={false} />
                </div>
              )}
            </div>
          </div>
        </header>
        <main className="p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}