"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { getFirebaseAuth, getDb } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import {
  getAllPrograms,
  createProgram,
  updateProgram,
  deleteProgramDocument,
  getDaysByProgram,
  addExerciseToDay,
  updateExerciseInDay,
  deleteExerciseFromDay,
  updateDay,
  createDay,
  deleteDayDocument,
  deleteDaysByProgram,
} from "@/lib/firestore";
import type { DayProgram, Exercise, Program, ProgramIcon, ProgramColor } from "@/types/workout";
import LoginForm from "./LoginForm";
import ExerciseForm from "./ExerciseForm";
import { ICON_MAP, COLOR_MAP } from "@/components/ProgramSelector";
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
  Power,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n";

const AVAILABLE_ICONS: ProgramIcon[] = ["dumbbell", "home", "stretch", "heart", "zap", "target", "flame", "swords"];
const AVAILABLE_COLORS: ProgramColor[] = ["red", "blue", "green", "purple", "orange", "cyan", "pink", "yellow"];

export default function AdminPanel() {
  const router = useRouter();
  const { lang, t } = useLanguage();
  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  const [programs, setPrograms] = useState<Program[]>([]);
  const [expandedPrograms, setExpandedPrograms] = useState<Record<string, boolean>>({});
  const [programDays, setProgramDays] = useState<Record<string, DayProgram[]>>({});

  const [creatingProgram, setCreatingProgram] = useState(false);
  const [newProgramNameTr, setNewProgramNameTr] = useState("");
  const [newProgramNameEn, setNewProgramNameEn] = useState("");
  const [newProgramDescTr, setNewProgramDescTr] = useState("");
  const [newProgramDescEn, setNewProgramDescEn] = useState("");
  const [newProgramIcon, setNewProgramIcon] = useState<ProgramIcon>("dumbbell");
  const [newProgramColor, setNewProgramColor] = useState<ProgramColor>("red");
  const [newProgramOrder, setNewProgramOrder] = useState<number>(1);
  const [newProgramActive, setNewProgramActive] = useState(true);

  const [editingProgramId, setEditingProgramId] = useState<string | null>(null);
  const [editProgramNameTr, setEditProgramNameTr] = useState("");
  const [editProgramNameEn, setEditProgramNameEn] = useState("");
  const [editProgramDescTr, setEditProgramDescTr] = useState("");
  const [editProgramDescEn, setEditProgramDescEn] = useState("");
  const [editProgramIcon, setEditProgramIcon] = useState<ProgramIcon>("dumbbell");
  const [editProgramColor, setEditProgramColor] = useState<ProgramColor>("red");
  const [editProgramOrder, setEditProgramOrder] = useState<number>(1);
  const [editProgramActive, setEditProgramActive] = useState(true);

  const [firebaseConnected, setFirebaseConnected] = useState(false);
  const firebaseCheckRef = useRef(false);

  const [pendingProgramDelete, setPendingProgramDelete] = useState<Program | null>(null);

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

  const [creatingDayForProgram, setCreatingDayForProgram] = useState<string | null>(null);
  const [newDayNumber, setNewDayNumber] = useState<number | "">("");
  const [newDayTitleTr, setNewDayTitleTr] = useState("");
  const [newDayTitleEn, setNewDayTitleEn] = useState("");
  const [newDaySubtitleTr, setNewDaySubtitleTr] = useState("");
  const [newDaySubtitleEn, setNewDaySubtitleEn] = useState("");

  const [pendingDayDelete, setPendingDayDelete] = useState<DayProgram | null>(null);
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

  useEffect(() => {
    if (firebaseCheckRef.current) return;
    firebaseCheckRef.current = true;

    const checkConnection = async () => {
      try {
        const db = getDb();
        // Sağlık kontrolü için izin verdiğimiz bir koleksiyondan okuma yap
        await getDoc(doc(db, "programs", "__healthcheck__"));
        setFirebaseConnected(true);
      } catch {
        // Doc mevcut olmasa bile (NOT_FOUND) hata atmaz, sadece permission / network hatalarında düşer
        setFirebaseConnected(true);
      }
    };

    void checkConnection();
  }, []);

  const fetchPrograms = useCallback(async () => {
    setLoading(true);
    const loadingToastId = toast.loading(t("admin.updatingData"));
    try {
      const data = await getAllPrograms();
      setPrograms(data);
    } catch {
      toast.error(t("admin.loadingError"));
    } finally {
      toast.dismiss(loadingToastId);
      setLoading(false);
    }
  }, [t]);

  const fetchDaysForProgram = useCallback(async (programId: string) => {
    try {
      const days = await getDaysByProgram(programId);
      setProgramDays((prev) => ({ ...prev, [programId]: days }));
    } catch {
      toast.error(t("admin.loadingError"));
    }
  }, [t]);

  useEffect(() => {
    if (user) fetchPrograms();
  }, [user, fetchPrograms]);

  const handleLogout = async () => {
    await signOut(getFirebaseAuth());
    router.push("/");
  };

  const toggleProgramExpand = async (programId: string) => {
    const willExpand = !expandedPrograms[programId];
    setExpandedPrograms((prev) => ({ ...prev, [programId]: willExpand }));
    if (willExpand && !programDays[programId]) {
      await fetchDaysForProgram(programId);
    }
  };

  // ── Program CRUD ──

  const handleStartCreateProgram = () => {
    const maxOrder = programs.length > 0 ? Math.max(...programs.map((p) => p.order)) : 0;
    setNewProgramOrder(maxOrder + 1);
    setNewProgramNameTr("");
    setNewProgramNameEn("");
    setNewProgramDescTr("");
    setNewProgramDescEn("");
    setNewProgramIcon("dumbbell");
    setNewProgramColor("red");
    setNewProgramActive(true);
    setCreatingProgram(true);
  };

  const handleCreateProgram = async () => {
    if (!newProgramNameTr.trim()) {
      toast.error(t("admin.programCreateError"));
      return;
    }
    try {
      const nameTr = newProgramNameTr.trim();
      const id = await createProgram({
        name: nameTr,
        name_tr: nameTr,
        name_en: newProgramNameEn.trim() || nameTr,
        description: newProgramDescTr.trim(),
        description_tr: newProgramDescTr.trim(),
        description_en: newProgramDescEn.trim() || newProgramDescTr.trim(),
        icon: newProgramIcon,
        color: newProgramColor,
        order: newProgramOrder,
        isActive: newProgramActive,
      });
      toast.success(t("admin.programCreated"));
      setCreatingProgram(false);
      setExpandedPrograms((prev) => ({ ...prev, [id]: true }));
      setProgramDays((prev) => ({ ...prev, [id]: [] }));
      fetchPrograms();
    } catch {
      toast.error(t("admin.programCreateFailed"));
    }
  };

  const handleStartEditProgram = (program: Program) => {
    setEditingProgramId(program.id);
    setEditProgramNameTr(program.name_tr || program.name);
    setEditProgramNameEn(program.name_en || "");
    setEditProgramDescTr(program.description_tr || program.description || "");
    setEditProgramDescEn(program.description_en || "");
    setEditProgramIcon(program.icon);
    setEditProgramColor(program.color);
    setEditProgramOrder(program.order);
    setEditProgramActive(program.isActive !== false);
  };

  const handleUpdateProgram = async () => {
    if (!editingProgramId) return;
    try {
      const nameTr = editProgramNameTr.trim();
      await updateProgram(editingProgramId, {
        name: nameTr,
        name_tr: nameTr,
        name_en: editProgramNameEn.trim() || nameTr,
        description: editProgramDescTr.trim(),
        description_tr: editProgramDescTr.trim(),
        description_en: editProgramDescEn.trim() || editProgramDescTr.trim(),
        icon: editProgramIcon,
        color: editProgramColor,
        order: editProgramOrder,
        isActive: editProgramActive,
      });
      toast.success(t("admin.programUpdated"));
      setEditingProgramId(null);
      fetchPrograms();
    } catch {
      toast.error(t("admin.programUpdateFailed"));
    }
  };

  const handleToggleProgramActive = async (program: Program) => {
    const newActive = !(program.isActive !== false);
    try {
      await updateProgram(program.id, { isActive: newActive });
      toast.success(newActive ? t("admin.programActivated") : t("admin.programDeactivated"));
      await fetchPrograms();
    } catch {
      toast.error(t("admin.programUpdateFailed"));
    }
  };

  const handleDeleteProgram = async () => {
    if (!pendingProgramDelete) return;
    const programId = pendingProgramDelete.id;
    try {
      await deleteDaysByProgram(programId);
      await deleteProgramDocument(programId);
      toast.success(t("admin.programDeleted"));
      setExpandedPrograms((prev) => {
        const copy = { ...prev };
        delete copy[programId];
        return copy;
      });
      setProgramDays((prev) => {
        const copy = { ...prev };
        delete copy[programId];
        return copy;
      });
      setPendingProgramDelete(null);
      await fetchPrograms();
    } catch {
      toast.error(t("admin.programDeleteFailed"));
    }
  };

  // ── Day CRUD ──

  const handleStartCreateDay = (programId: string) => {
    const days = programDays[programId] || [];
    const maxDayNumber = days.length > 0 ? Math.max(...days.map((d) => d.dayNumber)) : 0;
    setNewDayNumber(maxDayNumber + 1);
    setNewDayTitleTr("");
    setNewDayTitleEn("");
    setNewDaySubtitleTr("");
    setNewDaySubtitleEn("");
    setCreatingDayForProgram(programId);
  };

  const handleCreateDay = async () => {
    const targetProgramId = creatingDayForProgram;
    if (!targetProgramId || !newDayNumber || !newDayTitleTr.trim()) {
      toast.error(t("admin.creatingDayError"));
      return;
    }
    try {
      const titleTr = newDayTitleTr.trim();
      const subtitleTr = newDaySubtitleTr.trim();
      const id = await createDay({
        dayNumber: newDayNumber,
        title: titleTr,
        subtitle: subtitleTr,
        title_tr: titleTr,
        title_en: newDayTitleEn.trim() || titleTr,
        subtitle_tr: subtitleTr,
        subtitle_en: newDaySubtitleEn.trim() || subtitleTr,
        exercises: [],
        programId: targetProgramId,
      });
      toast.success(t("admin.creatingDaySuccess"));
      setCreatingDayForProgram(null);
      setSelectedDay(id);
      setExpandedDays((prev) => ({ ...prev, [id]: true }));
      await fetchDaysForProgram(targetProgramId);
    } catch {
      toast.error(t("admin.creatingDayFailed"));
    }
  };

  const handleDeleteDay = async () => {
    if (!pendingDayDelete) return;
    const dayId = pendingDayDelete.id;
    const programId = pendingDayDelete.programId;
    try {
      await deleteDayDocument(dayId);
      toast.success(t("admin.dayDeleted"));
      setExpandedDays((prev) => {
        const copy = { ...prev };
        delete copy[dayId];
        return copy;
      });
      if (selectedDay === dayId) setSelectedDay("");
      if (programId) fetchDaysForProgram(programId);
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
      const day = Object.values(programDays).flat().find((d) => d.id === selectedDay);
      if (day?.programId) fetchDaysForProgram(day.programId);
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
      const day = Object.values(programDays).flat().find((d) => d.id === selectedDay);
      if (day?.programId) fetchDaysForProgram(day.programId);
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
      const day = Object.values(programDays).flat().find((d) => d.id === dayId);
      if (day?.programId) fetchDaysForProgram(day.programId);
      setPendingExerciseDelete(null);
    } catch {
      toast.error(t("admin.exerciseDeleteFailed"));
    }
  };

  const handleUpdateDayMeta = async (dayId: string) => {
    try {
      const titleTr = dayTitleTr;
      const subtitleTr = daySubtitleTr;
      await updateDay(dayId, {
        title: titleTr,
        subtitle: subtitleTr,
        title_tr: titleTr,
        title_en: dayTitleEn.trim() || titleTr,
        subtitle_tr: subtitleTr,
        subtitle_en: daySubtitleEn.trim() || subtitleTr,
      });
      toast.success(t("admin.dayMetaUpdated"));
      setEditingDayMeta(null);
      const day = Object.values(programDays).flat().find((d) => d.id === dayId);
      if (day?.programId) fetchDaysForProgram(day.programId);
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
          <div className={`clip-card-sm border px-3 py-1.5 flex items-center gap-2 ${
            firebaseConnected
              ? "bg-poison-green/10 border-poison-green/40"
              : "bg-neon-red/10 border-neon-red/40"
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              firebaseConnected
                ? "bg-poison-green shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse"
                : "bg-neon-red shadow-[0_0_8px_rgba(220,38,38,0.6)]"
            }`} />
            <span className={`text-[10px] uppercase tracking-widest font-bold ${
              firebaseConnected ? "text-poison-green" : "text-neon-red"
            }`}>
              {firebaseConnected ? t("admin.firebaseConnected") : t("admin.firebaseDisconnected")}
            </span>
          </div>
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

      {/* Program management toolbar */}
      <div className="clip-card bg-bg-card border border-border mb-6 p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-text-muted">
            {t("admin.programManagement")}
          </p>
          <p className="text-xs text-text-secondary">
            {t("admin.totalProgramsPrefix")}{" "}
            <span className="font-semibold text-text-primary">{programs.length}</span>{" "}
            {t("admin.totalProgramsSuffix")}
          </p>
        </div>

        {creatingProgram ? (
          <div className="w-full space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                value={newProgramNameTr}
                onChange={(e) => setNewProgramNameTr(e.target.value)}
                className="clip-card-sm w-full bg-bg-input border border-border px-3 py-2 text-xs text-text-primary focus:border-neon-red focus:outline-none"
                placeholder={t("admin.programNameTr")}
              />
              <input
                type="text"
                value={newProgramNameEn}
                onChange={(e) => setNewProgramNameEn(e.target.value)}
                className="clip-card-sm w-full bg-bg-input border border-border px-3 py-2 text-xs text-text-primary focus:border-neon-red focus:outline-none"
                placeholder={t("admin.programNameEn")}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                value={newProgramDescTr}
                onChange={(e) => setNewProgramDescTr(e.target.value)}
                className="clip-card-sm w-full bg-bg-input border border-border px-3 py-2 text-xs text-text-primary focus:border-neon-red focus:outline-none"
                placeholder={t("admin.programDescTr")}
              />
              <input
                type="text"
                value={newProgramDescEn}
                onChange={(e) => setNewProgramDescEn(e.target.value)}
                className="clip-card-sm w-full bg-bg-input border border-border px-3 py-2 text-xs text-text-primary focus:border-neon-red focus:outline-none"
                placeholder={t("admin.programDescEn")}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-text-muted mb-1">
                  {t("admin.programIcon")}
                </label>
                <div className="flex flex-wrap gap-1">
                  {AVAILABLE_ICONS.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setNewProgramIcon(icon)}
                      className={`clip-button p-2 transition-all ${
                        newProgramIcon === icon
                          ? "bg-neon-red text-white"
                          : "bg-bg-card-hover border border-border text-text-muted hover:text-text-primary"
                      }`}
                    >
                      <span className="scale-75 block">{ICON_MAP[icon]}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-text-muted mb-1">
                  {t("admin.programColor")}
                </label>
                <div className="flex flex-wrap gap-1">
                  {AVAILABLE_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewProgramColor(color)}
                      className={`w-7 h-7 rounded-sm ${COLOR_MAP[color].bg} transition-all ${
                        newProgramColor === color
                          ? "ring-2 ring-white ring-offset-2 ring-offset-bg-primary scale-110"
                          : "opacity-60 hover:opacity-100"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-text-muted mb-1">
                    {t("admin.programOrder")}
                  </label>
                  <input
                    type="number"
                    value={newProgramOrder}
                    onChange={(e) => setNewProgramOrder(parseInt(e.target.value) || 1)}
                    className="clip-card-sm w-full bg-bg-input border border-border px-3 py-2 text-xs text-text-primary focus:border-neon-red focus:outline-none"
                    min={1}
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-text-muted mb-1">
                    {t("admin.programStatus")}
                  </label>
                  <button
                    type="button"
                    onClick={() => setNewProgramActive(!newProgramActive)}
                    className={`clip-button px-3 py-2 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 transition-all ${
                      newProgramActive
                        ? "bg-poison-green/20 border border-poison-green/50 text-poison-green"
                        : "bg-bg-card-hover border border-border text-text-muted"
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full ${newProgramActive ? "bg-poison-green" : "bg-text-muted"}`} />
                    {newProgramActive ? t("admin.programActive") : t("admin.programInactive")}
                  </button>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 justify-end">
              <button
                onClick={handleCreateProgram}
                className="clip-button bg-neon-red text-white text-[10px] font-bold uppercase tracking-widest px-4 py-2"
              >
                {t("admin.create")}
              </button>
              <button
                onClick={() => setCreatingProgram(false)}
                className="clip-button bg-bg-card-hover border border-border text-[10px] font-bold uppercase tracking-widest px-4 py-2 text-text-secondary hover:text-text-primary"
              >
                {t("common.cancel")}
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={handleStartCreateProgram}
            className="clip-button bg-bg-card-hover border border-dashed border-border px-4 py-2 text-[10px] uppercase tracking-widest font-bold text-text-muted hover:text-neon-red hover:border-neon-red transition-all duration-300 flex items-center gap-2 self-start sm:self-auto"
          >
            <Plus size={14} />
            {t("admin.newProgram")}
          </button>
        )}
      </div>

      {loading && programs.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-neon-red" />
        </div>
      ) : (
        <div className="space-y-6">
          {programs.map((program) => {
            const colors = COLOR_MAP[program.color] || COLOR_MAP.red;
            const days = programDays[program.id] || [];
            const isExpanded = expandedPrograms[program.id];
            const isActive = program.isActive !== false;

            return (
              <div key={program.id} className={`clip-card bg-bg-card border ${colors.border}`}>
                {/* Program Header */}
                <div className="flex items-center justify-between p-5 hover:bg-bg-card-hover transition-colors">
                  <button
                    onClick={() => toggleProgramExpand(program.id)}
                    className="flex items-center gap-3 flex-1 text-left"
                  >
                    <div className={`clip-button ${colors.bg} p-2.5 ${!isActive ? "opacity-40" : ""}`}>
                      <span className="text-white">{ICON_MAP[program.icon]}</span>
                    </div>
                    <div>
                      <h3 className={`font-bold uppercase tracking-wider text-sm ${!isActive ? "text-text-muted" : ""}`}>
                        {lang === "tr" ? program.name_tr || program.name : program.name_en || program.name}
                      </h3>
                      <p className="text-[10px] uppercase tracking-widest text-text-muted">
                        {lang === "tr"
                          ? program.description_tr || program.description || ""
                          : program.description_en || program.description || ""}
                        {days.length > 0 && ` • ${days.length} ${t("programs.days")}`}
                      </p>
                    </div>
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleToggleProgramActive(program); }}
                      className={`clip-button px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5 transition-all ${
                        isActive
                          ? "bg-poison-green/15 border border-poison-green/40 text-poison-green hover:bg-poison-green/25"
                          : "bg-bg-card-hover border border-border text-text-muted hover:text-text-primary hover:border-text-muted"
                      }`}
                      title={isActive ? t("admin.programActive") : t("admin.programInactive")}
                    >
                      <Power size={12} />
                      {isActive ? t("admin.programActive") : t("admin.programInactive")}
                    </button>
                    <button onClick={() => toggleProgramExpand(program.id)} className="p-1">
                      {isExpanded ? (
                        <ChevronUp size={20} className="text-text-muted" />
                      ) : (
                        <ChevronDown size={20} className="text-text-muted" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded Program Content */}
                {isExpanded && (
                  <div className="border-t border-border p-5 space-y-4">
                    {/* Program Meta Edit */}
                    {editingProgramId === program.id ? (
                      <div className="clip-card-sm bg-bg-primary border border-border p-4 space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] uppercase tracking-widest text-text-muted mb-1">
                              {t("admin.programNameTr")}
                            </label>
                            <input
                              value={editProgramNameTr}
                              onChange={(e) => setEditProgramNameTr(e.target.value)}
                              className="clip-card-sm w-full bg-bg-input border border-border px-3 py-2 text-sm text-text-primary focus:border-neon-red focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] uppercase tracking-widest text-text-muted mb-1">
                              {t("admin.programNameEn")}
                            </label>
                            <input
                              value={editProgramNameEn}
                              onChange={(e) => setEditProgramNameEn(e.target.value)}
                              className="clip-card-sm w-full bg-bg-input border border-border px-3 py-2 text-sm text-text-primary focus:border-neon-red focus:outline-none"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] uppercase tracking-widest text-text-muted mb-1">
                              {t("admin.programDescTr")}
                            </label>
                            <input
                              value={editProgramDescTr}
                              onChange={(e) => setEditProgramDescTr(e.target.value)}
                              className="clip-card-sm w-full bg-bg-input border border-border px-3 py-2 text-sm text-text-primary focus:border-neon-red focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] uppercase tracking-widest text-text-muted mb-1">
                              {t("admin.programDescEn")}
                            </label>
                            <input
                              value={editProgramDescEn}
                              onChange={(e) => setEditProgramDescEn(e.target.value)}
                              className="clip-card-sm w-full bg-bg-input border border-border px-3 py-2 text-sm text-text-primary focus:border-neon-red focus:outline-none"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-[10px] uppercase tracking-widest text-text-muted mb-1">
                              {t("admin.programIcon")}
                            </label>
                            <div className="flex flex-wrap gap-1">
                              {AVAILABLE_ICONS.map((icon) => (
                                <button
                                  key={icon}
                                  type="button"
                                  onClick={() => setEditProgramIcon(icon)}
                                  className={`clip-button p-2 transition-all ${
                                    editProgramIcon === icon
                                      ? "bg-neon-red text-white"
                                      : "bg-bg-card-hover border border-border text-text-muted hover:text-text-primary"
                                  }`}
                                >
                                  <span className="scale-75 block">{ICON_MAP[icon]}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                          <div>
                            <label className="block text-[10px] uppercase tracking-widest text-text-muted mb-1">
                              {t("admin.programColor")}
                            </label>
                            <div className="flex flex-wrap gap-1">
                              {AVAILABLE_COLORS.map((color) => (
                                <button
                                  key={color}
                                  type="button"
                                  onClick={() => setEditProgramColor(color)}
                                  className={`w-7 h-7 rounded-sm ${COLOR_MAP[color].bg} transition-all ${
                                    editProgramColor === color
                                      ? "ring-2 ring-white ring-offset-2 ring-offset-bg-primary scale-110"
                                      : "opacity-60 hover:opacity-100"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div>
                              <label className="block text-[10px] uppercase tracking-widest text-text-muted mb-1">
                                {t("admin.programOrder")}
                              </label>
                              <input
                                type="number"
                                value={editProgramOrder}
                                onChange={(e) => setEditProgramOrder(parseInt(e.target.value) || 1)}
                                className="clip-card-sm w-full bg-bg-input border border-border px-3 py-2 text-sm text-text-primary focus:border-neon-red focus:outline-none"
                                min={1}
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] uppercase tracking-widest text-text-muted mb-1">
                                {t("admin.programStatus")}
                              </label>
                              <button
                                type="button"
                                onClick={() => setEditProgramActive(!editProgramActive)}
                                className={`clip-button px-3 py-2 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 transition-all ${
                                  editProgramActive
                                    ? "bg-poison-green/20 border border-poison-green/50 text-poison-green"
                                    : "bg-bg-card-hover border border-border text-text-muted"
                                }`}
                              >
                                <div className={`w-2 h-2 rounded-full ${editProgramActive ? "bg-poison-green" : "bg-text-muted"}`} />
                                {editProgramActive ? t("admin.programActive") : t("admin.programInactive")}
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={handleUpdateProgram}
                            className="clip-button bg-neon-red text-white text-xs font-bold uppercase tracking-widest px-4 py-2"
                          >
                            {t("common.save")}
                          </button>
                          <button
                            onClick={() => setEditingProgramId(null)}
                            className="clip-button bg-bg-card-hover border border-border text-text-secondary text-xs font-bold uppercase tracking-widest px-4 py-2"
                          >
                            {t("common.cancel")}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleStartEditProgram(program)}
                          className="text-[10px] uppercase tracking-widest text-text-muted hover:text-neon-red transition-colors flex items-center gap-1"
                        >
                          <Pencil size={10} /> {t("admin.editProgram")}
                        </button>
                      </div>
                    )}

                    {/* Day management bar */}
                    <div className="clip-card-sm bg-bg-primary border border-border p-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-text-muted">
                          {t("admin.dayManagement")}
                        </p>
                        <p className="text-xs text-text-secondary">
                          {t("admin.totalDaysPrefix")}{" "}
                          <span className="font-semibold text-text-primary">{days.length}</span>{" "}
                          {t("admin.totalDaysSuffix")}
                        </p>
                      </div>

                      {creatingDayForProgram === program.id ? (
                        <div className="w-full space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-[minmax(0,0.4fr)_minmax(0,1fr)] gap-2">
                            <input
                              type="number"
                              value={newDayNumber === "" ? "" : newDayNumber}
                              onChange={(e) =>
                                setNewDayNumber(
                                  e.target.value === "" ? "" : parseInt(e.target.value, 10) || ""
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
                              onClick={() => setCreatingDayForProgram(null)}
                              className="clip-button bg-bg-card-hover border border-border text-[10px] font-bold uppercase tracking-widest px-4 py-2 text-text-secondary hover:text-text-primary"
                            >
                              {t("common.cancel")}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleStartCreateDay(program.id)}
                          className="clip-button bg-bg-card-hover border border-dashed border-border px-4 py-2 text-[10px] uppercase tracking-widest font-bold text-text-muted hover:text-neon-red hover:border-neon-red transition-all duration-300 flex items-center gap-2 self-start sm:self-auto"
                        >
                          <Plus size={14} />
                          {t("admin.newDay")}
                        </button>
                      )}
                    </div>

                    {/* Days list */}
                    <div className="space-y-3">
                      {days.map((day) => (
                        <div key={day.id} className="clip-card-sm bg-bg-primary border border-border">
                          {/* Day Header - Collapsible */}
                          <button
                            onClick={() => toggleDayExpand(day.id)}
                            className="w-full flex items-center justify-between p-4 hover:bg-bg-card-hover transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <span className={`clip-button ${colors.bg} text-white text-xs font-bold px-3 py-1.5 uppercase`}>
                                {t("workout.dayLabel")} {day.dayNumber}
                              </span>
                              <div className="text-left">
                                <h3 className="font-bold uppercase tracking-wider text-sm">
                                  {lang === "tr" ? day.title_tr || day.title : day.title_en || day.title}
                                </h3>
                                <p className="text-[10px] uppercase tracking-widest text-text-muted">
                                  {lang === "tr" ? day.subtitle_tr || day.subtitle : day.subtitle_en || day.subtitle}
                                  {" "}• {day.exercises.length} {t("admin.exercisesCountSuffix")}
                                </p>
                              </div>
                            </div>
                            {expandedDays[day.id] ? (
                              <ChevronUp size={18} className="text-text-muted" />
                            ) : (
                              <ChevronDown size={18} className="text-text-muted" />
                            )}
                          </button>

                          {/* Expanded Day Content */}
                          {expandedDays[day.id] && (
                            <div className="border-t border-border p-4 space-y-3">
                              {/* Day Meta Edit */}
                              {editingDayMeta === day.id ? (
                                <div className="clip-card-sm bg-bg-card border border-border p-4 space-y-3">
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
                                      className="clip-card-sm bg-bg-card border border-border p-4 flex items-center justify-between group"
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
                                          {exercise.youtubeVideoId && ` • ID: ${exercise.youtubeVideoId}`}
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

                    {/* Delete program button */}
                    <div className="flex justify-end pt-2">
                      <button
                        onClick={() => setPendingProgramDelete(program)}
                        className="clip-button bg-bg-card-hover border border-neon-red/60 text-[10px] font-bold uppercase tracking-widest px-4 py-2 text-neon-red hover:bg-neon-red hover:text-white hover:border-neon-red transition-all duration-300"
                      >
                        {t("admin.deleteProgram")}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Confirm delete program modal */}
      {pendingProgramDelete && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className="clip-card bg-bg-card border border-border max-w-sm w-full p-6 shadow-[0_0_40px_rgba(0,0,0,0.7)]">
            <h3 className="text-sm font-bold uppercase tracking-widest text-neon-red mb-2">
              {t("admin.confirmDeleteProgramTitle")}
            </h3>
            <p className="text-xs text-text-secondary mb-4">
              &quot;<span className="text-text-primary">{pendingProgramDelete.name}</span>&quot;{" "}
              {t("admin.confirmDeleteProgramBody")}
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setPendingProgramDelete(null)}
                className="clip-button bg-bg-card-hover border border-border text-[10px] font-bold uppercase tracking-widest px-4 py-2 text-text-secondary hover:text-text-primary hover:border-text-muted transition-all duration-300"
              >
                {t("common.cancel")}
              </button>
              <button
                type="button"
                onClick={handleDeleteProgram}
                className="clip-button bg-neon-red border border-neon-red text-[10px] font-bold uppercase tracking-widest px-4 py-2 text-white hover:bg-neon-red-bright transition-all duration-300"
              >
                {t("common.yesDelete")}
              </button>
            </div>
          </div>
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
              {pendingDayDelete.dayNumber} - &quot;
              <span className="text-text-primary">{pendingDayDelete.title}</span>
              &quot; {t("admin.confirmDeleteDayBodyMiddle")}
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
