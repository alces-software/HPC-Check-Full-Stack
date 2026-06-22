'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from '@headlessui/react';

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
      <main className="flex justify-center">
         <div className="w-full max-w-5xl rounded-3xl border border-white/10 bg-white/10 p-10 shadow-2xl backdrop-blur-xl">
            {/* HEADER */}
            <div className="text-center mb-10">
               <div className="text-5xl mb-4">📊</div>
               <h1 className="text-5xl font-bold text-white">Report Explorer</h1>
               <p className="text-slate-300 mt-2">Cluster or weekly report view</p>
            </div>

            {/* MODE TOGGLE */}
            <div className="flex justify-center mb-8">
               <div className="flex items-center gap-1 rounded-2xl border border-white/10 bg-white/5 p-1 backdrop-blur-xl">
                  <button
                     onClick={() => setMode('cluster')}
                     className={[
                        'px-4 py-2 rounded-xl text-sm transition cursor-pointer',
                        mode === 'cluster'
                           ? 'bg-white/10 text-white'
                           : 'text-slate-400 hover:text-white hover:bg-white/5'
                     ].join(' ')}
                  >
                     Cluster
                  </button>

                  <button
                     onClick={() => setMode('week')}
                     className={[
                        'px-4 py-2 rounded-xl text-sm transition cursor-pointer',
                        mode === 'week'
                           ? 'bg-white/10 text-white'
                           : 'text-slate-400 hover:text-white hover:bg-white/5'
                     ].join(' ')}
                  >
                     Weekly
                  </button>
               </div>
            </div>

            {/* WEEK DATE RANGE */}
            {mode === 'week' && (
               <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
                  <div className="mb-4 flex items-center justify-between">
                     <div>
                        <h3 className="text-white font-medium">Custom Date Range</h3>
                        <p className="text-xs text-slate-400 mt-1">
                           Leave empty to use the current week.
                        </p>
                     </div>

                     {(startDate || endDate) && (
                        <button
                           onClick={() => {
                              setStartDate('');
                              setEndDate('');
                           }}
                           className="rounded-lg border border-white/10 px-3 py-1 text-xs text-slate-300 hover:bg-white/5 hover:text-white transition"
                        >
                           Reset
                        </button>
                     )}
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                     <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full rounded-xl border border-slate-600 bg-slate-800/80 px-4 py-3 text-white"
                     />

                     <input
                        type="date"
                        value={endDate}
                        min={startDate || undefined}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full rounded-xl border border-slate-600 bg-slate-800/80 px-4 py-3 text-white"
                     />
                  </div>
               </div>
            )}

            {/* CLUSTER DATE RANGE (NEW BUT MATCHING STYLE) */}
            {mode === 'cluster' && (
               <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
                  <div className="mb-4">
                     <h3 className="text-white font-medium">Cluster Date Range (optional)</h3>
                     <p className="text-xs text-slate-400 mt-1">
                        Filter cluster reports by date range
                     </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                     <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full rounded-xl border border-slate-600 bg-slate-800/80 px-4 py-3 text-white"
                     />

                     <input
                        type="date"
                        value={endDate}
                        min={startDate || undefined}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full rounded-xl border border-slate-600 bg-slate-800/80 px-4 py-3 text-white"
                     />
                  </div>
               </div>
            )}

            {/* CLUSTER SELECT */}
            <div className="mb-6">
               <label className="mb-2 block text-sm text-slate-200">Cluster</label>

               <div className={mode === 'week' ? 'opacity-40 pointer-events-none' : ''}>
                  <Listbox value={selectedClusterId} onChange={setSelectedClusterId}>
                     <div className="relative">
                        <ListboxButton className="w-full cursor-pointer rounded-xl border border-slate-600 bg-slate-800/80 px-4 py-3 text-left text-white backdrop-blur-md outline-none transition hover:border-white/20 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30">
                           {selectedCluster?.name || 'Select a cluster...'}

                           <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                              ▼
                           </span>
                        </ListboxButton>

                        <ListboxOptions className="absolute z-50 mt-2 max-h-60 w-full overflow-auto rounded-xl border border-white/10 bg-slate-900/95 backdrop-blur-xl shadow-2xl">
                           {clusters.map((c) => (
                              <ListboxOption
                                 key={c.id}
                                 value={c.id}
                                 className="cursor-pointer px-4 py-3 text-white transition data-[active]:bg-blue-500/20 data-[selected]:font-semibold"
                              >
                                 {c.name}
                              </ListboxOption>
                           ))}
                        </ListboxOptions>
                     </div>
                  </Listbox>
               </div>
            </div>

            {/* LOADING */}
            {loading && <p className="text-center text-slate-300">Loading reports...</p>}

            {/* EMPTY STATE */}
            {!loading && reports.length === 0 && (
               <p className="text-center text-slate-400">No reports found</p>
            )}

            {/* RESULTS (UNCHANGED STYLING) */}
            <div className="space-y-6">
               {Object.entries(grouped).map(([date, items]) => (
                  <div
                     key={date}
                     className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden"
                  >
                     <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 bg-white/5">
                        <h2 className="text-white font-semibold tracking-wide">{date}</h2>

                        <span className="text-xs text-slate-300 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
                           {items.length} reports
                        </span>
                     </div>

                     <div className="p-4 space-y-2">
                        {items.map((r) => {
                           const passed = r.passed;

                           return (
                              <button
                                 key={r.id}
                                 onClick={() => router.push(`/report?id=${r.id}`)}
                                 className={[
                                    'w-full group text-left',
                                    'rounded-xl border px-4 py-4',
                                    'transition-all duration-200',
                                    'hover:shadow-lg hover:-translate-y-[1px] cursor-pointer',
                                    'active:scale-[0.99]',
                                    passed
                                       ? 'border-green-400/30 bg-green-500/20'
                                       : 'border-red-400/30 bg-red-500/20'
                                 ].join(' ')}
                              >
                                 <div className="flex items-start justify-between gap-4">
                                    <div className="flex gap-3">
                                       <div
                                          className={[
                                             'mt-1 h-3 w-3 rounded-full shrink-0',
                                             passed ? 'bg-green-400' : 'bg-red-400'
                                          ].join(' ')}
                                       />

                                       <div className="space-y-1">
                                          <div className="flex items-center gap-2">
                                             <span className="text-white font-medium">
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
                                                <span className="rounded-lg border border-slate-600 bg-slate-800/80 px-3 py-1 text-sm font-medium text-white">
                                                   🗄️ {r.cluster || 'Unknown'}
                                                </span>
                                             )}

                                             <span className="rounded-lg border border-slate-600 bg-slate-800/80 px-3 py-1 text-sm font-medium text-white">
                                                👤 {r.person || 'Unknown'}
                                             </span>
                                          </div>
                                       </div>
                                    </div>

                                    <div className="text-xs text-slate-300 group-hover:text-white flex items-center gap-1 transition">
                                       <span className="opacity-0 group-hover:opacity-100 transition">
                                          Open
                                       </span>
                                       <span className="group-hover:translate-x-0.5 transition">
                                          →
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
               <div className="flex items-center justify-between mt-10 text-white">
                  <button
                     disabled={!pagination.hasPrevPage}
                     onClick={() => setPage((p) => Math.max(p - 1, 1))}
                     className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 disabled:opacity-30 hover:bg-white/10 transition"
                  >
                     ← Previous
                  </button>

                  <div className="text-sm text-slate-300">
                     Page {pagination.page} of {pagination.totalPages}
                  </div>

                  <button
                     disabled={!pagination.hasNextPage}
                     onClick={() => setPage((p) => p + 1)}
                     className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 disabled:opacity-30 hover:bg-white/10 transition"
                  >
                     Next →
                  </button>
               </div>
            )}
         </div>
      </main>
   );
}
