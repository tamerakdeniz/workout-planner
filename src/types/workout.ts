export interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  sets: number;
  reps: string;
  youtubeVideoId: string;
  order: number;
  name_tr?: string;
  name_en?: string;
  muscleGroup_tr?: string;
  muscleGroup_en?: string;
}

export interface DayProgram {
  id: string;
  dayNumber: number;
  title: string;
  subtitle: string;
  exercises: Exercise[];
  programId: string;
  title_tr?: string;
  title_en?: string;
  subtitle_tr?: string;
  subtitle_en?: string;
}

export type ProgramIcon = "dumbbell" | "home" | "stretch" | "heart" | "zap" | "target" | "flame" | "swords";
export type ProgramColor = "red" | "blue" | "green" | "purple" | "orange" | "cyan" | "pink" | "yellow";

export interface Program {
  id: string;
  name: string;
  name_tr?: string;
  name_en?: string;
  description?: string;
  description_tr?: string;
  description_en?: string;
  icon: ProgramIcon;
  color: ProgramColor;
  order: number;
}

export interface CompletionStatus {
  [exerciseId: string]: boolean;
}
