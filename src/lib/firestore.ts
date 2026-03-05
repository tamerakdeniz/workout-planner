import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  query,
  orderBy,
  addDoc,
  deleteDoc,
} from "firebase/firestore";
import { getDb } from "./firebase";
import type { DayProgram, Exercise } from "@/types/workout";

const DAYS_COLLECTION = "days";

export async function getAllDays(): Promise<DayProgram[]> {
  const db = getDb();
  const q = query(collection(db, DAYS_COLLECTION), orderBy("dayNumber"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  })) as DayProgram[];
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
