"use client";

import { useState, useEffect, useCallback } from "react";
import DayTabs from "./DayTabs";
import DayHeader from "./DayHeader";
import ExerciseCard from "./ExerciseCard";
import { getAllDays } from "@/lib/firestore";
import type { DayProgram, CompletionStatus } from "@/types/workout";
import { Loader2 } from "lucide-react";

export default function WorkoutView() {
  const [days, setDays] = useState<DayProgram[]>([]);
  const [activeDay, setActiveDay] = useState(1);
  const [completions, setCompletions] = useState<Record<number, CompletionStatus>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDays() {
      try {
        const data = await getAllDays();
        setDays(data);

        const saved = localStorage.getItem("gym-completions");
        if (saved) {
          setCompletions(JSON.parse(saved));
        }
      } catch (err) {
        console.error("Failed to fetch days:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDays();
  }, []);

  const saveCompletions = useCallback(
    (updated: Record<number, CompletionStatus>) => {
      setCompletions(updated);
      localStorage.setItem("gym-completions", JSON.stringify(updated));
    },
    []
  );

  const handleToggleComplete = useCallback(
    (exerciseId: string) => {
      const dayCompletions = completions[activeDay] || {};
      const updated = {
        ...completions,
        [activeDay]: {
          ...dayCompletions,
          [exerciseId]: !dayCompletions[exerciseId],
        },
      };
      saveCompletions(updated);
    },
    [completions, activeDay, saveCompletions]
  );

  const currentDay = days.find((d) => d.dayNumber === activeDay);
  const dayCompletions = completions[activeDay] || {};
  const completedCount = currentDay
    ? currentDay.exercises.filter((ex) => dayCompletions[ex.id]).length
    : 0;

  const handleResetCurrentDay = useCallback(() => {
    const updated = { ...completions };
    delete updated[activeDay];
    saveCompletions(updated);
  }, [completions, activeDay, saveCompletions]);

  const handleResetAllDays = useCallback(() => {
    const confirmed = window.confirm(
      "Tüm günlerin ilerlemesini sıfırlamak istediğinizden emin misiniz? Bu işlem geri alınamaz."
    );
    if (!confirmed) return;
    saveCompletions({});
  }, [saveCompletions]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={40} className="animate-spin text-neon-red" />
          <p className="text-xs uppercase tracking-widest text-text-muted">
            PROGRAM YÜKLENİYOR
          </p>
        </div>
      </div>
    );
  }

  if (days.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="clip-card bg-bg-card border border-border p-8 text-center max-w-md">
          <p className="text-lg font-bold uppercase tracking-wider text-text-primary mb-2">
            PROGRAM BULUNAMADI
          </p>
          <p className="text-sm text-text-secondary">
            Firestore&apos;da henüz antrenman verisi yok. Admin panelinden veya
            seed script ile veri ekleyin.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <DayTabs days={days} activeDay={activeDay} onDayChange={setActiveDay} />
      </div>

      {currentDay && (
        <>
          <DayHeader
            day={currentDay}
            completedCount={completedCount}
            totalCount={currentDay.exercises.length}
            onResetDay={handleResetCurrentDay}
            onResetAll={handleResetAllDays}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
            {currentDay.exercises
              .sort((a, b) => a.order - b.order)
              .map((exercise) => (
                <ExerciseCard
                  key={exercise.id}
                  exercise={exercise}
                  isCompleted={!!dayCompletions[exercise.id]}
                  onToggleComplete={handleToggleComplete}
                />
              ))}
          </div>
        </>
      )}
    </div>
  );
}
