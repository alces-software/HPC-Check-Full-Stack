"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";

    const handleKeyDown = e => {
      if (e.key === "Escape") {
        setMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/schedule", label: "Schedule" },
    { href: "/name", label: "Submit Report" },
    { href: "/results", label: "Results" },
    { href: "/options", label: "Administration" },
  ];

  return (
    <>
      <header className="sticky top-0 pt-3 z-50">
        <div className="w-full px-4 sm:px-6">
          <div className="mt-3 flex items-center justify-between rounded-2xl border border-white/10 bg-white/10 px-4 py-3 shadow-xl backdrop-blur-xl">
            <Link
              href="/"
              className="transition-opacity hover:opacity-90"
            >
              <Image
                src="/images/alces_logo.png"
                alt="Alces Logo"
                width={120}
                height={40}
                priority
                className="h-8 w-auto sm:h-10"
              />
            </Link>

            <button
              onClick={() => setMenuOpen(prev => !prev)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              className="relative flex h-10 w-10 items-center justify-center"
            >
              <span
                className={`absolute h-0.5 w-6 bg-white transition-all duration-300 ${menuOpen ? "rotate-45" : "-translate-y-2"
                  }`}
              />

              <span
                className={`absolute h-0.5 w-6 bg-white transition-all duration-300 ${menuOpen ? "opacity-0" : "opacity-100"
                  }`}
              />

              <span
                className={`absolute h-0.5 w-6 bg-white transition-all duration-300 ${menuOpen ? "-rotate-45" : "translate-y-2"
                  }`}
              />
            </button>
          </div>
        </div>
      </header>

      <div
        className={`fixed inset-0 z-40 transition-all duration-300 ${menuOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
          }`}
      >
        <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-2xl" />

        <div className="relative flex h-full items-center justify-center">
          <nav className="flex flex-col items-center gap-6 sm:gap-8">
            {navItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="text-3xl font-medium text-white transition-colors duration-200 hover:text-blue-400 sm:text-4xl md:text-5xl"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
}