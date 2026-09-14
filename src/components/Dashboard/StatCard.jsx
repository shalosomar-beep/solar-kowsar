import React from "react";

const solidColorMap = {
  amber: { bg: "bg-amber-600", icon: "text-amber-100" },
  teal: { bg: "bg-teal-700", icon: "text-teal-100" },
  blue: { bg: "bg-blue-800", icon: "text-blue-100" },
  red: { bg: "bg-red-700", icon: "text-red-100" },
  purple: { bg: "bg-purple-800", icon: "text-purple-100" },
  indigo: { bg: "bg-indigo-700", icon: "text-indigo-100" },
  orange: { bg: "bg-orange-700", icon: "text-orange-100" },
};

const gradientColorMap = {
  amber: { bg: "from-amber-500/20 to-amber-600/5", border: "border-amber-500/20", text: "text-amber-400", icon: "text-amber-400" },
  emerald: { bg: "from-emerald-500/20 to-emerald-600/5", border: "border-emerald-500/20", text: "text-emerald-400", icon: "text-emerald-400" },
  blue: { bg: "from-blue-500/20 to-blue-600/5", border: "border-blue-500/20", text: "text-blue-400", icon: "text-blue-400" },
  purple: { bg: "from-purple-500/20 to-purple-600/5", border: "border-purple-500/20", text: "text-purple-400", icon: "text-purple-400" },
  rose: { bg: "from-rose-500/20 to-rose-600/5", border: "border-rose-500/20", text: "text-rose-400", icon: "text-rose-400" },
  cyan: { bg: "from-cyan-500/20 to-cyan-600/5", border: "border-cyan-500/20", text: "text-cyan-400", icon: "text-cyan-400" },
};

export default function StatCard({ title, value, subtitle, icon: Icon, color = "amber", solid = false }) {
  if (solid) {
    const c = solidColorMap[color] || solidColorMap.amber;
    return (
      <div className={`relative overflow-hidden rounded-2xl ${c.bg} p-5 transition-all hover:scale-[1.03] hover:shadow-xl duration-300`}>
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1.5 min-w-0">
            <p className="text-white/70 text-[11px] font-semibold uppercase tracking-wider truncate">{title}</p>
            <p className="text-2xl md:text-[28px] font-bold text-white leading-tight">{value}</p>
            {subtitle && <p className="text-white/60 text-xs">{subtitle}</p>}
          </div>
          {Icon && (
            <div className="p-2.5 rounded-xl bg-white/15 shrink-0">
              <Icon className={`w-5 h-5 ${c.icon}`} />
            </div>
          )}
        </div>
      </div>
    );
  }

  const c = gradientColorMap[color] || gradientColorMap.amber;
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${c.bg} border ${c.border} p-5 transition-all hover:scale-[1.02] duration-300`}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-zinc-400 text-xs font-medium uppercase tracking-wider">{title}</p>
          <p className={`text-2xl md:text-3xl font-bold ${c.text}`}>{value}</p>
          {subtitle && <p className="text-zinc-500 text-xs">{subtitle}</p>}
        </div>
        {Icon && (
          <div className={`p-2.5 rounded-xl bg-white/5 ${c.icon}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  );
}