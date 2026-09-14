import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { History } from "lucide-react";

export default function HistoryPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.Billing.list("-created_date", 20),
      base44.entities.Expense.list("-created_date", 20),
    ]).then(([billings, expenses]) => {
      const combined = [
        ...billings.map((b) => ({
          id: b.id,
          type: "billing",
          title: `Billing - ${b.billing_month || "—"}`,
          amount: b.total_amount,
          date: b.created_date,
          status: b.status,
        })),
        ...expenses.map((e) => ({
          id: e.id,
          type: "expense",
          title: e.title || "Kharash",
          amount: e.amount,
          date: e.created_date,
          status: e.category,
        })),
      ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 30);
      setItems(combined);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-[#4f46e5]/10 flex items-center justify-center">
          <History className="w-5 h-5 text-[#4f46e5]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Taariikhda</h1>
          <p className="text-zinc-400 text-sm">Diiwaanka hawlaha ee dhacay</p>
        </div>
      </div>

      <Card className="bg-zinc-900 border-zinc-800">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400">
                <th className="text-left px-6 py-3 font-medium">Nooca</th>
                <th className="text-left px-6 py-3 font-medium">Faahfaah</th>
                <th className="text-left px-6 py-3 font-medium">Qadarka</th>
                <th className="text-left px-6 py-3 font-medium">Taariikhda</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-zinc-500">
                    Diiwaan taariikh ah lama helin
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={`${item.type}-${item.id}`} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                    <td className="px-6 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                        item.type === "billing"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-orange-500/10 text-orange-400"
                      }`}>
                        {item.type === "billing" ? "Billing" : "Kharash"}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-white font-medium">{item.title}</td>
                    <td className="px-6 py-3 text-white font-medium">
                      ${(item.amount || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-3 text-zinc-400">
                      {item.date ? new Date(item.date).toLocaleDateString() : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}