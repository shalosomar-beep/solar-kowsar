import React from "react";
import { Mail, Phone, MapPin, Sun } from "lucide-react";

const LOGO_URL = "https://media.base44.com/images/public/6a59d873561dbe6df255f399/bc82d664a_generated_image.png";

const contacts = [
  { icon: Mail, label: "Email", value: "mcnkowsar@gmail.com", href: "mailto:mcnkowsar@gmail.com" },
  { icon: Phone, label: "Phone", value: "+252 907320316", href: "tel:+252907320316" },
  { icon: MapPin, label: "Location", value: "Garowe, Somalia", href: null },
];

export default function Footer() {
  return (
    <footer className="relative bg-black/70 backdrop-blur-md text-zinc-300 border-t border-white/10">
      <div className="max-w-6xl mx-auto px-6 py-14">
        <div className="grid md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <img src={LOGO_URL} alt="Solar Kowsar" className="w-9 h-9 rounded-lg object-cover" />
              <span className="text-lg font-bold text-white">Solar Kowsar</span>
            </div>
            <p className="text-sm text-zinc-400 leading-relaxed max-w-xs">
              Solar energy management & rental platform powering homes and businesses across Somalia.
            </p>
            <div className="flex items-center gap-2 mt-4 text-amber-500">
              <Sun className="w-4 h-4" />
              <span className="text-xs">Powered by solar intelligence</span>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li><a href="#services" className="hover:text-amber-400 transition-colors">Services</a></li>
              <li><a href="#about" className="hover:text-amber-400 transition-colors">Contact</a></li>
              <li><a href="#faq" className="hover:text-amber-400 transition-colors">Privacy Policy</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Contact Information
            </h4>
            <ul className="space-y-3">
              {contacts.map((c) => (
                <li key={c.label} className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                    <c.icon className="w-4 h-4 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500">{c.label}</p>
                    {c.href ? (
                      <a href={c.href} className="text-sm text-zinc-200 hover:text-amber-400 transition-colors">
                        {c.value}
                      </a>
                    ) : (
                      <p className="text-sm text-zinc-200">{c.value}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-zinc-500">
            © {new Date().getFullYear()} Solar Kowsar. All rights reserved.
          </p>
          <p className="text-xs text-zinc-500">Designed for a brighter, solar-powered future.</p>
        </div>
      </div>
    </footer>
  );
}