export interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  sets: number;
  reps: string;
  youtubeVideoId: string;
  order: number;
}

export interface DayProgram {
  id: string;
  dayNumber: number;
  title: string;
  subtitle: string;
  exercises: Exercise[];
}

export interface CompletionStatus {
  [exerciseId: string]: boolean;
}
