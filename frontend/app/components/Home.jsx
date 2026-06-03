"use client";

import Link from "next/link";

export default function Home() {

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-4xl rounded-xl bg-white p-6 shadow">
        <h1 className="mb-8 text-center text-3xl font-bold text-black">
          Rota Portal
        </h1>

        <div className="flex flex-col gap-4 sm:flex-row">
          <Link href='/schedule'
            className="
              flex-1
              rounded-xl
              bg-gradient-to-br
              from-green-500
              to-green-700
              px-6
              py-6
              text-lg
              font-semibold
              text-white
              text-center
              shadow-md
              transition-all
              duration-200
              hover:-translate-y-1
              hover:shadow-xl
            "
          >
            View Schedule
          </Link>

          <Link href='/name'
            className="
              flex-1
              rounded-xl
              bg-gradient-to-br
              from-blue-500
              to-blue-700
              px-6
              py-6
              text-lg
              font-semibold
              text-white
              text-center
              shadow-md
              transition-all
              duration-200
              hover:-translate-y-1
              hover:shadow-xl
            "
          >
            Fill Out Report
          </Link>
        </div>
      </div>
    </main>
  );
}