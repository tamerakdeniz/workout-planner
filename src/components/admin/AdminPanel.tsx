"use client";

import { useState, useEffect, useCallback } from "react";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";
import {
  getAllDays,
  addExerciseToDay,
  updateExerciseInDay,
  deleteExerciseFromDay,
  updateDay,
  createDay,
  deleteDayDocument,
} from "@/lib/firestore";
import type { DayProgram, Exercise } from "@/types/workout";
import LoginForm from "./LoginForm";
import ExerciseForm from "./ExerciseForm";
import {
  LogOut,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  ChevronDown,
  ChevronUp,
  Settings,
  Home,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n";

export default function AdminPanel() {
  const router = useRouter();
  const { lang, t } = useLanguage();
  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [days, setDays] = useState<DayProgram[]>([]);
  const [selectedDay, setSelectedDay] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [expandedDays, setExpandedDays] = useState<Record<string, boolean>>({});
  const [editingDayMeta, setEditingDayMeta] = useState<string | null>(null);
  const [dayTitleTr, setDayTitleTr] = useState("");
  const [dayTitleEn, setDayTitleEn] = useState("");
  const [daySubtitleTr, setDaySubtitleTr] = useState("");
  const [daySubtitleEn, setDaySubtitleEn] = useState("");
  const [creatingDay, setCreatingDay] = useState(false);
  const [newDayNumber, setNewDayNumber] = useState<number | "">("");
  const [newDayTitleTr, setNewDayTitleTr] = useState("");
  const [newDayTitleEn, setNewDayTitleEn] = useState("");
  const [newDaySubtitleTr, setNewDaySubtitleTr] = useState("");
  const [newDaySubtitleEn, setNewDaySubtitleEn] = useState("");
  const [pendingDayDelete, setPendingDayDelete] = useState<DayProgram | null>(
    null
  );
  const [pendingExerciseDelete, setPendingExerciseDelete] = useState<{
    dayId: string;
    exercise: Exercise;
  } | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(getFirebaseAuth(), (u) => {
      setUser(u);
      setAuthChecked(true);
    });
    return () => unsub();
  }, []);

  const fetchDays = useCallback(
    async (options?: { preserveSelection?: boolean }) => {
      setLoading(true);
      const loadingToastId = toast.loading(t("admin.updatingData"));
      try {
        const data = await getAllDays();
        setDays(data);
      } catch {
        toast.error(t("admin.loadingError"));
      } finally {
        toast.dismiss(loadingToastId);
        setLoading(false);
      }
    },
    [t]
  );

  useEffect(() => {
    if (user) fetchDays();
  }, [user, fetchDays]);

  const handleLogout = async () => {
    await signOut(getFirebaseAuth());
    router.push("/");
  };

  const handleStartCreateDay = () => {
    const maxDayNumber =
      days.length > 0 ? Math.max(...days.map((d) => d.dayNumber)) : 0;
    setNewDayNumber(maxDayNumber + 1);
    setNewDayTitleTr("");
    setNewDayTitleEn("");
    setNewDaySubtitleTr("");
    setNewDaySubtitleEn("");
    setCreatingDay(true);
  };

  const handleCreateDay = async () => {
    if (!newDayNumber || !newDayTitleTr.trim()) {
      toast.error(t("admin.creatingDayError"));
      return;
    }

    try {
      const titleTr = newDayTitleTr.trim();
      const subtitleTr = newDaySubtitleTr.trim();
      const titleEn = newDayTitleEn.trim() || titleTr;
      const subtitleEn = newDaySubtitleEn.trim() || subtitleTr;

      const id = await createDay({
        dayNumber: newDayNumber,
        title: titleTr,
        subtitle: subtitleTr,
        title_tr: titleTr,
        title_en: titleEn,
        subtitle_tr: subtitleTr,
        subtitle_en: subtitleEn,
        exercises: [],
      });
      toast.success(t("admin.creatingDaySuccess"));
      setCreatingDay(false);
      setSelectedDay(id);
      setExpandedDays((prev) => ({ ...prev, [id]: true }));
      fetchDays({ preserveSelection: true });
    } catch {
      toast.error(t("admin.creatingDayFailed"));
    }
  };

  const handleDeleteDay = async () => {
    if (!pendingDayDelete) return;
    const dayId = pendingDayDelete.id;
    try {
      await deleteDayDocument(dayId);
      toast.success(t("admin.dayDeleted"));
      setExpandedDays((prev) => {
        const copy = { ...prev };
        delete copy[dayId];
        return copy;
      });
      if (selectedDay === dayId) {
        setSelectedDay("");
      }
      fetchDays({ preserveSelection: true });
      setPendingDayDelete(null);
    } catch {
      toast.error(t("admin.dayDeleteFailed"));
    }
  };

  const handleAddExercise = async (data: Omit<Exercise, "id">) => {
    if (!selectedDay) return;
    try {
      await addExerciseToDay(selectedDay, data);
      toast.success(t("admin.exerciseAdded"));
      setShowForm(false);
      fetchDays({ preserveSelection: true });
    } catch {
      toast.error(t("admin.exerciseAddFailed"));
    }
  };

  const handleUpdateExercise = async (data: Omit<Exercise, "id">) => {
    if (!selectedDay || !editingExercise) return;
    try {
      await updateExerciseInDay(selectedDay, editingExercise.id, data);
      toast.success(t("admin.exerciseUpdated"));
      setEditingExercise(null);
      setShowForm(false);
      fetchDays({ preserveSelection: true });
    } catch {
      toast.error(t("admin.exerciseUpdateFailed"));
    }
  };

  const handleDeleteExercise = async () => {
    if (!pendingExerciseDelete) return;
    const { dayId, exercise } = pendingExerciseDelete;
    try {
      await deleteExerciseFromDay(dayId, exercise.id);
      toast.success(t("admin.exerciseDeleted"));
      fetchDays({ preserveSelection: true });
      setPendingExerciseDelete(null);
    } catch {
      toast.error(t("admin.exerciseDeleteFailed"));
    }
  };

  const handleUpdateDayMeta = async (dayId: string) => {
    try {
      const titleTr = dayTitleTr;
      const subtitleTr = daySubtitleTr;
      const titleEn = dayTitleEn.trim() || titleTr;
      const subtitleEn = daySubtitleEn.trim() || subtitleTr;

      await updateDay(dayId, {
        title: titleTr,
        subtitle: subtitleTr,
        title_tr: titleTr,
        title_en: titleEn,
        subtitle_tr: subtitleTr,
        subtitle_en: subtitleEn,
      });
      toast.success(t("admin.dayMetaUpdated"));
      setEditingDayMeta(null);
      fetchDays({ preserveSelection: true });
    } catch {
      toast.error(t("admin.dayMetaUpdateFailed"));
    }
  };

  const toggleDayExpand = (dayId: string) => {
    setExpandedDays((prev) => ({ ...prev, [dayId]: !prev[dayId] }));
    setSelectedDay(dayId);
  };

  if (!authChecked) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <Loader2 size={40} className="animate-spin text-neon-red" />
      </div>
    );
  }

  if (!user) {
    return <LoginForm onSuccess={() => {}} />;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#141414",
            color: "#f5f5f5",
            border: "1px solid #2a2a2a",
          },
        }}
      />

      {/* Admin Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="clip-button bg-neon-red p-2.5">
            <Settings size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold uppercase tracking-wider">
              {t("admin.adminPanelTitle")}
            </h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-text-muted">
              {t("admin.adminPanelSubtitle")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push("/")}
            className="clip-button bg-bg-card border border-border px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:border-neon-red/60 transition-all duration-300 flex items-center gap-2 uppercase tracking-wider font-bold"
          >
            <Home size={16} />
            {t("admin.goHome")}
          </button>
          <button
            onClick={handleLogout}
            className="clip-button bg-bg-card border border-border px-4 py-2 text-sm text-text-secondary hover:text-neon-red hover:border-neon-red transition-all duration-300 flex items-center gap-2 uppercase tracking-wider font-bold"
          >
            <LogOut size={16} />
            {t("admin.logout")}
          </button>
        </div>
      </div>

      {/* Day management toolbar */}
      <div className="clip-card bg-bg-card border border-border mb-6 p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-text-muted">
            {t("admin.dayManagement")}
          </p>
          <p className="text-xs text-text-secondary">
            {t("admin.totalDaysPrefix")}{" "}
            <span className="font-semibold text-text-primary">
              {days.length}
            </span>{" "}
            {t("admin.totalDaysSuffix")}
          </p>
        </div>

        {creatingDay ? (
          <div className="w-full space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-[minmax(0,0.4fr)_minmax(0,1fr)] gap-2">
              <input
                type="number"
                value={newDayNumber === "" ? "" : newDayNumber}
                onChange={(e) =>
                  setNewDayNumber(
                    e.target.value === ""
                      ? ""
                      : parseInt(e.target.value, 10) || ""
                  )
                }
                className="clip-card-sm w-full bg-bg-input border border-border px-3 py-2 text-xs text-text-primary focus:border-neon-red focus:outline-none"
                placeholder="No"
                min={1}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  value={newDayTitleTr}
                  onChange={(e) => setNewDayTitleTr(e.target.value)}
                  className="clip-card-sm w-full bg-bg-input border border-border px-3 py-2 text-xs text-text-primary focus:border-neon-red focus:outline-none"
                  placeholder="Başlık (TR)"
                />
                <input
                  type="text"
                  value={newDayTitleEn}
                  onChange={(e) => setNewDayTitleEn(e.target.value)}
                  className="clip-card-sm w-full bg-bg-input border border-border px-3 py-2 text-xs text-text-primary focus:border-neon-red focus:outline-none"
                  placeholder="Title (EN)"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                value={newDaySubtitleTr}
                onChange={(e) => setNewDaySubtitleTr(e.target.value)}
                className="clip-card-sm w-full bg-bg-input border border-border px-3 py-2 text-xs text-text-primary focus:border-neon-red focus:outline-none"
                placeholder="Alt başlık (TR, opsiyonel)"
              />
              <input
                type="text"
                value={newDaySubtitleEn}
                onChange={(e) => setNewDaySubtitleEn(e.target.value)}
                className="clip-card-sm w-full bg-bg-input border border-border px-3 py-2 text-xs text-text-primary focus:border-neon-red focus:outline-none"
                placeholder="Subtitle (EN, optional)"
              />
            </div>
            <div className="flex flex-wrap gap-2 justify-end">
              <button
                onClick={handleCreateDay}
                className="clip-button bg-neon-red text-white text-[10px] font-bold uppercase tracking-widest px-4 py-2"
              >
                {t("admin.create")}
              </button>
              <button
                onClick={() => setCreatingDay(false)}
                className="clip-button bg-bg-card-hover border border-border text-[10px] font-bold uppercase tracking-widest px-4 py-2 text-text-secondary hover:text-text-primary"
              >
                {t("common.cancel")}
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={handleStartCreateDay}
            className="clip-button bg-bg-card-hover border border-dashed border-border px-4 py-2 text-[10px] uppercase tracking-widest font-bold text-text-muted hover:text-neon-red hover:border-neon-red transition-all duration-300 flex items-center gap-2 self-start sm:self-auto"
          >
            <Plus size={14} />
                {t("admin.newDay")}
          </button>
        )}
      </div>

      {loading && days.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-neon-red" />
        </div>
      ) : (
        <div className="space-y-4">
          {days.map((day) => (
            <div
              key={day.id}
              className="clip-card bg-bg-card border border-border"
            >
              {/* Day Header - Collapsible */}
              <button
                onClick={() => toggleDayExpand(day.id)}
                className="w-full flex items-center justify-between p-5 hover:bg-bg-card-hover transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="clip-button bg-neon-red text-white text-xs font-bold px-3 py-1.5 uppercase">
                    {t("workout.dayLabel")} {day.dayNumber}
                  </span>
                  <div className="text-left">
                    <h3 className="font-bold uppercase tracking-wider text-sm">
                      {lang === "tr"
                        ? day.title_tr || day.title
                        : day.title_en || day.title}
                    </h3>
                    <p className="text-[10px] uppercase tracking-widest text-text-muted">
                      {lang === "tr"
                        ? day.subtitle_tr || day.subtitle
                        : day.subtitle_en || day.subtitle}{" "}
                      • {day.exercises.length} {t("admin.exercisesCountSuffix")}
                    </p>
                  </div>
                </div>
                {expandedDays[day.id] ? (
                  <ChevronUp size={20} className="text-text-muted" />
                ) : (
                  <ChevronDown size={20} className="text-text-muted" />
                )}
              </button>

              {/* Expanded Content */}
              {expandedDays[day.id] && (
                <div className="border-t border-border p-5 space-y-4">
                  {/* Day Meta Edit */}
                  {editingDayMeta === day.id ? (
                    <div className="clip-card-sm bg-bg-primary border border-border p-4 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] uppercase tracking-widest text-text-muted mb-1">
                            {t("admin.dayTitleTrLabel")}
                          </label>
                          <input
                            value={dayTitleTr}
                            onChange={(e) => setDayTitleTr(e.target.value)}
                            className="clip-card-sm w-full bg-bg-input border border-border px-3 py-2 text-sm text-text-primary focus:border-neon-red focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase tracking-widest text-text-muted mb-1">
                            {t("admin.daySubtitleTrLabel")}
                          </label>
                          <input
                            value={daySubtitleTr}
                            onChange={(e) => setDaySubtitleTr(e.target.value)}
                            className="clip-card-sm w-full bg-bg-input border border-border px-3 py-2 text-sm text-text-primary focus:border-neon-red focus:outline-none"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] uppercase tracking-widest text-text-muted mb-1">
                            {t("admin.dayTitleEnLabel")}
                          </label>
                          <input
                            value={dayTitleEn}
                            onChange={(e) => setDayTitleEn(e.target.value)}
                            className="clip-card-sm w-full bg-bg-input border border-border px-3 py-2 text-sm text-text-primary focus:border-neon-red focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase tracking-widest text-text-muted mb-1">
                            {t("admin.daySubtitleEnLabel")}
                          </label>
                          <input
                            value={daySubtitleEn}
                            onChange={(e) => setDaySubtitleEn(e.target.value)}
                            className="clip-card-sm w-full bg-bg-input border border-border px-3 py-2 text-sm text-text-primary focus:border-neon-red focus:outline-none"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdateDayMeta(day.id)}
                          className="clip-button bg-neon-red text-white text-xs font-bold uppercase tracking-widest px-4 py-2"
                        >
                          {t("common.save")}
                        </button>
                        <button
                          onClick={() => setEditingDayMeta(null)}
                          className="clip-button bg-bg-card-hover border border-border text-text-secondary text-xs font-bold uppercase tracking-widest px-4 py-2"
                        >
                          {t("common.cancel")}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setEditingDayMeta(day.id);
                        setDayTitleTr(day.title_tr || day.title);
                        setDayTitleEn(day.title_en || "");
                        setDaySubtitleTr(day.subtitle_tr || day.subtitle);
                        setDaySubtitleEn(day.subtitle_en || "");
                      }}
                      className="text-[10px] uppercase tracking-widest text-text-muted hover:text-neon-red transition-colors flex items-center gap-1"
                    >
                      <Pencil size={10} /> {t("admin.editingDayInfo")}
                    </button>
                  )}

                  {/* Exercise List */}
                  <div className="space-y-2">
                    {day.exercises
                      .sort((a, b) => a.order - b.order)
                      .map((exercise) => (
                        <div
                          key={exercise.id}
                          className="clip-card-sm bg-bg-primary border border-border p-4 flex items-center justify-between group"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-text-muted font-mono">
                                #{exercise.order}
                              </span>
                              <h4 className="font-bold text-sm uppercase tracking-wider">
                                {lang === "tr"
                                  ? exercise.name_tr || exercise.name
                                  : exercise.name_en || exercise.name}
                              </h4>
                            </div>
                            <p className="text-[10px] uppercase tracking-widest text-text-muted mt-0.5">
                              {lang === "tr"
                                ? exercise.muscleGroup_tr || exercise.muscleGroup
                                : exercise.muscleGroup_en || exercise.muscleGroup}{" "}
                              • {exercise.sets} {t("exerciseCard.sets")} ×{" "}
                              {exercise.reps} {t("exerciseCard.reps")}
                              {exercise.youtubeVideoId &&
                                ` • ID: ${exercise.youtubeVideoId}`}
                            </p>
                          </div>
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => {
                                setSelectedDay(day.id);
                                setEditingExercise(exercise);
                                setShowForm(true);
                              }}
                              className="clip-button bg-bg-card-hover border border-border p-2 hover:border-neon-red hover:text-neon-red transition-colors"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedDay(day.id);
                                setPendingExerciseDelete({
                                  dayId: day.id,
                                  exercise,
                                });
                              }}
                              className="clip-button bg-bg-card-hover border border-border p-2 hover:border-neon-red hover:text-neon-red transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>

                  {/* Add / Edit Form */}
                  {showForm && selectedDay === day.id ? (
                    <ExerciseForm
                      exercise={editingExercise}
                      onSave={editingExercise ? handleUpdateExercise : handleAddExercise}
                      onCancel={() => {
                        setShowForm(false);
                        setEditingExercise(null);
                      }}
                      nextOrder={day.exercises.length + 1}
                    />
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedDay(day.id);
                        setEditingExercise(null);
                        setShowForm(true);
                      }}
                      className="clip-button bg-bg-card-hover border border-dashed border-border hover:border-neon-red text-text-muted hover:text-neon-red w-full py-3 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest transition-all duration-300"
                    >
                      <Plus size={16} />
                      {t("admin.addExercise")}
                    </button>
                  )}
                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => setPendingDayDelete(day)}
                      className="clip-button bg-bg-card-hover border border-neon-red/60 text-[10px] font-bold uppercase tracking-widest px-4 py-2 text-neon-red hover:bg-neon-red hover:text-white hover:border-neon-red transition-all duration-300"
                    >
                      {t("admin.deleteDay")}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Confirm delete day modal */}
      {pendingDayDelete && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className="clip-card bg-bg-card border border-border max-w-sm w-full p-6 shadow-[0_0_40px_rgba(0,0,0,0.7)]">
            <h3 className="text-sm font-bold uppercase tracking-widest text-neon-red mb-2">
              {t("admin.confirmDeleteDayTitle")}
            </h3>
            <p className="text-xs text-text-secondary mb-4">
              {t("admin.confirmDeleteDayBodyPrefix")}{" "}
              {pendingDayDelete.dayNumber} - "
              <span className="text-text-primary">
                {pendingDayDelete.title}
              </span>
              " {t("admin.confirmDeleteDayBodyMiddle")}
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setPendingDayDelete(null)}
                className="clip-button bg-bg-card-hover border border-border text-[10px] font-bold uppercase tracking-widest px-4 py-2 text-text-secondary hover:text-text-primary hover:border-text-muted transition-all duration-300"
              >
                {t("common.cancel")}
              </button>
              <button
                type="button"
                onClick={handleDeleteDay}
                className="clip-button bg-neon-red border border-neon-red text-[10px] font-bold uppercase tracking-widest px-4 py-2 text-white hover:bg-neon-red-bright transition-all duration-300"
              >
                {t("common.yesDelete")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm delete exercise modal */}
      {pendingExerciseDelete && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className="clip-card bg-bg-card border border-border max-w-sm w-full p-6 shadow-[0_0_40px_rgba(0,0,0,0.7)]">
            <h3 className="text-sm font-bold uppercase tracking-widest text-neon-red mb-2">
              {t("admin.confirmDeleteExerciseTitle")}
            </h3>
            <p className="text-xs text-text-secondary mb-1">
              {t("admin.confirmDeleteExerciseBody")}
            </p>
            <p className="text-xs text-text-primary font-semibold mb-4">
              {pendingExerciseDelete.exercise.name} •{" "}
              {pendingExerciseDelete.exercise.muscleGroup}
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setPendingExerciseDelete(null)}
                className="clip-button bg-bg-card-hover border border-border text-[10px] font-bold uppercase tracking-widest px-4 py-2 text-text-secondary hover:text-text-primary hover:border-text-muted transition-all duration-300"
              >
                {t("common.cancel")}
              </button>
              <button
                type="button"
                onClick={handleDeleteExercise}
                className="clip-button bg-neon-red border border-neon-red text-[10px] font-bold uppercase tracking-widest px-4 py-2 text-white hover:bg-neon-red-bright transition-all duration-300"
              >
                {t("common.yesDelete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
