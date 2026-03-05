"use client";

import { useState } from "react";
import Image from "next/image";
import { Check, Dumbbell, RotateCcw } from "lucide-react";
import type { Exercise } from "@/types/workout";

interface ExerciseCardProps {
  exercise: Exercise;
  isCompleted: boolean;
  onToggleComplete: (exerciseId: string) => void;
}

export default function ExerciseCard({
  exercise,
  isCompleted,
  onToggleComplete,
}: ExerciseCardProps) {
  const [showVideo, setShowVideo] = useState(false);

  return (
    <div
      className={`
        clip-card relative group transition-all duration-500
        ${
          isCompleted
            ? "completed-card border-2 border-poison-green shadow-[0_0_15px_rgba(34,197,94,0.2)]"
            : "border border-border hover:border-neon-red/50 hover:shadow-[0_0_20px_rgba(220,38,38,0.15)]"
        }
        bg-bg-card
      `}
    >
      {/* Diagonal accent line */}
      <div
        className={`absolute top-0 right-0 w-[2px] h-8 origin-top-right rotate-[-45deg] translate-x-[-12px] translate-y-[4px]
          ${isCompleted ? "bg-poison-green" : "bg-neon-red"}
        `}
      />

      <div className="p-5 sm:p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Dumbbell
                size={16}
                className={isCompleted ? "text-poison-green" : "text-neon-red"}
              />
              <span
                className={`text-[10px] uppercase tracking-[0.2em] font-semibold
                  ${isCompleted ? "text-poison-green" : "text-neon-red"}
                `}
              >
                {exercise.muscleGroup}
              </span>
            </div>
            <h3
              className={`text-lg sm:text-xl font-bold uppercase tracking-wider
                ${isCompleted ? "text-text-secondary line-through" : "text-text-primary"}
              `}
            >
              {exercise.name}
            </h3>
          </div>

          <button
            onClick={() => onToggleComplete(exercise.id)}
            className={`
              clip-button flex items-center justify-center w-12 h-12
              transition-all duration-300 shrink-0 ml-3
              ${
                isCompleted
                  ? "bg-poison-green text-black hover:bg-poison-green-bright"
                  : "bg-bg-card-hover border border-border text-text-secondary hover:border-neon-red hover:text-neon-red"
              }
            `}
          >
            {isCompleted ? <RotateCcw size={18} /> : <Check size={18} />}
          </button>
        </div>

        {/* Stats */}
        <div className="flex gap-4 mb-5">
          <div className="clip-card-sm bg-bg-primary border border-border px-4 py-2">
            <span className="text-[10px] uppercase tracking-widest text-text-muted block">
              SET
            </span>
            <span
              className={`text-xl font-bold ${isCompleted ? "text-poison-green" : "text-text-primary"}`}
            >
              {exercise.sets}
            </span>
          </div>
          <div className="clip-card-sm bg-bg-primary border border-border px-4 py-2">
            <span className="text-[10px] uppercase tracking-widest text-text-muted block">
              TEKRAR
            </span>
            <span
              className={`text-xl font-bold ${isCompleted ? "text-poison-green" : "text-text-primary"}`}
            >
              {exercise.reps}
            </span>
          </div>
        </div>

        {/* Video Section */}
        {exercise.youtubeVideoId && (
          <div>
            {!showVideo ? (
              <button
                onClick={() => setShowVideo(true)}
                className="clip-button w-full relative overflow-hidden group/video"
              >
                <Image
                  src={`https://img.youtube.com/vi/${exercise.youtubeVideoId}/mqdefault.jpg`}
                  alt={exercise.name}
                  width={480}
                  height={270}
                  className="w-full h-40 sm:h-48 object-cover brightness-50 group-hover/video:brightness-75 transition-all duration-300"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-neon-red/90 flex items-center justify-center group-hover/video:bg-neon-red group-hover/video:scale-110 transition-all duration-300">
                    <svg
                      className="w-6 h-6 text-white ml-1"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
                <div className="absolute bottom-2 left-3 text-[10px] uppercase tracking-widest text-white/70">
                  VİDEOYU İZLE
                </div>
              </button>
            ) : (
              <div className="clip-button overflow-hidden">
                <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                  <iframe
                    className="absolute inset-0 w-full h-full"
                    src={`https://www.youtube.com/embed/${exercise.youtubeVideoId}?rel=0`}
                    title={exercise.name}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom accent */}
      <div
        className={`h-[2px] transition-all duration-500
          ${isCompleted ? "bg-poison-green" : "bg-gradient-to-r from-neon-red/0 via-neon-red to-neon-red/0 opacity-0 group-hover:opacity-100"}
        `}
      />
    </div>
  );
}
