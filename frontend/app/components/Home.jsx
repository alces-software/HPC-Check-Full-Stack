'use client';

import Link from 'next/link';
import { FaChartBar, FaRegCalendarAlt, FaRegEdit } from 'react-icons/fa';
import { IoIosArrowForward } from 'react-icons/io';
import { IoIosSettings } from 'react-icons/io';
import { GrOverview } from 'react-icons/gr';

function PortalIcon() {
   return (
      <svg viewBox="0 0 80 80" className="h-20 w-20">
         <defs>
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
               <feDropShadow
                  dx="4"
                  dy="4"
                  stdDeviation="2"
                  floodOpacity="0.25"
               />
            </filter>
         </defs>

         <rect x="10" y="10" width="30" height="30" rx="5" className="fill-green-300" filter="url(#shadow)" />
         <rect x="44" y="10" width="30" height="30" rx="5" className="fill-blue-300 " filter="url(#shadow)" />
         <rect x="10" y="44" width="30" height="30" rx="5" className="fill-purple-300" filter="url(#shadow)" />
         <rect x="44" y="44" width="30" height="30" rx="5" className="fill-amber-300" filter="url(#shadow)" />
      </svg>
   );
}

export default function Home() {
   return (
      <main className="flex justify-center space-y-8">
         <div className="relative z-10 w-full max-w-5xl">
            <div className="rounded-3xl border border-white/10 bg-white/10 p-10 shadow-2xl backdrop-blur-xl">
               <div className="mb-12 text-center">
                  <div className="mb-4 flex justify-center">
                     <PortalIcon />
                  </div>

                  <h1 className="text-5xl font-bold text-white">Portal</h1>

                  <p className="mt-3 text-lg text-slate-300">
                     Access schedules and submit reports in one place
                  </p>
               </div>

               <div className="grid gap-6 md:grid-cols-2">
                  {/* Schedule */}
                  <Link
                     href="/schedule"
                     className="group cursor-pointer rounded-2xl border border-green-400/20 bg-green-500/10 p-8 text-left transition-all duration-300 hover:-translate-y-2 hover:border-green-400/50 hover:bg-green-500/20 hover:shadow-2xl"
                  >
                     <FaRegCalendarAlt
                        className="mb-4 text-5xl text-green-300"
                        aria-hidden="true"
                     />

                     <h2 className="mb-2 text-2xl font-bold text-white">View Schedule</h2>

                     <p className="text-slate-300">
                        Check the weekly rota and see team allocations.
                     </p>

                     <div className="mt-6 flex items-center gap-1 font-semibold text-green-300 transition-transform group-hover:translate-x-2">
                        Open Schedule
                        <IoIosArrowForward aria-hidden="true" />
                     </div>
                  </Link>

                  {/* Report */}
                  <Link
                     href="/name"
                     className="group cursor-pointer rounded-2xl border border-blue-400/20 bg-blue-500/10 p-8 text-left transition-all duration-300 hover:-translate-y-2 hover:border-blue-400/50 hover:bg-blue-500/20 hover:shadow-2xl"
                  >
                     <FaRegEdit className="mb-4 text-5xl text-blue-300" aria-hidden="true" />

                     <h2 className="mb-2 text-2xl font-bold text-white">Fill Out Report</h2>

                     <p className="text-slate-300">Complete and submit your daily report.</p>

                     <div className="mt-6 flex items-center gap-1 font-semibold text-blue-300 transition-transform group-hover:translate-x-2">
                        Start Report
                        <IoIosArrowForward aria-hidden="true" />
                     </div>
                  </Link>

                  {/* Results */}
                  <Link
                     href="/results"
                     className="group cursor-pointer rounded-2xl border border-purple-400/20 bg-purple-500/10 p-8 text-left transition-all duration-300 hover:-translate-y-2 hover:border-purple-400/50 hover:bg-purple-500/20 hover:shadow-2xl"
                  >
                     <FaChartBar className="mb-4 text-5xl text-purple-300" aria-hidden="true" />

                     <h2 className="mb-2 text-2xl font-bold text-white">View Results</h2>

                     <p className="text-slate-300">
                        Access submitted reports and past test results.
                     </p>

                     <div className="mt-6 flex items-center gap-1 font-semibold text-purple-300 transition-transform group-hover:translate-x-2">
                        Open Results
                        <IoIosArrowForward aria-hidden="true" />
                     </div>
                  </Link>
                  {/* Options */}
                  <Link
                     href="/options"
                     className="group cursor-pointer rounded-2xl border border-amber-400/20 bg-amber-500/10 p-8 text-left transition-all duration-300 hover:-translate-y-2 hover:border-amber-400/50 hover:bg-amber-500/20 hover:shadow-2xl"
                  >
                     <IoIosSettings className="mb-4 text-6xl text-amber-300" aria-hidden="true" />

                     <h2 className="mb-2 text-2xl font-bold text-white">Administration</h2>

                     <p className="text-slate-300">
                        Manage users, clusters, and scheduling options.
                     </p>

                     <div className="mt-6 flex items-center gap-1 font-semibold text-amber-300 transition-transform group-hover:translate-x-2">
                        Open Administration
                        <IoIosArrowForward aria-hidden="true" />
                     </div>
                  </Link>

                  {/* Overview */}
                  <Link
                     href="/overview"
                     className="group cursor-pointer rounded-2xl border border-pink-400/20 bg-pink-500/10 p-8 text-left transition-all duration-300 hover:-translate-y-2 hover:border-pink-400/50 hover:bg-pink-500/20 hover:shadow-2xl"
                  >
                     <GrOverview className="mb-4 text-6xl text-pink-300" aria-hidden="true" />

                     <h2 className="mb-2 text-2xl font-bold text-white">Overview</h2>

                     <p className="text-slate-300">View a break down of a days reports.</p>

                     <div className="mt-6 flex items-center gap-1 font-semibold text-pink-300 transition-transform group-hover:translate-x-2">
                        Open Overview
                        <IoIosArrowForward aria-hidden="true" />
                     </div>
                  </Link>
               </div>
            </div>
         </div>
      </main>
   );
}
