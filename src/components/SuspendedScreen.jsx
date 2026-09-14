import React from "react";
import { ShieldBan, LogOut } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { useT } from "@/lib/i18n";

export default function SuspendedScreen() {
  const { logout } = useAuth();
  const { t } = useT();

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-zinc-950 p-6">
      <div className="max-w-md w-full rounded-2xl bg-zinc-900/80 border border-zinc-800 p-8 text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-500/15 flex items-center justify-center mx-auto mb-5">
          <ShieldBan className="w-7 h-7 text-red-400" />
        </div>
        <h1 className="text-xl font-bold text-white mb-2">{t("auth.suspendedTitle")}</h1>
        <p className="text-zinc-400 text-sm leading-relaxed mb-6">{t("auth.suspendedMessage")}</p>
        <button
          onClick={() => logout(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors"
        >
          <LogOut className="w-4 h-4" />
          {t("auth.logout")}
        </button>
      </div>
    </div>
  );
}