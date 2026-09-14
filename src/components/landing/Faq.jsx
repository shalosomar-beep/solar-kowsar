import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "How does the solar equipment rental work?",
    a: "You choose a rental plan, we install the solar equipment at your location, and you pay a fixed monthly rate. Maintenance and support are included for the duration of your rental.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept EVC Plus, Zaad, bank transfers, and cash. Monthly bills are generated automatically and can be paid directly through your dashboard.",
  },
  {
    q: "Can I monitor my energy production in real time?",
    a: "Yes. Your dashboard shows live solar production, consumption, equipment health, and battery status — updated continuously throughout the day.",
  },
  {
    q: "What happens if my equipment has a problem?",
    a: "Our system automatically detects faults and raises an alarm. A technician is dispatched to resolve the issue, and all maintenance is covered under your rental plan.",
  },
  {
    q: "Is there a long-term contract?",
    a: "Plans are flexible and billed monthly. You can upgrade or adjust your plan as your energy needs change.",
  },
];

function FaqItem({ item }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-white/10 bg-white/10 backdrop-blur-md overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full px-5 py-4 text-left hover:bg-white/10 transition-colors"
      >
        <span className="font-medium text-white pr-4">{item.q}</span>
        <ChevronDown
          className={`w-5 h-5 text-amber-500 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      <div
        className={`grid transition-all duration-300 ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <p className="px-5 pb-4 text-sm text-zinc-300 leading-relaxed">{item.a}</p>
        </div>
      </div>
    </div>
  );
}

export default function Faq() {
  return (
    <section id="faq" className="relative py-24 px-6 bg-transparent">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <span className="inline-block px-3 py-1 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 text-xs font-semibold uppercase tracking-wider">
            FAQ
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-white">
            Frequently asked questions
          </h2>
          <p className="mt-3 text-zinc-300">Everything you need to know about Solar Kowsar.</p>
        </div>
        <div className="space-y-3">
          {faqs.map((f) => (
            <FaqItem key={f.q} item={f} />
          ))}
        </div>
      </div>
    </section>
  );
}