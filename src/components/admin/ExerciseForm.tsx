"use client";

import { useState, useEffect } from "react";
import { Save, X } from "lucide-react";
import type { Exercise } from "@/types/workout";

interface ExerciseFormProps {
  exercise?: Exercise | null;
  onSave: (data: Omit<Exercise, "id">) => void;
  onCancel: () => void;
  nextOrder: number;
}

export default function ExerciseForm({
  exercise,
  onSave,
  onCancel,
  nextOrder,
}: ExerciseFormProps) {
  const [name, setName] = useState("");
  const [muscleGroup, setMuscleGroup] = useState("");
  const [sets, setSets] = useState(3);
  const [reps, setReps] = useState("12");
  const [youtubeVideoId, setYoutubeVideoId] = useState("");
  const [order, setOrder] = useState(nextOrder);

  useEffect(() => {
    if (exercise) {
      setName(exercise.name);
      setMuscleGroup(exercise.muscleGroup);
      setSets(exercise.sets);
      setReps(exercise.reps);
      setYoutubeVideoId(exercise.youtubeVideoId);
      setOrder(exercise.order);
    }
  }, [exercise]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name, muscleGroup, sets, reps, youtubeVideoId, order });
  };

  return (
    <div className="clip-card bg-bg-card border border-neon-red/30 p-6">
      <h3 className="text-sm font-bold uppercase tracking-widest text-neon-red mb-5">
        {exercise ? "EGZERSİZİ DÜZENLE" : "YENİ EGZERSİZ EKLE"}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-text-muted mb-1.5">
              EGZERSİZ ADI
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="clip-card-sm w-full bg-bg-input border border-border px-3 py-2.5 text-sm text-text-primary focus:border-neon-red focus:outline-none transition-colors"
              placeholder="Barbell Row"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-widest text-text-muted mb-1.5">
              KAS GRUBU
            </label>
            <input
              type="text"
              value={muscleGroup}
              onChange={(e) => setMuscleGroup(e.target.value)}
              className="clip-card-sm w-full bg-bg-input border border-border px-3 py-2.5 text-sm text-text-primary focus:border-neon-red focus:outline-none transition-colors"
              placeholder="Sırt"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-widest text-text-muted mb-1.5">
              SET SAYISI
            </label>
            <input
              type="number"
              value={sets}
              onChange={(e) => setSets(parseInt(e.target.value) || 0)}
              className="clip-card-sm w-full bg-bg-input border border-border px-3 py-2.5 text-sm text-text-primary focus:border-neon-red focus:outline-none transition-colors"
              min={1}
              required
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-widest text-text-muted mb-1.5">
              TEKRAR
            </label>
            <input
              type="text"
              value={reps}
              onChange={(e) => setReps(e.target.value)}
              className="clip-card-sm w-full bg-bg-input border border-border px-3 py-2.5 text-sm text-text-primary focus:border-neon-red focus:outline-none transition-colors"
              placeholder="8-12"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-widest text-text-muted mb-1.5">
              YOUTUBE VİDEO ID
            </label>
            <input
              type="text"
              value={youtubeVideoId}
              onChange={(e) => setYoutubeVideoId(e.target.value)}
              className="clip-card-sm w-full bg-bg-input border border-border px-3 py-2.5 text-sm text-text-primary focus:border-neon-red focus:outline-none transition-colors"
              placeholder="dQw4w9WgXcQ"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-widest text-text-muted mb-1.5">
              SIRA
            </label>
            <input
              type="number"
              value={order}
              onChange={(e) => setOrder(parseInt(e.target.value) || 0)}
              className="clip-card-sm w-full bg-bg-input border border-border px-3 py-2.5 text-sm text-text-primary focus:border-neon-red focus:outline-none transition-colors"
              min={0}
              required
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="clip-button bg-neon-red hover:bg-neon-red-bright text-white font-bold uppercase tracking-widest px-6 py-2.5 text-sm transition-all duration-300 flex items-center gap-2"
          >
            <Save size={16} />
            KAYDET
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="clip-button bg-bg-card-hover border border-border text-text-secondary hover:text-text-primary font-bold uppercase tracking-widest px-6 py-2.5 text-sm transition-all duration-300 flex items-center gap-2"
          >
            <X size={16} />
            İPTAL
          </button>
        </div>
      </form>
    </div>
  );
}
