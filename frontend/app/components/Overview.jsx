'use client';

import { GrOverview } from 'react-icons/gr';
import { useState, useEffect } from 'react';

export default function Overview() {
   const [date, setDate] = useState('');
   const [report, setReport] = useState({});
   const [reportLoaded, setReportLoaded] = useState(false);

   // Get initial overview report
   useEffect(() => {
      async function loadReport() {
         try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/report/overview`);
            const data = await res.json();
            setReport(data?.body ?? {});
         } catch (error) {
            console.error(error);
            setReport({});
         } finally {
            setReportLoaded(true);
         }
      }

      loadReport();
   }, []);

   // Get different report when date is changed
   useEffect(() => {
      async function loadReportFromDate() {
         setReportLoaded(false);
         setReport({});

         try {
            const res = await fetch(
               `${process.env.NEXT_PUBLIC_API_URL}/report/overview` +
                  `?${new URLSearchParams({
                     date: date
                  }).toString()}`
            );
            const data = await res.json();
            setReport(data?.body ?? {});
         } catch (error) {
            console.error(error);
            setReport({});
         } finally {
            setReportLoaded(true);
         }
      }

      loadReportFromDate();
   }, [date]);

   // Calculate duration
   function calculateDuration(start, end) {
      const diffMs = end.getTime() - start.getTime();

      const hours = Math.floor(diffMs / 1000 / 60 / 60);
      const minutes = Math.floor((diffMs / 1000 / 60) % 60);
      const seconds = Math.floor((diffMs / 1000) % 60);

      return `${hours}h ${minutes}m ${seconds}s`;
   }

   // Show loading
   if (!reportLoaded) {
      return (
         <main className="flex min-h-screen items-center justify-center text-white">
            Loading overview...
         </main>
      );
   }

   // Page
   return (
      <main className="flex justify-center space-y-8">
         <div className="relative z-10 w-full max-w-6xl">
            <div className="rounded-3xl border border-white/10 bg-white/10 p-10 shadow-2xl backdrop-blur-xl">
               {/* Header */}
               <div className="mb-10 text-center">
                  <div className="mb-4 flex justify-center">
                     <GrOverview className="h-25 w-25 text-pink-300" aria-hidden="true" />
                  </div>

                  <h1 className="text-4xl sm:text-5xl font-bold text-white">Reports Overview</h1>

                  <p className="mt-3 text-lg text-slate-300">
                     View a break down of a days reports.
                  </p>
               </div>

               {/* Day picker */}
               <div className="mb-6 overflow-hidden rounded-2xl border border-white/10 p-4 backdrop-blur-sm sm:p-5">
                  <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                     <div>
                        <h3 className="font-medium text-white">Custom Date Range</h3>
                        <p className="mt-1 text-xs text-slate-400">
                           Leave empty to use the current week.
                        </p>
                     </div>

                     {date && (
                        <button
                           onClick={() => {
                              setDate('');
                           }}
                           className="w-full rounded-lg border border-white/10 px-3 py-1.5 text-xs text-slate-300 transition hover:bg-white/5 hover:text-white sm:w-auto sm:py-1"
                        >
                           Reset
                        </button>
                     )}
                  </div>

                  <div className="relative min-w-0 max-w-full">
                     <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className={`block w-full min-w-0 max-w-[15rem] rounded-lg border border-slate-600 bg-slate-800/80 px-2.5 py-2 text-xs [color-scheme:dark] sm:max-w-full sm:rounded-xl sm:px-4 sm:py-3 sm:text-base ${
                           date ? 'text-white' : 'text-transparent sm:text-white'
                        }`}
                     />
                     {!date && (
                        <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 sm:hidden">
                           Start date
                        </span>
                     )}
                  </div>
               </div>

               {/* Body */}
               <div className="mb-6 overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm sm:p-6">
                  {!report.id ? (
                     <p className="flex items-center justify-center text-white">
                        No overview to available
                     </p>
                  ) : (
                     <div>
                        <h1 className="mb-4 text-3xl font-bold text-white md:text-4xl">
                           Breakdown
                        </h1>

                        <h2 className="mb-4 border-t border-white/10 pt-4 text-lg font-semibold text-white md:text-2xl">
                           Completed checks
                        </h2>

                        {report.reports.length > 0 ? (
                           <div className="space-y-4">
                              {report.reports.map((element) => (
                                 <div
                                    key={element.id}
                                    className="rounded-xl border border-white/10 bg-slate-800/70 p-4 shadow-sm transition"
                                 >
                                    <div className="flex flex-col gap-3 sm:grid sm:grid-cols-4 sm:items-center">
                                       {/* Status */}
                                       <div>
                                          <span
                                             className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                                                element.passed
                                                   ? 'border-green-400/30 bg-green-500/20 text-green-300'
                                                   : 'border-red-400/30 bg-red-500/20 text-red-300'
                                             }`}
                                          >
                                             {element.passed ? 'Passed' : 'Failed'}
                                          </span>
                                       </div>

                                       {/* Cluster */}
                                       <div className="text-sm text-white sm:text-base">
                                          <span className="block text-xs uppercase text-slate-400">
                                             Cluster
                                          </span>
                                          {element.cluster}
                                       </div>

                                       {/* Person */}
                                       <div className="text-sm text-white sm:text-base">
                                          <span className="block text-xs uppercase text-slate-400">
                                             Person
                                          </span>
                                          {element.person}
                                       </div>

                                       {/* Timestamp */}
                                       <div className="text-sm text-white sm:text-base">
                                          <span className="block text-xs uppercase text-slate-400">
                                             Duration
                                          </span>
                                          {calculateDuration(
                                             new Date(element.startDate),
                                             new Date(element.endDate)
                                          )}
                                       </div>
                                    </div>

                                    {/* Results */}
                                    {element.results.length > 0 && (
                                       <div className="mt-5 space-y-3 border-t border-white/10 pt-4">
                                          {element.results.map((result) => (
                                             <div
                                                key={`${result.instructionId}`}
                                                className="rounded-lg border border-white/10 bg-slate-900/40 p-3 transition"
                                             >
                                                <div className="mb-2 flex items-start justify-between gap-3">
                                                   <h3 className="text-sm font-semibold text-white sm:text-base">
                                                      {result.title}
                                                   </h3>

                                                   <span
                                                      className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${
                                                         result.passed
                                                            ? 'border-green-400/30 bg-green-500/20 text-green-300'
                                                            : 'border-red-400/30 bg-red-500/20 text-red-300'
                                                      }`}
                                                   >
                                                      {result.passed ? 'Passed' : 'Failed'}
                                                   </span>
                                                </div>

                                                <p className="block text-xs uppercase text-slate-400">
                                                   Notes:
                                                </p>
                                                <p className="break-words text-sm leading-relaxed text-slate-300">
                                                   {result.note}
                                                </p>
                                             </div>
                                          ))}
                                       </div>
                                    )}
                                 </div>
                              ))}
                           </div>
                        ) : (
                           <p className="flex items-center justify-center text-white">
                              No completed reports
                           </p>
                        )}

                        <h2 className="mb-4 mt-4 border-t border-white/10 pt-4 text-lg font-semibold text-white md:text-2xl">
                           Missing checks
                        </h2>

                        {report.missing.length === 0 ? (
                           <p className="flex items-center justify-center text-white">
                              All reports completed
                           </p>
                        ) : (
                           <div className="space-y-4">
                              {report.missing.map((element) => (
                                 <div
                                    key={element.clusterId}
                                    className="rounded-xl border border-white/10 bg-slate-800/70 p-4 shadow-sm transition hover:bg-slate-800/90"
                                 >
                                    <div className="flex flex-col gap-4 sm:grid sm:grid-cols-3 sm:items-center">
                                       {/* Status */}
                                       <div>
                                          <span className="inline-flex rounded-full border border-yellow-400/30 bg-yellow-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-yellow-300">
                                             Missing
                                          </span>
                                       </div>

                                       {/* Cluster */}
                                       <div className="text-sm text-white sm:text-base">
                                          <span className="block text-xs uppercase text-slate-400">
                                             Cluster
                                          </span>
                                          {element.cluster}
                                       </div>

                                       {/* Person */}
                                       <div className="text-sm text-white sm:text-base">
                                          <span className="block text-xs uppercase text-slate-400">
                                             Person
                                          </span>
                                          {element.person}
                                       </div>
                                    </div>
                                 </div>
                              ))}
                           </div>
                        )}
                     </div>
                  )}
               </div>
            </div>
         </div>
      </main>
   );
}
