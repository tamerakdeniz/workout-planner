"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";
import { LogIn, Loader2, Shield } from "lucide-react";

interface LoginFormProps {
  onSuccess: () => void;
}

export default function LoginForm({ onSuccess }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
      onSuccess();
    } catch {
      setError("Geçersiz e-posta veya şifre.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/70 backdrop-blur-sm">
      <div className="clip-card bg-bg-card border border-border p-8 w-full max-w-md shadow-[0_0_40px_rgba(0,0,0,0.6)]">
        <div className="flex items-center gap-3 mb-8">
          <div className="clip-button bg-neon-red p-2.5">
            <Shield size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold uppercase tracking-wider">
              ADMİN GİRİŞİ
            </h2>
            <p className="text-[10px] uppercase tracking-[0.2em] text-text-muted">
              YETKİLENDİRİLMİŞ ERİŞİM
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-text-muted mb-2">
              E-POSTA
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="clip-card-sm w-full bg-bg-input border border-border px-4 py-3 text-sm text-text-primary placeholder-text-muted focus:border-neon-red focus:outline-none transition-colors"
              placeholder="admin@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-widest text-text-muted mb-2">
              ŞİFRE
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="clip-card-sm w-full bg-bg-input border border-border px-4 py-3 text-sm text-text-primary placeholder-text-muted focus:border-neon-red focus:outline-none transition-colors"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="clip-card-sm bg-neon-red/10 border border-neon-red/30 px-4 py-3">
              <p className="text-sm text-neon-red">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="clip-button w-full bg-neon-red hover:bg-neon-red-bright text-white font-bold uppercase tracking-widest py-3 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <LogIn size={18} />
            )}
            {loading ? "GİRİŞ YAPILIYOR..." : "GİRİŞ YAP"}
          </button>
        </form>
      </div>
    </div>
  );
}
