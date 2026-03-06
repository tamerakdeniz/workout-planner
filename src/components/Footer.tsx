"use client";

import { useLanguage } from "@/lib/i18n";

export default function Footer() {
  const { t } = useLanguage();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto py-4 text-center text-sm text-text-muted">
      © {year}{" "}
      <a
        href="https://tamerakdeniz.com/"
        target="_blank"
        rel="noopener noreferrer"
        className="text-neon-red hover:text-neon-red-bright hover:underline"
      >
        Tamer Akdeniz
      </a>
      . {t("footer.copyright")}
    </footer>
  );
}
