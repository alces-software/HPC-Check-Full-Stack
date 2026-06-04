"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
<>
<header className="fixed top-5 left-0 z-50 w-full bg-transparent">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-xl font-semibold text-white">
            
          </Link>

          <button
            onClick={() => setMenuOpen(true)}
            className="flex flex-col cursor-pointer gap-1.5"
            aria-label="Open menu"
          >
            <span className="h-0.5 w-7 bg-white"></span>
            <span className="h-0.5 w-7 bg-white"></span>
            <span className="h-0.5 w-7 bg-white"></span>
          </button>
        </div>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-slate-950">
          <button
            onClick={() => setMenuOpen(false)}
            className="absolute right-8 cursor-pointer top-6 text-5xl text-white hover:text-blue-400"
            aria-label="Close menu"
          >
            ×
          </button>

          <nav className="flex flex-col items-center gap-10">
            <Link
              href="/schedule"
              onClick={() => setMenuOpen(false)}
              className="text-4xl font-semibold text-white hover:text-blue-400 transition"
            >
              View Schedule
            </Link>

            <Link
              href="/results"
              onClick={() => setMenuOpen(false)}
              className="text-4xl font-semibold text-white hover:text-blue-400 transition"
            >
              Results
            </Link>

            <Link
              href="/personalSchedule"
              onClick={() => setMenuOpen(false)}
              className="text-4xl font-semibold text-white hover:text-blue-400 transition"
            >
              Fill Out Form
            </Link>
          </nav>
        </div>
      )}
    </>
  );
}