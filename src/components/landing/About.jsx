import React from "react";
import { Sun, ShieldCheck, Zap, HeartHandshake } from "lucide-react";

const highlights = [
  {
    icon: Zap,
    title: "Premium Equipment",
    description: "Top-tier panels, inverters, and batteries — rented on flexible monthly plans.",
  },
  {
    icon: ShieldCheck,
    title: "Trusted & Reliable",
    description: "Full installation, maintenance, and support included for every customer.",
  },
  {
    icon: HeartHandshake,
    title: "Built for Somalia",
    description: "Designed for homes and businesses across Somalia, with local payment options.",
  },
];

export default function About() {
  return (
    <section id="about" className="relative py-24 px-6 bg-transparent">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Text */}
          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 text-xs font-semibold uppercase tracking-wider">
              About Us
            </span>
            <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-white">
              Powering Somalia with premium solar energy
            </h2>
            <p className="mt-4 text-zinc-300 leading-relaxed">
              Solar Kowsar is a premium solar energy management and rental platform in Somalia.
              We make clean, reliable solar power accessible to homes and businesses through
              flexible equipment rentals and intelligent, real-time energy monitoring.
            </p>
            <p className="mt-3 text-zinc-300 leading-relaxed">
              From installation to ongoing support, our team handles every step — so you can
              focus on what matters while we power your future with the sun.
            </p>
            <div className="mt-6 flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <Sun className="w-4 h-4" />
              <span className="text-sm font-medium">Powered by solar intelligence</span>
            </div>
          </div>

          {/* Highlight cards */}
          <div className="grid sm:grid-cols-1 gap-4">
            {highlights.map((h) => (
              <div
                key={h.title}
                className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/10 backdrop-blur-md p-6 hover:border-amber-500/50 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0">
                  <h.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">{h.title}</h3>
                  <p className="text-sm text-zinc-300 leading-relaxed">{h.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}