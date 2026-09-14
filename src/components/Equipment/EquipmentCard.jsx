import React from "react";
import { Battery, Zap, Sun, Fuel, Gauge } from "lucide-react";

export const CATEGORY_META = {
  battery: { label: "Battery", icon: Battery, color: "#f59e0b" },
  inverter: { label: "Inverter", icon: Zap, color: "#3b82f6" },
  solar_panel: { label: "Solar Panel", icon: Sun, color: "#22c55e" },
  generator: { label: "Generator", icon: Fuel, color: "#a855f7" },
  smart_meter: { label: "Smart Meter", icon: Gauge, color: "#06b6d4" },
};

export const STATUS_META = {
  online: { label: "Online", bg: "bg-emerald-500/15", text: "text-emerald-400", dot: "bg-emerald-500" },
  offline: { label: "Offline", bg: "bg-red-500/15", text: "text-red-400", dot: "bg-red-500" },
  warning: { label: "Digniin", bg: "bg-amber-500/15", text: "text-amber-400", dot: "bg-amber-500" },
};

function valueColor(value, warn, crit) {
  if (value <= crit) return "text-red-400";
  if (value <= warn) return "text-amber-400";
  return "text-emerald-400";
}

export default function EquipmentCard({ item, onEdit, onDelete }) {
  const cat = CATEGORY_META[item.category] || CATEGORY_META.battery;
  const status = STATUS_META[item.status] || STATUS_META.online;
  const Icon = cat.icon;

  return (
    <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800 p-5 hover:border-zinc-700 transition-colors group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${cat.color}1a`, color: cat.color }}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-white font-semibold text-sm truncate">{item.name}</h3>
            <p className="text-zinc-500 text-xs mt-0.5">{cat.label}</p>
          </div>
        </div>
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status.bg} ${status.text} shrink-0`}>
          <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
          {status.label}
        </span>
      </div>

      <div className="space-y-2.5 text-sm">
        <Row label="Goobta" value={item.location} />
        {item.battery_level != null && (
          <Row label="Darajada Battery-da" value={`${item.battery_level}%`} valueClass={valueColor(item.battery_level, 40, 25)} />
        )}
        {item.temperature != null && (
          <Row label="Kulka" value={`${item.temperature}°C`} valueClass={item.temperature >= 50 ? "text-red-400" : "text-zinc-200"} />
        )}
        {item.health != null && (
          <Row label="Caafimaadka" value={`${item.health}%`} valueClass={valueColor(item.health, 60, 50)} />
        )}
        <Row label="Lambarka Siiraadka" value={item.serial_number} mono />
      </div>

      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-zinc-800/60 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => onEdit?.(item)} className="text-xs font-medium text-zinc-400 hover:text-blue-400 transition-colors">Beddel</button>
        <span className="text-zinc-700">·</span>
        <button onClick={() => onDelete?.(item)} className="text-xs font-medium text-zinc-400 hover:text-red-400 transition-colors">Tirtir</button>
      </div>
    </div>
  );
}

function Row({ label, value, valueClass, mono }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-zinc-500">{label}</span>
      <span className={`font-medium ${valueClass || "text-zinc-200"} ${mono ? "font-mono text-xs" : ""}`}>{value}</span>
    </div>
  );
}