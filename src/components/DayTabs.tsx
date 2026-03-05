"use client";

import type { DayProgram } from "@/types/workout";
import { useLanguage } from "@/lib/i18n";

interface DayTabsProps {
  days: DayProgram[];
  activeDay: number;
  onDayChange: (dayNumber: number) => void;
}

const DAY_LABELS: Record<number, string> = {
  1: "GÜN 1",
  2: "GÜN 2",
  3: "GÜN 3",
  4: "GÜN 4",
  5: "GÜN 5",
};

export default function DayTabs({ days, activeDay, onDayChange }: DayTabsProps) {
  const { lang, t } = useLanguage();

  return (
    <div className="flex gap-1 sm:gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {days.map((day) => {
        const isActive = day.dayNumber === activeDay;
        return (
          <button
            key={day.dayNumber}
            onClick={() => onDayChange(day.dayNumber)}
            className={`
              clip-tab relative px-4 sm:px-6 py-3 sm:py-4 min-w-[80px] sm:min-w-[100px]
              uppercase font-bold text-xs sm:text-sm tracking-widest
              transition-all duration-300 whitespace-nowrap
              ${
                isActive
                  ? "bg-neon-red text-white shadow-[0_0_20px_rgba(220,38,38,0.4)]"
                  : "bg-bg-card text-text-secondary hover:bg-bg-card-hover hover:text-text-primary border border-border"
              }
            `}
          >
            <span className="relative z-10">
              {lang === "tr"
                ? DAY_LABELS[day.dayNumber] ||
                  `${t("workout.dayLabel")} ${day.dayNumber}`
                : `${t("workout.dayLabel")} ${day.dayNumber}`}
            </span>
            {isActive && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-neon-red-bright" />
            )}
          </button>
        );
      })}
    </div>
  );
}
