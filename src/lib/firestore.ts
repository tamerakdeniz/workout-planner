import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  query,
  orderBy,
  where,
  addDoc,
  deleteDoc,
} from "firebase/firestore";
import { getDb } from "./firebase";
import type { DayProgram, Exercise, Program } from "@/types/workout";

const DAYS_COLLECTION = "days";
const PROGRAMS_COLLECTION = "programs";

// ── Program CRUD ──

export async function getAllPrograms(): Promise<Program[]> {
  const db = getDb();
  try {
    const q = query(collection(db, PROGRAMS_COLLECTION), orderBy("order"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as Program[];
  } catch {
    const snapshot = await getDocs(collection(db, PROGRAMS_COLLECTION));
    const programs = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as Program[];
    return programs.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }
}

export async function getProgram(programId: string): Promise<Program | null> {
  const db = getDb();
  const docRef = doc(db, PROGRAMS_COLLECTION, programId);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() } as Program;
}

export async function createProgram(
  data: Omit<Program, "id">
): Promise<string> {
  const db = getDb();
  const docRef = await addDoc(collection(db, PROGRAMS_COLLECTION), data);
  return docRef.id;
}

export async function updateProgram(
  programId: string,
  data: Partial<Program>
): Promise<void> {
  const db = getDb();
  const docRef = doc(db, PROGRAMS_COLLECTION, programId);
  await updateDoc(docRef, data);
}

export async function deleteProgramDocument(
  programId: string
): Promise<void> {
  const db = getDb();
  await deleteDoc(doc(db, PROGRAMS_COLLECTION, programId));
}

// ── Day CRUD ──

export async function getAllDays(): Promise<DayProgram[]> {
  const db = getDb();
  const q = query(collection(db, DAYS_COLLECTION), orderBy("dayNumber"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  })) as DayProgram[];
}

export async function getDaysByProgram(programId: string): Promise<DayProgram[]> {
  const db = getDb();
  try {
    const q = query(
      collection(db, DAYS_COLLECTION),
      where("programId", "==", programId),
      orderBy("dayNumber")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as DayProgram[];
  } catch {
    const allDays = await getAllDays();
    return allDays
      .filter((d) => d.programId === programId)
      .sort((a, b) => a.dayNumber - b.dayNumber);
  }
}

export async function getDay(dayId: string): Promise<DayProgram | null> {
  const db = getDb();
  const docRef = doc(db, DAYS_COLLECTION, dayId);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() } as DayProgram;
}

export async function updateDay(
  dayId: string,
  data: Partial<DayProgram>
): Promise<void> {
  const db = getDb();
  const docRef = doc(db, DAYS_COLLECTION, dayId);
  await updateDoc(docRef, data);
}

export async function setDayData(
  dayId: string,
  data: Omit<DayProgram, "id">
): Promise<void> {
  const db = getDb();
  const docRef = doc(db, DAYS_COLLECTION, dayId);
  await setDoc(docRef, data);
}

export async function createDay(
  data: Omit<DayProgram, "id">
): Promise<string> {
  const db = getDb();
  const docRef = await addDoc(collection(db, DAYS_COLLECTION), data);
  return docRef.id;
}

export async function addExerciseToDay(
  dayId: string,
  exercise: Omit<Exercise, "id">
): Promise<void> {
  const db = getDb();
  const dayDoc = await getDay(dayId);
  if (!dayDoc) return;

  const newExercise: Exercise = {
    ...exercise,
    id: crypto.randomUUID(),
  };

  await updateDoc(doc(db, DAYS_COLLECTION, dayId), {
    exercises: [...dayDoc.exercises, newExercise],
  });
}

export async function updateExerciseInDay(
  dayId: string,
  exerciseId: string,
  updates: Partial<Exercise>
): Promise<void> {
  const db = getDb();
  const dayDoc = await getDay(dayId);
  if (!dayDoc) return;

  const updatedExercises = dayDoc.exercises.map((ex) =>
    ex.id === exerciseId ? { ...ex, ...updates } : ex
  );

  await updateDoc(doc(db, DAYS_COLLECTION, dayId), {
    exercises: updatedExercises,
  });
}

export async function deleteExerciseFromDay(
  dayId: string,
  exerciseId: string
): Promise<void> {
  const db = getDb();
  const dayDoc = await getDay(dayId);
  if (!dayDoc) return;

  const filteredExercises = dayDoc.exercises.filter(
    (ex) => ex.id !== exerciseId
  );

  await updateDoc(doc(db, DAYS_COLLECTION, dayId), {
    exercises: filteredExercises,
  });
}

export async function deleteDayDocument(dayId: string): Promise<void> {
  const db = getDb();
  await deleteDoc(doc(db, DAYS_COLLECTION, dayId));
}

export async function deleteDaysByProgram(programId: string): Promise<void> {
  let days: DayProgram[];
  try {
    days = await getDaysByProgram(programId);
  } catch {
    const allDays = await getAllDays();
    days = allDays.filter((d) => d.programId === programId);
  }
  await Promise.all(days.map((d) => deleteDayDocument(d.id)));
}
