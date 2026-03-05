"use client";

import Link from "next/link";
import { Flame, Languages } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

export default function Header() {
  const { lang, setLang, t } = useLanguage();

  return (
    <header className="border-b border-border bg-bg-primary/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="clip-button bg-neon-red p-2 group-hover:shadow-[0_0_15px_rgba(220,38,38,0.5)] transition-all duration-300">
            <Flame size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold uppercase tracking-[0.15em] text-text-primary">
              {t("header.titleMain")}
            </h1>
            <p className="text-[9px] uppercase tracking-[0.3em] text-text-muted -mt-0.5">
              {t("header.titleSub")}
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right mr-2">
            <p className="text-[10px] uppercase tracking-widest text-text-muted">
              {t("header.flexibleCycle")}
            </p>
          </div>

          <div className="clip-button bg-bg-card-hover border border-border px-3 py-1.5 flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-text-secondary hover:text-neon-red hover:border-neon-red transition-all duration-300">
            <Languages size={14} className="text-text-muted" />
            <button
              type="button"
              onClick={() => setLang("tr")}
              className={`px-1 transition-colors duration-200 cursor-pointer ${
                lang === "tr"
                  ? "text-neon-red"
                  : "text-text-secondary hover:text-neon-red"
              }`}
            >
              TR
            </button>
            <span className="text-text-muted">/</span>
            <button
              type="button"
              onClick={() => setLang("en")}
              className={`px-1 transition-colors duration-200 cursor-pointer ${
                lang === "en"
                  ? "text-neon-red"
                  : "text-text-secondary hover:text-neon-red"
              }`}
            >
              EN
            </button>
          </div>

          <Link
            href="/admin"
            className="clip-button bg-bg-card-hover border border-border px-3 py-1.5 text-[10px] uppercase tracking-widest font-bold text-text-secondary hover:text-neon-red hover:border-neon-red transition-all duration-300"
          >
            {t("header.adminPanel")}
          </Link>
        </div>
      </div>
    </header>
  );
}
