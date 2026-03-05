"use client";

import {
  Dumbbell,
  Home,
  Heart,
  Zap,
  Target,
  Flame,
  Swords,
  StretchHorizontal,
  ChevronRight,
} from "lucide-react";
import type { Program, ProgramIcon, ProgramColor } from "@/types/workout";
import { useLanguage } from "@/lib/i18n";

const ICON_MAP: Record<ProgramIcon, React.ReactNode> = {
  dumbbell: <Dumbbell size={28} />,
  home: <Home size={28} />,
  stretch: <StretchHorizontal size={28} />,
  heart: <Heart size={28} />,
  zap: <Zap size={28} />,
  target: <Target size={28} />,
  flame: <Flame size={28} />,
  swords: <Swords size={28} />,
};

const COLOR_MAP: Record<ProgramColor, { bg: string; text: string; border: string; glow: string }> = {
  red: { bg: "bg-red-600", text: "text-red-500", border: "border-red-600/50", glow: "shadow-[0_0_25px_rgba(220,38,38,0.3)]" },
  blue: { bg: "bg-blue-600", text: "text-blue-500", border: "border-blue-600/50", glow: "shadow-[0_0_25px_rgba(37,99,235,0.3)]" },
  green: { bg: "bg-emerald-600", text: "text-emerald-500", border: "border-emerald-600/50", glow: "shadow-[0_0_25px_rgba(5,150,105,0.3)]" },
  purple: { bg: "bg-purple-600", text: "text-purple-500", border: "border-purple-600/50", glow: "shadow-[0_0_25px_rgba(147,51,234,0.3)]" },
  orange: { bg: "bg-orange-600", text: "text-orange-500", border: "border-orange-600/50", glow: "shadow-[0_0_25px_rgba(234,88,12,0.3)]" },
  cyan: { bg: "bg-cyan-600", text: "text-cyan-500", border: "border-cyan-600/50", glow: "shadow-[0_0_25px_rgba(8,145,178,0.3)]" },
  pink: { bg: "bg-pink-600", text: "text-pink-500", border: "border-pink-600/50", glow: "shadow-[0_0_25px_rgba(219,39,119,0.3)]" },
  yellow: { bg: "bg-yellow-500", text: "text-yellow-500", border: "border-yellow-500/50", glow: "shadow-[0_0_25px_rgba(234,179,8,0.3)]" },
};

interface ProgramSelectorProps {
  programs: Program[];
  dayCounts: Record<string, number>;
  onSelect: (programId: string) => void;
}

export default function ProgramSelector({ programs, dayCounts, onSelect }: ProgramSelectorProps) {
  const { lang, t } = useLanguage();

  if (programs.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="clip-card bg-bg-card border border-border p-8 text-center max-w-md">
          <p className="text-lg font-bold uppercase tracking-wider text-text-primary mb-2">
            {t("workout.emptyTitle")}
          </p>
          <p className="text-sm text-text-secondary">
            {t("programs.empty")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold uppercase tracking-wider text-text-primary">
          {t("programs.title")}
        </h2>
        <p className="text-xs uppercase tracking-[0.3em] text-text-muted mt-1">
          {t("programs.subtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {programs.map((program) => {
          const colors = COLOR_MAP[program.color] || COLOR_MAP.red;
          const icon = ICON_MAP[program.icon] || ICON_MAP.dumbbell;
          const count = dayCounts[program.id] || 0;

          const displayName =
            lang === "tr"
              ? program.name_tr || program.name
              : program.name_en || program.name;

          const displayDesc =
            lang === "tr"
              ? program.description_tr || program.description || ""
              : program.description_en || program.description || "";

          const isActive = program.isActive !== false;

          return (
            <button
              key={program.id}
              onClick={() => onSelect(program.id)}
              className={`clip-card bg-bg-card border ${colors.border} p-6 text-left group
                hover:border-opacity-100 transition-all duration-300
                hover:bg-bg-card-hover cursor-pointer
                ${!isActive ? "opacity-50 grayscale" : ""}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`clip-button ${colors.bg} p-3 transition-all duration-300 group-hover:scale-110`}>
                  <span className="text-white">{icon}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`clip-card-sm px-2 py-1 border ${
                    isActive
                      ? "bg-poison-green/10 border-poison-green/40"
                      : "bg-bg-card-hover border-border"
                  }`}>
                    <div className="flex items-center gap-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        isActive ? "bg-poison-green shadow-[0_0_6px_rgba(34,197,94,0.6)]" : "bg-text-muted"
                      }`} />
                      <span className={`text-[9px] uppercase tracking-widest font-bold ${
                        isActive ? "text-poison-green" : "text-text-muted"
                      }`}>
                        {isActive ? t("programs.active") : t("programs.inactive")}
                      </span>
                    </div>
                  </div>
                  <ChevronRight
                    size={20}
                    className="text-text-muted group-hover:text-text-primary group-hover:translate-x-1 transition-all duration-300"
                  />
                </div>
              </div>

              <h3 className="text-lg font-bold uppercase tracking-wider text-text-primary mb-1 group-hover:text-white transition-colors">
                {displayName}
              </h3>

              {displayDesc && (
                <p className="text-xs text-text-secondary mb-3 line-clamp-2">
                  {displayDesc}
                </p>
              )}

              <div className="flex items-center gap-2 mt-auto">
                <span className={`text-[10px] uppercase tracking-widest font-bold ${colors.text}`}>
                  {count} {t("programs.days")}
                </span>
              </div>

              <div className={`h-[2px] mt-4 ${colors.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

export { ICON_MAP, COLOR_MAP };
