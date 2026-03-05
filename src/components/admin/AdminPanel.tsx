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

export default function AdminPanel() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [days, setDays] = useState<DayProgram[]>([]);
  const [selectedDay, setSelectedDay] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [expandedDays, setExpandedDays] = useState<Record<string, boolean>>({});
  const [editingDayMeta, setEditingDayMeta] = useState<string | null>(null);
  const [dayTitle, setDayTitle] = useState("");
  const [daySubtitle, setDaySubtitle] = useState("");
  const [creatingDay, setCreatingDay] = useState(false);
  const [newDayNumber, setNewDayNumber] = useState<number | "">("");
  const [newDayTitle, setNewDayTitle] = useState("");
  const [newDaySubtitle, setNewDaySubtitle] = useState("");
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
      try {
        const data = await getAllDays();
        setDays(data);

        if (!options?.preserveSelection && data.length > 0) {
          setSelectedDay((prev) => prev || data[0].id);
          setExpandedDays((prev) =>
            Object.keys(prev).length ? prev : { [data[0].id]: true }
          );
        }
      } catch {
        toast.error("Veriler yüklenemedi.");
      } finally {
        setLoading(false);
      }
    },
    []
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
    setNewDayTitle("");
    setNewDaySubtitle("");
    setCreatingDay(true);
  };

  const handleCreateDay = async () => {
    if (!newDayNumber || !newDayTitle.trim()) {
      toast.error("Gün numarası ve başlık zorunludur.");
      return;
    }

    try {
      const id = await createDay({
        dayNumber: newDayNumber,
        title: newDayTitle.trim(),
        subtitle: newDaySubtitle.trim(),
        exercises: [],
      });
      toast.success("Yeni gün oluşturuldu!");
      setCreatingDay(false);
      setSelectedDay(id);
      setExpandedDays((prev) => ({ ...prev, [id]: true }));
      fetchDays({ preserveSelection: true });
    } catch {
      toast.error("Gün oluşturulurken hata oluştu.");
    }
  };

  const handleDeleteDay = async () => {
    if (!pendingDayDelete) return;
    const dayId = pendingDayDelete.id;
    try {
      await deleteDayDocument(dayId);
      toast.success("Gün silindi!");
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
      toast.error("Gün silinirken hata oluştu.");
    }
  };

  const handleAddExercise = async (data: Omit<Exercise, "id">) => {
    if (!selectedDay) return;
    try {
      await addExerciseToDay(selectedDay, data);
      toast.success("Egzersiz eklendi!");
      setShowForm(false);
      fetchDays({ preserveSelection: true });
    } catch {
      toast.error("Egzersiz eklenirken hata oluştu.");
    }
  };

  const handleUpdateExercise = async (data: Omit<Exercise, "id">) => {
    if (!selectedDay || !editingExercise) return;
    try {
      await updateExerciseInDay(selectedDay, editingExercise.id, data);
      toast.success("Egzersiz güncellendi!");
      setEditingExercise(null);
      setShowForm(false);
      fetchDays({ preserveSelection: true });
    } catch {
      toast.error("Güncelleme sırasında hata oluştu.");
    }
  };

  const handleDeleteExercise = async () => {
    if (!pendingExerciseDelete) return;
    const { dayId, exercise } = pendingExerciseDelete;
    try {
      await deleteExerciseFromDay(dayId, exercise.id);
      toast.success("Egzersiz silindi!");
      fetchDays({ preserveSelection: true });
      setPendingExerciseDelete(null);
    } catch {
      toast.error("Silme sırasında hata oluştu.");
    }
  };

  const handleUpdateDayMeta = async (dayId: string) => {
    try {
      await updateDay(dayId, { title: dayTitle, subtitle: daySubtitle });
      toast.success("Gün bilgileri güncellendi!");
      setEditingDayMeta(null);
      fetchDays({ preserveSelection: true });
    } catch {
      toast.error("Güncelleme başarısız.");
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

      {loading && days.length > 0 && (
        <div className="mb-3 text-[10px] uppercase tracking-widest text-text-muted flex items-center gap-2">
          <div className="w-3 h-3 border border-border border-t-neon-red rounded-full animate-spin" />
          <span>Veriler güncelleniyor…</span>
        </div>
      )}

      {/* Admin Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="clip-button bg-neon-red p-2.5">
            <Settings size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold uppercase tracking-wider">
              ADMİN PANELİ
            </h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-text-muted">
              ANTRENMAN YÖNETİMİ
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push("/")}
            className="clip-button bg-bg-card border border-border px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:border-neon-red/60 transition-all duration-300 flex items-center gap-2 uppercase tracking-wider font-bold"
          >
            <Home size={16} />
            ANA SAYFA
          </button>
          <button
            onClick={handleLogout}
            className="clip-button bg-bg-card border border-border px-4 py-2 text-sm text-text-secondary hover:text-neon-red hover:border-neon-red transition-all duration-300 flex items-center gap-2 uppercase tracking-wider font-bold"
          >
            <LogOut size={16} />
            ÇIKIŞ
          </button>
        </div>
      </div>

      {/* Day management toolbar */}
      <div className="clip-card bg-bg-card border border-border mb-6 p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-text-muted">
            GÜN YÖNETİMİ
          </p>
          <p className="text-xs text-text-secondary">
            Toplam{" "}
            <span className="font-semibold text-text-primary">
              {days.length}
            </span>{" "}
            gün tanımlı.
          </p>
        </div>

        {creatingDay ? (
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            <input
              type="number"
              value={newDayNumber === "" ? "" : newDayNumber}
              onChange={(e) =>
                setNewDayNumber(
                  e.target.value === "" ? "" : parseInt(e.target.value, 10) || ""
                )
              }
              className="clip-card-sm w-20 bg-bg-input border border-border px-3 py-2 text-xs text-text-primary focus:border-neon-red focus:outline-none"
              placeholder="No"
              min={1}
            />
            <input
              type="text"
              value={newDayTitle}
              onChange={(e) => setNewDayTitle(e.target.value)}
              className="clip-card-sm bg-bg-input border border-border px-3 py-2 text-xs text-text-primary focus:border-neon-red focus:outline-none min-w-[140px]"
              placeholder="Başlık"
            />
            <input
              type="text"
              value={newDaySubtitle}
              onChange={(e) => setNewDaySubtitle(e.target.value)}
              className="clip-card-sm bg-bg-input border border-border px-3 py-2 text-xs text-text-primary focus:border-neon-red focus:outline-none min-w-[160px]"
              placeholder="Alt başlık (opsiyonel)"
            />
            <div className="flex gap-2">
              <button
                onClick={handleCreateDay}
                className="clip-button bg-neon-red text-white text-[10px] font-bold uppercase tracking-widest px-4 py-2"
              >
                OLUŞTUR
              </button>
              <button
                onClick={() => setCreatingDay(false)}
                className="clip-button bg-bg-card-hover border border-border text-[10px] font-bold uppercase tracking-widest px-4 py-2 text-text-secondary hover:text-text-primary"
              >
                İPTAL
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={handleStartCreateDay}
            className="clip-button bg-bg-card-hover border border-dashed border-border px-4 py-2 text-[10px] uppercase tracking-widest font-bold text-text-muted hover:text-neon-red hover:border-neon-red transition-all duration-300 flex items-center gap-2 self-start sm:self-auto"
          >
            <Plus size={14} />
            YENİ GÜN EKLE
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
                    GÜN {day.dayNumber}
                  </span>
                  <div className="text-left">
                    <h3 className="font-bold uppercase tracking-wider text-sm">
                      {day.title}
                    </h3>
                    <p className="text-[10px] uppercase tracking-widest text-text-muted">
                      {day.subtitle} • {day.exercises.length} EGZERSİZ
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
                            BAŞLIK
                          </label>
                          <input
                            value={dayTitle}
                            onChange={(e) => setDayTitle(e.target.value)}
                            className="clip-card-sm w-full bg-bg-input border border-border px-3 py-2 text-sm text-text-primary focus:border-neon-red focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase tracking-widest text-text-muted mb-1">
                            ALT BAŞLIK
                          </label>
                          <input
                            value={daySubtitle}
                            onChange={(e) => setDaySubtitle(e.target.value)}
                            className="clip-card-sm w-full bg-bg-input border border-border px-3 py-2 text-sm text-text-primary focus:border-neon-red focus:outline-none"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdateDayMeta(day.id)}
                          className="clip-button bg-neon-red text-white text-xs font-bold uppercase tracking-widest px-4 py-2"
                        >
                          KAYDET
                        </button>
                        <button
                          onClick={() => setEditingDayMeta(null)}
                          className="clip-button bg-bg-card-hover border border-border text-text-secondary text-xs font-bold uppercase tracking-widest px-4 py-2"
                        >
                          İPTAL
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setEditingDayMeta(day.id);
                        setDayTitle(day.title);
                        setDaySubtitle(day.subtitle);
                      }}
                      className="text-[10px] uppercase tracking-widest text-text-muted hover:text-neon-red transition-colors flex items-center gap-1"
                    >
                      <Pencil size={10} /> GÜN BİLGİLERİNİ DÜZENLE
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
                                {exercise.name}
                              </h4>
                            </div>
                            <p className="text-[10px] uppercase tracking-widest text-text-muted mt-0.5">
                              {exercise.muscleGroup} • {exercise.sets} SET ×{" "}
                              {exercise.reps} TEKRAR
                              {exercise.youtubeVideoId &&
                                ` • VİDEO: ${exercise.youtubeVideoId}`}
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
                      YENİ EGZERSİZ EKLE
                    </button>
                  )}
                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => setPendingDayDelete(day)}
                      className="clip-button bg-bg-card-hover border border-neon-red/60 text-[10px] font-bold uppercase tracking-widest px-4 py-2 text-neon-red hover:bg-neon-red hover:text-white hover:border-neon-red transition-all duration-300"
                    >
                      GÜNÜ SİL
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
              GÜNÜ SİL
            </h3>
            <p className="text-xs text-text-secondary mb-4">
              Gün {pendingDayDelete.dayNumber} - "
              <span className="text-text-primary">
                {pendingDayDelete.title}
              </span>
              " tamamen silinecek. Bu işleme bağlı tüm egzersizler de
              kaybolacak. Devam etmek istiyor musunuz?
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setPendingDayDelete(null)}
                className="clip-button bg-bg-card-hover border border-border text-[10px] font-bold uppercase tracking-widest px-4 py-2 text-text-secondary hover:text-text-primary hover:border-text-muted transition-all duration-300"
              >
                İPTAL
              </button>
              <button
                type="button"
                onClick={handleDeleteDay}
                className="clip-button bg-neon-red border border-neon-red text-[10px] font-bold uppercase tracking-widest px-4 py-2 text-white hover:bg-neon-red-bright transition-all duration-300"
              >
                EVET, SİL
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
              EGZERSİZİ SİL
            </h3>
            <p className="text-xs text-text-secondary mb-1">
              Aşağıdaki egzersiz silinecek:
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
                İPTAL
              </button>
              <button
                type="button"
                onClick={handleDeleteExercise}
                className="clip-button bg-neon-red border border-neon-red text-[10px] font-bold uppercase tracking-widest px-4 py-2 text-white hover:bg-neon-red-bright transition-all duration-300"
              >
                EVET, SİL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
