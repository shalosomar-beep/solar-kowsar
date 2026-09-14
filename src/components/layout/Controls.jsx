import React from "react";
import { Globe, Sun, Moon, Check } from "lucide-react";
import { useT } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

const languages = [
  { code: "so", label: "Soomaali" },
  { code: "en", label: "English" },
  { code: "ar", label: "العربية" },
];

export default function Controls() {
  const { lang, setLang, t } = useT();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="inline-flex items-center gap-1.5 px-2.5 py-2 rounded-lg bg-card hover:bg-accent border border-border text-foreground text-xs font-semibold transition-colors"
            title={t("controls.language")}
          >
            <Globe className="w-3.5 h-3.5" />
            <span className="hidden sm:inline uppercase">{lang}</span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          {languages.map((l) => (
            <DropdownMenuItem
              key={l.code}
              onClick={() => setLang(l.code)}
              className="flex items-center justify-between cursor-pointer"
            >
              <span>{l.label}</span>
              {lang === l.code && <Check className="w-3.5 h-3.5 text-emerald-400" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <button
        onClick={toggleTheme}
        className="inline-flex items-center justify-center p-2 rounded-lg bg-card hover:bg-accent border border-border text-foreground transition-colors"
        title={theme === "dark" ? "Light" : "Dark"}
      >
        {theme === "dark" ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
}