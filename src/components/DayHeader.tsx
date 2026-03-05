"use client";

import { Target, Zap, Heart, Swords, Bomb } from "lucide-react";
import type { DayProgram } from "@/types/workout";
import { useLanguage } from "@/lib/i18n";

const DAY_ICONS: Record<number, React.ReactNode> = {
  1: <Target size={20} />,
  2: <Zap size={20} />,
  3: <Heart size={20} />,
  4: <Swords size={20} />,
  5: <Bomb size={20} />,
};

interface DayHeaderProps {
  day: DayProgram;
  completedCount: number;
  totalCount: number;
  onResetDay: () => void;
  onResetAll: () => void;
}

export default function DayHeader({
  day,
  completedCount,
  totalCount,
  onResetDay,
  onResetAll,
}: DayHeaderProps) {
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const allDone = completedCount === totalCount && totalCount > 0;

  const { lang, t } = useLanguage();

  const displayTitle =
    lang === "tr"
      ? day.title_tr || day.title
      : day.title_en || day.title;

  const displaySubtitle =
    lang === "tr"
      ? day.subtitle_tr || day.subtitle
      : day.subtitle_en || day.subtitle;

  return (
    <div className="clip-card bg-bg-card border border-border p-6 mb-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`clip-button p-2.5 ${allDone ? "bg-poison-green" : "bg-neon-red"} transition-colors duration-500`}
          >
            <span className="text-white">
              {DAY_ICONS[day.dayNumber] || <Zap size={20} />}
            </span>
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-wider text-text-primary">
              {displayTitle}
            </h2>
            <p className="text-xs uppercase tracking-[0.2em] text-text-muted mt-0.5">
              {displaySubtitle}
            </p>
          </div>
        </div>

        <div className="text-right">
          <div
            className={`text-2xl font-bold ${allDone ? "text-poison-green" : "text-text-primary"}`}
          >
            {completedCount}/{totalCount}
          </div>
          <p className="text-[10px] uppercase tracking-widest text-text-muted">
            {t("workout.completedLabel")}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative h-1.5 bg-bg-primary rounded-full overflow-hidden">
        <div
          className={`absolute left-0 top-0 h-full transition-all duration-700 ease-out rounded-full
            ${allDone ? "bg-poison-green shadow-[0_0_10px_rgba(34,197,94,0.5)]" : "bg-neon-red shadow-[0_0_10px_rgba(220,38,38,0.5)]"}
          `}
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onResetDay}
            className="clip-button bg-bg-card-hover border border-border text-[10px] font-bold uppercase tracking-widest px-4 py-2 text-text-secondary hover:text-neon-red hover:border-neon-red transition-all duration-300"
          >
            {t("workout.resetDay")}
          </button>
          <button
            type="button"
            onClick={onResetAll}
            className="clip-button bg-bg-card-hover border border-neon-red/50 text-[10px] font-bold uppercase tracking-widest px-4 py-2 text-neon-red hover:bg-neon-red hover:text-white hover:border-neon-red transition-all duration-300"
          >
            {t("workout.resetProgram")}
          </button>
        </div>

        {allDone && (
          <span className="text-[10px] uppercase tracking-widest text-poison-green">
            {t("workout.allDoneBadge")}
          </span>
        )}
      </div>
    </div>
  );
}
