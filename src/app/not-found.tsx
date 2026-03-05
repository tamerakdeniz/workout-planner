import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="clip-card bg-bg-card border border-border p-10 text-center max-w-md">
        <div className="text-6xl font-bold text-neon-red mb-2 tracking-widest">
          404
        </div>
        <h2 className="text-xl font-bold uppercase tracking-wider text-text-primary mb-3">
          SAYFA BULUNAMADI
        </h2>
        <p className="text-sm text-text-secondary mb-6">
          Aradığınız sayfa mevcut değil veya taşınmış olabilir.
        </p>
        <Link
          href="/"
          className="clip-button inline-block bg-neon-red hover:bg-neon-red-bright text-white font-bold uppercase tracking-widest px-8 py-3 text-sm transition-all duration-300"
        >
          ANA SAYFAYA DÖN
        </Link>
      </div>
    </div>
  );
}
