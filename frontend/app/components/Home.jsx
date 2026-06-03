"use client";

import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 p-6">
      <div className="relative z-10 w-full max-w-5xl">
        <div className="rounded-3xl border border-white/10 bg-white/10 p-10 shadow-2xl backdrop-blur-xl">
          <div className="mb-12 text-center">
            <div className="mb-4 flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-4xl shadow-xl">
                📋
              </div>
            </div>

            <h1 className="text-5xl font-bold text-white">
              Rota Portal
            </h1>

            <p className="mt-3 text-lg text-slate-300">
              Access schedules and submit reports in one place
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Link
              href="/schedule"
              className="
                group
                rounded-2xl
                border
                border-green-400/20
                bg-green-500/10
                p-8
                transition-all
                duration-300
                hover:-translate-y-2
                hover:border-green-400/50
                hover:bg-green-500/20
                hover:shadow-2xl
              "
            >
              <div className="mb-4 text-5xl">📅</div>

              <h2 className="mb-2 text-2xl font-bold text-white">
                View Schedule
              </h2>

              <p className="text-slate-300">
                Check the weekly rota and see team allocations.
              </p>

              <div className="mt-6 font-semibold text-green-300 transition-transform group-hover:translate-x-2">
                Open Schedule →
              </div>
            </Link>

            <Link
              href="/name"
              className="
                group
                rounded-2xl
                border
                border-blue-400/20
                bg-blue-500/10
                p-8
                transition-all
                duration-300
                hover:-translate-y-2
                hover:border-blue-400/50
                hover:bg-blue-500/20
                hover:shadow-2xl
              "
            >
              <div className="mb-4 text-5xl">📝</div>

              <h2 className="mb-2 text-2xl font-bold text-white">
                Fill Out Report
              </h2>

              <p className="text-slate-300">
                Complete and submit your daily report.
              </p>

              <div className="mt-6 font-semibold text-blue-300 transition-transform group-hover:translate-x-2">
                Start Report →
              </div>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}