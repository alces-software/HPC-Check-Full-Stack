'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from '@headlessui/react';
import { FaChartBar, FaDatabase, FaUser } from 'react-icons/fa';
import { IoIosArrowForward } from 'react-icons/io';

export default function ResultsPage() {
   const router = useRouter();

   const [clusters, setClusters] = useState([]);
   const [clustersLoaded, setClustersLoaded] = useState(false);

   const [selectedClusterId, setSelectedClusterId] = useState(null);

   const [reports, setReports] = useState([]);
   const [loading, setLoading] = useState(false);

   const [page, setPage] = useState(1);
   const [pagination, setPagination] = useState(null);

   const [mode, setMode] = useState('cluster'); // cluster | week

   const [startDate, setStartDate] = useState('');
   const [endDate, setEndDate] = useState('');

   // ----------------------------
   // Load clusters
   // ----------------------------
   useEffect(() => {
      async function loadClusters() {
         try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/hpc`);
            const data = await res.json();
            setClusters(data?.body ?? []);
         } catch (err) {
            console.error(err);
            setClusters([]);
         } finally {
            setClustersLoaded(true);
         }
      }

      loadClusters();
   }, []);

   // ----------------------------
   // Reset when switching MODE
   // ----------------------------
   useEffect(() => {
      setPage(1);
      setReports([]);
      setPagination(null);

      if (mode === 'week') {
         setSelectedClusterId(null);
         setStartDate('');
         setEndDate('');
      }

      if (mode === 'cluster') {
         setStartDate('');
         setEndDate('');
      }
   }, [mode]);

   // ----------------------------
   // Reset when switching cluster
   // ----------------------------
   useEffect(() => {
      if (mode === 'cluster') {
         setPage(1);
         setReports([]);
         setPagination(null);
         setStartDate('');
         setEndDate('');
      }
   }, [mode, selectedClusterId]);

   // ----------------------------
   // Reset page when date changes
   // ----------------------------
   useEffect(() => {
      setPage(1);
   }, [startDate, endDate, mode]);

   // ----------------------------
   // Fetch reports
   // ----------------------------
   useEffect(() => {
      async function loadReports() {
         if (mode === 'cluster' && !selectedClusterId) return;

         setLoading(true);

         try {
            let url = '';

            if (mode === 'week') {
               const params = new URLSearchParams({
                  page: String(page),
                  limit: '20'
               });

               if (startDate && endDate) {
                  params.append('start', startDate);
                  params.append('end', endDate);
               }

               url = `${process.env.NEXT_PUBLIC_API_URL}/report/week?${params.toString()}`;
            } else {
               const params = new URLSearchParams({
                  page: String(page),
                  limit: '20'
               });

               if (startDate && endDate) {
                  params.append('start', startDate);
                  params.append('end', endDate);
               }

               url =
                  `${process.env.NEXT_PUBLIC_API_URL}/report/cluster/${selectedClusterId}` +
                  `?${params.toString()}`;
            }

            const res = await fetch(url);
            const data = await res.json();

            setReports(data?.body ?? []);
            setPagination(data?.pagination ?? null);
         } catch (err) {
            console.error(err);
            setReports([]);
            setPagination(null);
         } finally {
            setLoading(false);
         }
      }

      loadReports();
   }, [selectedClusterId, page, mode, startDate, endDate]);

   // ----------------------------
   // Group by date
   // ----------------------------
   const grouped = useMemo(() => {
      const map = {};

      for (const r of reports ?? []) {
         const key = new Date(r.startDate).toLocaleDateString('en-GB');

         if (!map[key]) map[key] = [];
         map[key].push(r);
      }

      return map;
   }, [reports]);

   const selectedCluster = useMemo(() => {
      return clusters.find((c) => String(c.id) === String(selectedClusterId));
   }, [clusters, selectedClusterId]);

   if (!clustersLoaded) {
      return (
         <main className="flex min-h-screen items-center justify-center text-white">
            Loading clusters...
         </main>
      );
   }

   return (
      <main className="flex justify-center space-y-8">
         <div className="relative z-10 w-full max-w-6xl">
            <div className="rounded-3xl border border-white/10 bg-white/10 p-10 shadow-2xl backdrop-blur-xl">
               {/* HEADER */}
               <div className="mb-10 text-center">
                  <div className="mb-4 flex justify-center">
                     <FaChartBar className="h-25 w-25 text-purple-300" aria-hidden="true" />
                  </div>

                  <h1 className="text-4xl sm:text-5xl font-bold text-white">Report Explorer</h1>

                  <p className="mt-3 text-lg text-slate-300">Cluster or weekly report view</p>
               </div>

               {/* MODE TOGGLE */}
               <div className="mb-8 flex justify-center">
                  <div className="inline-flex items-center gap-4 rounded-2xl px-4 py-3 backdrop-blur-sm sm:gap-5 sm:px-8 sm:py-4">
                     <button
                        onClick={() => setMode('cluster')}
                        className={[
                           'cursor-pointer border-b-2 pb-2 text-sm font-semibold tracking-wide transition',
                           mode === 'cluster'
                              ? 'border-blue-400 text-white'
                              : 'border-transparent text-slate-400 hover:text-white'
                        ].join(' ')}
                     >
                        Cluster
                     </button>

                     <button
                        onClick={() => setMode('week')}
                        className={[
                           'cursor-pointer border-b-2 pb-2 text-sm font-semibold tracking-wide transition',
                           mode === 'week'
                              ? 'border-blue-400 text-white'
                              : 'border-transparent text-slate-400 hover:text-white'
                        ].join(' ')}
                     >
                        Weekly
                     </button>
                  </div>
               </div>

               {/* WEEK DATE RANGE */}
               {mode === 'week' && (
                  <div className="mb-6 overflow-hidden rounded-2xl border border-white/10 p-4 backdrop-blur-sm sm:p-5">
                     <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                           <h3 className="font-medium text-white">Custom Date Range</h3>
                           <p className="mt-1 text-xs text-slate-400">
                              Leave empty to use the current week.
                           </p>
                        </div>

                        {(startDate || endDate) && (
                           <button
                              onClick={() => {
                                 setStartDate('');
                                 setEndDate('');
                              }}
                              className="w-full rounded-lg border border-white/10 px-3 py-1.5 text-xs text-slate-300 transition hover:bg-white/5 hover:text-white sm:w-auto sm:py-1"
                           >
                              Reset
                           </button>
                        )}
                     </div>

                     <div className="grid min-w-0 gap-3 sm:gap-4 md:grid-cols-2">
                        <div className="relative min-w-0 max-w-full">
                           <input
                              type="date"
                              value={startDate}
                              onChange={(e) => setStartDate(e.target.value)}
                              className={`block w-full min-w-0 max-w-[15rem] rounded-lg border border-slate-600 bg-slate-800/80 px-2.5 py-2 text-xs [color-scheme:dark] sm:max-w-full sm:rounded-xl sm:px-4 sm:py-3 sm:text-base ${
                                 startDate ? 'text-white' : 'text-transparent sm:text-white'
                              }`}
                           />
                           {!startDate && (
                              <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 sm:hidden">
                                 Start date
                              </span>
                           )}
                        </div>

                        <div className="relative min-w-0 max-w-full">
                           <input
                              type="date"
                              value={endDate}
                              min={startDate || undefined}
                              onChange={(e) => setEndDate(e.target.value)}
                              className={`block w-full min-w-0 max-w-[15rem] rounded-lg border border-slate-600 bg-slate-800/80 px-2.5 py-2 text-xs [color-scheme:dark] sm:max-w-full sm:rounded-xl sm:px-4 sm:py-3 sm:text-base ${
                                 endDate ? 'text-white' : 'text-transparent sm:text-white'
                              }`}
                           />
                           {!endDate && (
                              <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 sm:hidden">
                                 End date
                              </span>
                           )}
                        </div>
                     </div>
                  </div>
               )}

               {/* CLUSTER DATE RANGE (NEW BUT MATCHING STYLE) */}
               {mode === 'cluster' && (
                  <div className="mb-6 overflow-hidden rounded-2xl border border-white/10 p-4 backdrop-blur-sm sm:p-5">
                     <div className="mb-4">
                        <h3 className="font-medium text-white">Cluster Date Range (optional)</h3>
                        <p className="mt-1 text-xs text-slate-400">
                           Filter cluster reports by date range
                        </p>
                     </div>

                     <div className="grid min-w-0 gap-3 sm:gap-4 md:grid-cols-2">
                        <div className="relative min-w-0 max-w-full">
                           <input
                              type="date"
                              value={startDate}
                              onChange={(e) => setStartDate(e.target.value)}
                              className={`block w-full min-w-0 max-w-[15rem] rounded-lg border border-slate-600 bg-slate-800/80 px-2.5 py-2 text-xs [color-scheme:dark] sm:max-w-full sm:rounded-xl sm:px-4 sm:py-3 sm:text-base ${
                                 startDate ? 'text-white' : 'text-transparent sm:text-white'
                              }`}
                           />
                           {!startDate && (
                              <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 sm:hidden">
                                 Start date
                              </span>
                           )}
                        </div>

                        <div className="relative min-w-0 max-w-full">
                           <input
                              type="date"
                              value={endDate}
                              min={startDate || undefined}
                              onChange={(e) => setEndDate(e.target.value)}
                              className={`block w-full min-w-0 max-w-[15rem] rounded-lg border border-slate-600 bg-slate-800/80 px-2.5 py-2 text-xs [color-scheme:dark] sm:max-w-full sm:rounded-xl sm:px-4 sm:py-3 sm:text-base ${
                                 endDate ? 'text-white' : 'text-transparent sm:text-white'
                              }`}
                           />
                           {!endDate && (
                              <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 sm:hidden">
                                 End date
                              </span>
                           )}
                        </div>
                     </div>
                  </div>
               )}

               {/* CLUSTER SELECT */}
               {mode === 'cluster' && (
                  <div className="mb-6">
                     <label className="mb-2 block text-sm text-slate-200">Cluster</label>

                     <Listbox value={selectedClusterId} onChange={setSelectedClusterId}>
                        <div className="relative">
                           <ListboxButton className="relative w-full cursor-pointer rounded-xl border border-slate-600 bg-slate-800/80 px-4 py-3 pr-10 text-left text-sm text-white backdrop-blur-md outline-none transition hover:border-white/20 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 sm:text-base">
                              <span className="block min-w-0 truncate">
                                 {selectedCluster?.name || 'Select a cluster...'}
                              </span>

                              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                                 ▼
                              </span>
                           </ListboxButton>

                           <ListboxOptions className="relative z-20 mt-2 max-h-40 w-full overflow-y-auto overflow-x-hidden rounded-xl border border-white/10 bg-slate-900/95 backdrop-blur-xl shadow-2xl sm:absolute sm:left-0 sm:right-0 sm:z-50 sm:max-h-60">
                              {clusters.map((c) => (
                                 <ListboxOption
                                    key={c.id}
                                    value={c.id}
                                    className="cursor-pointer whitespace-normal break-words px-3 py-2 text-sm text-white transition data-[active]:bg-blue-500/20 data-[selected]:font-semibold sm:px-4 sm:py-3 sm:text-base"
                                 >
                                    {c.name}
                                 </ListboxOption>
                              ))}
                           </ListboxOptions>
                        </div>
                     </Listbox>
                  </div>
               )}

               {/* LOADING */}
               {loading && <p className="text-center text-slate-300">Loading reports...</p>}

               {/* EMPTY STATE */}
               {!loading && reports.length === 0 && (
                  <p className="text-center text-slate-400">No reports found</p>
               )}

               {/* RESULTS */}
               <div className="space-y-5 sm:space-y-6">
                  {Object.entries(grouped).map(([date, items]) => (
                     <div
                        key={date}
                        className="overflow-hidden rounded-2xl border border-white/10 backdrop-blur-sm"
                     >
                        <div className="flex flex-col gap-2 border-b border-white/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                           <h2 className="font-semibold tracking-wide text-white">{date}</h2>

                           <span className="w-fit rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300">
                              {items.length} report(s)
                           </span>
                        </div>

                        <div className="space-y-2 p-3 sm:p-4">
                           {items.map((r) => {
                              const passed = r.passed;

                              return (
                                 <button
                                    key={r.id}
                                    onClick={() => router.push(`/report?id=${r.id}`)}
                                    className={[
                                       'w-full group text-left',
                                       'rounded-xl border px-3 py-3 sm:px-4 sm:py-4',
                                       'transition-all duration-200',
                                       'hover:shadow-lg hover:-translate-y-[1px] cursor-pointer',
                                       'active:scale-[0.99]',
                                       passed
                                          ? 'border-green-400/30 bg-green-500/20'
                                          : 'border-red-400/30 bg-red-500/20'
                                    ].join(' ')}
                                 >
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                                       <div className="flex min-w-0 gap-3">
                                          <div
                                             className={[
                                                'mt-1 h-3 w-3 rounded-full shrink-0',
                                                passed ? 'bg-green-400' : 'bg-red-400'
                                             ].join(' ')}
                                          />

                                          <div className="min-w-0 space-y-1">
                                             <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
                                                <span className="break-all text-sm font-medium text-white sm:text-base">
                                                   Report #{r.id}
                                                </span>

                                                <span
                                                   className={[
                                                      'text-[11px] px-2 py-0.5 rounded-full border',
                                                      passed
                                                         ? 'border-green-400/30 bg-green-500/20 text-green-300'
                                                         : 'border-red-400/30 bg-red-500/20 text-red-300'
                                                   ].join(' ')}
                                                >
                                                   {passed ? 'Passed' : 'Failed'}
                                                </span>
                                             </div>

                                             <div className="mt-3 flex flex-wrap gap-2">
                                                {mode === 'week' && (
                                                   <span className="inline-flex max-w-full items-center gap-2 rounded-lg border border-slate-600 bg-slate-800/80 px-3 py-1 text-sm font-medium text-white">
                                                      <FaDatabase
                                                         className="shrink-0 text-emerald-300"
                                                         aria-hidden="true"
                                                      />
                                                      <span className="min-w-0 break-words">
                                                         {r.cluster || 'Unknown'}
                                                      </span>
                                                   </span>
                                                )}

                                                <span className="inline-flex max-w-full items-center gap-2 rounded-lg border border-slate-600 bg-slate-800/80 px-3 py-1 text-sm font-medium text-white">
                                                   <FaUser
                                                      className="shrink-0 text-blue-300"
                                                      aria-hidden="true"
                                                   />
                                                   <span className="min-w-0 break-words">
                                                      {r.person || 'Unknown'}
                                                   </span>
                                                </span>
                                             </div>
                                          </div>
                                       </div>

                                       <div className="flex items-center gap-1 self-end text-xs text-slate-300 transition group-hover:text-white sm:self-auto">
                                          <span className="opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
                                             Open
                                          </span>
                                          <span className="group-hover:translate-x-0.5 transition">
                                             <IoIosArrowForward></IoIosArrowForward>
                                          </span>
                                       </div>
                                    </div>
                                 </button>
                              );
                           })}
                        </div>
                     </div>
                  ))}
               </div>

               {/* PAGINATION */}
               {pagination && (
                  <div className="mt-10 flex flex-col items-stretch gap-3 text-white sm:flex-row sm:items-center sm:justify-between">
                     <button
                        disabled={!pagination.hasPrevPage}
                        onClick={() => setPage((p) => Math.max(p - 1, 1))}
                        className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 transition hover:bg-white/10 disabled:opacity-30 sm:w-auto"
                     >
                        <span className="flex items-center gap-1">
                           <IoIosArrowForward
                              className="rotate-180"
                              aria-hidden="true"
                           ></IoIosArrowForward>
                           Previous
                        </span>
                     </button>

                     <div className="text-center text-sm text-slate-300">
                        Page {pagination.page} of {pagination.totalPages}
                     </div>

                     <button
                        disabled={!pagination.hasNextPage}
                        onClick={() => setPage((p) => p + 1)}
                        className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 transition hover:bg-white/10 disabled:opacity-30 sm:w-auto"
                     >
                        <span className="flex items-center gap-1">
                           Next<IoIosArrowForward aria-hidden="true"></IoIosArrowForward>
                        </span>
                     </button>
                  </div>
               )}
            </div>
         </div>
      </main>
   );
}
