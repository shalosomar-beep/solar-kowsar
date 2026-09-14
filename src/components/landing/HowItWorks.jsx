import React from "react";
import { ClipboardList, Sun, BarChart3 } from "lucide-react";

const steps = [
  {
    icon: ClipboardList,
    step: "01",
    title: "Sign Up & Choose a Plan",
    description:
      "Create your account and pick a solar rental plan that fits your energy needs — from panels to batteries and smart meters.",
  },
  {
    icon: Sun,
    step: "02",
    title: "We Install & Activate",
    description:
      "Our technicians install and configure your solar equipment, then activate real-time monitoring on your dashboard.",
  },
  {
    icon: BarChart3,
    step: "03",
    title: "Monitor & Pay Monthly",
    description:
      "Track production and usage live, receive automated monthly bills, and pay easily via EVC Plus, Zaad, or bank transfer.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-24 px-6 bg-transparent">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <span className="inline-block px-3 py-1 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 text-xs font-semibold uppercase tracking-wider">
            How it Works
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-white">
            Get started in three simple steps
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((s, i) => (
            <div key={s.step} className="relative text-center">
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-10 left-1/2 w-full h-px border-t border-dashed border-white/10" />
              )}
              <div className="relative inline-flex">
                <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center shadow-sm">
                  <s.icon className="w-9 h-9 text-amber-500" />
                </div>
                <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white text-xs font-bold flex items-center justify-center">
                  {s.step}
                </span>
              </div>
              <h3 className="mt-6 text-lg font-semibold text-white">{s.title}</h3>
              <p className="mt-2 text-sm text-zinc-300 leading-relaxed">{s.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}