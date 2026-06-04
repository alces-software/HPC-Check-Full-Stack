"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

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
            {/* Schedule */}
            <button
              onClick={() => router.push('/schedule')}
              className="group cursor-pointer text-left rounded-2xl border border-green-400/20 bg-green-500/10 p-8 transition-all duration-300 hover:-translate-y-2 hover:border-green-400/50 hover:bg-green-500/20 hover:shadow-2xl"
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
            </button>

            {/* Report */}
            <button
              onClick={() => router.push('/name')}
              className="group cursor-pointer text-left rounded-2xl border border-blue-400/20 bg-blue-500/10 p-8 transition-all duration-300 hover:-translate-y-2 hover:border-blue-400/50 hover:bg-blue-500/20 hover:shadow-2xl"
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
            </button>

            {/* Results */}
            <button
              onClick={() => router.push('/results')}
              className="group cursor-pointer text-left rounded-2xl border border-purple-400/20 bg-purple-500/10 p-8 transition-all duration-300 hover:-translate-y-2 hover:border-purple-400/50 hover:bg-purple-500/20 hover:shadow-2xl"
            >
              <div className="mb-4 text-5xl">📊</div>

              <h2 className="mb-2 text-2xl font-bold text-white">
                View Results
              </h2>

              <p className="text-slate-300">
                Access submitted reports and past test results.
              </p>

              <div className="mt-6 font-semibold text-purple-300 transition-transform group-hover:translate-x-2">
                Open Results →
              </div>
            </button>
            {/* Options */}
            <button
              onClick={() => router.push('/options')}
              className="group cursor-pointer text-left rounded-2xl border border-amber-400/20 bg-amber-500/10 p-8 transition-all duration-300 hover:-translate-y-2 hover:border-amber-400/50 hover:bg-amber-500/20 hover:shadow-2xl"
            >
              <div className="mb-4 text-5xl">⚙️</div>

              <h2 className="mb-2 text-2xl font-bold text-white">
                Administration
              </h2>

              <p className="text-slate-300">
                Manage users, clusters, and scheduling options.
              </p>

              <div className="mt-6 font-semibold text-amber-300 transition-transform group-hover:translate-x-2">
                Open Administration →
              </div>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}