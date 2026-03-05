"use client";

import { useState, useEffect } from "react";
import { Save, X } from "lucide-react";
import type { Exercise } from "@/types/workout";
import { useLanguage } from "@/lib/i18n";

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
  const [nameTr, setNameTr] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [muscleGroupTr, setMuscleGroupTr] = useState("");
  const [muscleGroupEn, setMuscleGroupEn] = useState("");
  const [sets, setSets] = useState(3);
  const [reps, setReps] = useState("12");
  const [youtubeVideoId, setYoutubeVideoId] = useState("");
  const [order, setOrder] = useState(nextOrder);
  const [noteTr, setNoteTr] = useState("");
  const [noteEn, setNoteEn] = useState("");
  const { t } = useLanguage();

  useEffect(() => {
    if (exercise) {
      setNameTr(exercise.name_tr || exercise.name);
      setNameEn(exercise.name_en || exercise.name);
      setMuscleGroupTr(exercise.muscleGroup_tr || exercise.muscleGroup);
      setMuscleGroupEn(exercise.muscleGroup_en || exercise.muscleGroup);
      setSets(exercise.sets);
      setReps(exercise.reps);
      setYoutubeVideoId(exercise.youtubeVideoId);
      setOrder(exercise.order);
      setNoteTr(exercise.note_tr ?? "");
      setNoteEn(exercise.note_en ?? "");
    }
  }, [exercise]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const safeNameTr = nameTr.trim();
    const safeMuscleGroupTr = muscleGroupTr.trim();

    onSave({
      name: safeNameTr,
      muscleGroup: safeMuscleGroupTr,
      name_tr: safeNameTr,
      name_en: nameEn.trim() || safeNameTr,
      muscleGroup_tr: safeMuscleGroupTr,
      muscleGroup_en: muscleGroupEn.trim() || safeMuscleGroupTr,
      sets,
      reps,
      youtubeVideoId,
      order,
      note_tr: noteTr.trim() || undefined,
      note_en: noteEn.trim() || undefined,
    });
  };

  return (
    <div className="clip-card bg-bg-card border border-neon-red/30 p-6">
      <h3 className="text-sm font-bold uppercase tracking-widest text-neon-red mb-5">
        {exercise
          ? t("adminExerciseForm.editTitle")
          : t("adminExerciseForm.newTitle")}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-text-muted mb-1.5">
              {t("adminExerciseForm.nameTr")}
            </label>
            <input
              type="text"
              value={nameTr}
              onChange={(e) => setNameTr(e.target.value)}
              className="clip-card-sm w-full bg-bg-input border border-border px-3 py-2.5 text-sm text-text-primary focus:border-neon-red focus:outline-none transition-colors"
              placeholder="Barbell Row"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-widest text-text-muted mb-1.5">
              {t("adminExerciseForm.nameEn")}
            </label>
            <input
              type="text"
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              className="clip-card-sm w-full bg-bg-input border border-border px-3 py-2.5 text-sm text-text-primary focus:border-neon-red focus:outline-none transition-colors"
              placeholder="Barbell Row"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-widest text-text-muted mb-1.5">
              {t("adminExerciseForm.muscleGroupTr")}
            </label>
            <input
              type="text"
              value={muscleGroupTr}
              onChange={(e) => setMuscleGroupTr(e.target.value)}
              className="clip-card-sm w-full bg-bg-input border border-border px-3 py-2.5 text-sm text-text-primary focus:border-neon-red focus:outline-none transition-colors"
              placeholder="Sırt"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-widest text-text-muted mb-1.5">
              {t("adminExerciseForm.muscleGroupEn")}
            </label>
            <input
              type="text"
              value={muscleGroupEn}
              onChange={(e) => setMuscleGroupEn(e.target.value)}
              className="clip-card-sm w-full bg-bg-input border border-border px-3 py-2.5 text-sm text-text-primary focus:border-neon-red focus:outline-none transition-colors"
              placeholder="Back"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-widest text-text-muted mb-1.5">
              {t("adminExerciseForm.sets")}
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
              {t("adminExerciseForm.reps")}
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
              {t("adminExerciseForm.youtubeId")}
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
              {t("adminExerciseForm.order")}
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-text-muted mb-1.5">
              {t("adminExerciseForm.noteTr")}
            </label>
            <textarea
              value={noteTr}
              onChange={(e) => setNoteTr(e.target.value)}
              className="clip-card-sm w-full bg-bg-input border border-border px-3 py-2.5 text-sm text-text-primary focus:border-neon-red focus:outline-none transition-colors min-h-[80px] resize-y"
              placeholder="Türkçe not..."
              rows={3}
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-text-muted mb-1.5">
              {t("adminExerciseForm.noteEn")}
            </label>
            <textarea
              value={noteEn}
              onChange={(e) => setNoteEn(e.target.value)}
              className="clip-card-sm w-full bg-bg-input border border-border px-3 py-2.5 text-sm text-text-primary focus:border-neon-red focus:outline-none transition-colors min-h-[80px] resize-y"
              placeholder="English note..."
              rows={3}
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="clip-button bg-neon-red hover:bg-neon-red-bright text-white font-bold uppercase tracking-widest px-6 py-2.5 text-sm transition-all duration-300 flex items-center gap-2"
          >
            <Save size={16} />
            {t("adminExerciseForm.save")}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="clip-button bg-bg-card-hover border border-border text-text-secondary hover:text-text-primary font-bold uppercase tracking-widest px-6 py-2.5 text-sm transition-all duration-300 flex items-center gap-2"
          >
            <X size={16} />
            {t("adminExerciseForm.cancel")}
          </button>
        </div>
      </form>
    </div>
  );
}
