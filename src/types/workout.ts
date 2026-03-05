export interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  sets: number;
  reps: string;
  youtubeVideoId: string;
  order: number;
  // Optional localized fields – new structure, kept alongside legacy strings
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
  // Optional localized fields for day metadata
  title_tr?: string;
  title_en?: string;
  subtitle_tr?: string;
  subtitle_en?: string;
}

export interface CompletionStatus {
  [exerciseId: string]: boolean;
}
