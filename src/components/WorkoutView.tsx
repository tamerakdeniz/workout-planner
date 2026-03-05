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
  const [showResetAllConfirm, setShowResetAllConfirm] = useState(false);

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

  const handleResetAllConfirm = useCallback(() => {
    saveCompletions({});
    setShowResetAllConfirm(false);
  }, [saveCompletions]);

  const handleResetAllRequest = useCallback(() => {
    setShowResetAllConfirm(true);
  }, []);

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
            onResetAll={handleResetAllRequest}
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
          {showResetAllConfirm && (
            <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
              <div className="clip-card bg-bg-card border border-border max-w-sm w-full p-6 shadow-[0_0_40px_rgba(0,0,0,0.7)]">
                <h3 className="text-sm font-bold uppercase tracking-widest text-neon-red mb-2">
                  PROGRAMI SIFIRLA
                </h3>
                <p className="text-xs text-text-secondary mb-5">
                  Tüm günlerin ilerlemesini sıfırlamak istediğinizden emin
                  misiniz? Bu işlem geri alınamaz.
                </p>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowResetAllConfirm(false)}
                    className="clip-button bg-bg-card-hover border border-border text-[10px] font-bold uppercase tracking-widest px-4 py-2 text-text-secondary hover:text-text-primary hover:border-text-muted transition-all duration-300"
                  >
                    İPTAL
                  </button>
                  <button
                    type="button"
                    onClick={handleResetAllConfirm}
                    className="clip-button bg-neon-red border border-neon-red text-[10px] font-bold uppercase tracking-widest px-4 py-2 text-white hover:bg-neon-red-bright transition-all duration-300"
                  >
                    EVET, SIFIRLA
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
