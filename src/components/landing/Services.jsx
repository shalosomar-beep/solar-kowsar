import React from "react";
import { Sun, Activity } from "lucide-react";

const LOGO_URL = "https://media.base44.com/images/public/6a59d873561dbe6df255f399/bc82d664a_generated_image.png";

const services = [
  {
    icon: Sun,
    title: "Solar Equipment Rental",
    description:
      "Rent high-quality solar panels, inverters, batteries, and smart meters with flexible monthly plans tailored to your energy needs.",
    points: ["Flexible monthly rates", "Full installation included", "Maintenance & support"],
  },
  {
    icon: Activity,
    title: "Power Monitoring",
    description:
      "Real-time tracking of solar production, consumption, and equipment health — so you always know your energy status at a glance.",
    points: ["Live usage dashboards", "Equipment health alerts", "Automated monthly billing"],
  },
];

export default function Services() {
  return (
    <section id="services" className="relative py-24 px-6 bg-transparent">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <span className="inline-block px-3 py-1 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 text-xs font-semibold uppercase tracking-wider">
            Our Services
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-white">
            Energy solutions built for you
          </h2>
          <p className="mt-3 text-zinc-300 max-w-2xl mx-auto">
            From renting solar equipment to monitoring your power in real time, Solar Kowsar covers every step of your solar journey.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {services.map((s) => (
            <div
              key={s.title}
              className="group rounded-2xl border border-white/10 bg-white/10 backdrop-blur-md p-8 hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-500/5 transition-all"
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mb-5">
                <s.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">{s.title}</h3>
              <p className="text-zinc-300 text-sm leading-relaxed mb-5">{s.description}</p>
              <ul className="space-y-2">
                {s.points.map((p) => (
                  <li key={p} className="flex items-center gap-2 text-sm text-white/80">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}