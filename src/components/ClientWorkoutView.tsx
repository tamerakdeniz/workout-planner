"use client";

import dynamic from "next/dynamic";

const WorkoutView = dynamic(() => import("@/components/WorkoutView"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-neon-red border-t-transparent rounded-full animate-spin" />
        <p className="text-xs uppercase tracking-widest text-text-muted">
          PROGRAM YÜKLENİYOR
        </p>
      </div>
    </div>
  ),
});

export default function ClientWorkoutView() {
  return <WorkoutView />;
}
