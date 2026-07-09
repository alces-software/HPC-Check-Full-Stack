'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from '@headlessui/react';
import { FaDatabase, FaUser } from 'react-icons/fa';
import { IoIosArrowForward } from 'react-icons/io';
import DatePicker from 'react-datepicker';
import { FaCalendarAlt } from 'react-icons/fa';

function dateToInputValue(date) {
   if (!date) return '';

   const year = date.getFullYear();
   const month = String(date.getMonth() + 1).padStart(2, '0');
   const day = String(date.getDate()).padStart(2, '0');

   return `${year}-${month}-${day}`;
}

function inputValueToDate(value) {
   if (!value) return null;

   const [year, month, day] = value.split('-').map(Number);

   return new Date(year, month - 1, day);
}

function addDays(date, days) {
   if (!date) return null;

   const nextDate = new Date(date);
   nextDate.setDate(nextDate.getDate() + days);

   return nextDate;
}

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

   function resetResults() {
      setPage(1);
      setReports([]);
      setPagination(null);
   }

   function handleModeChange(nextMode) {
      if (nextMode === mode) return;

      setMode(nextMode);
      resetResults();
      setStartDate('');
      setEndDate('');

      if (nextMode === 'week') {
         setSelectedClusterId(null);
      }
   }

   function handleClusterChange(clusterId) {
      setSelectedClusterId(clusterId);
      resetResults();
      setStartDate('');
      setEndDate('');
   }

   function handleClusterStartDateChange(date) {
      setStartDate(dateToInputValue(date));
      setPage(1);
   }

   function handleClusterEndDateChange(date) {
      setEndDate(dateToInputValue(date));
      setPage(1);
   }

   function handleWeekStartDateChange(date) {
      setStartDate(dateToInputValue(date));
      setEndDate(dateToInputValue(addDays(date, 6)));
      setPage(1);
   }

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
         <div className="relative z-10 w-full ">
            <div className=" p-10">
               {/* HEADER */}
               <div className="mb-10 text-left">
                  <h1 className="text-4xl sm:text-5xl font-bold text-white">Report Explorer </h1>

                  <p className="mt-3 text-lg text-slate-300">Find reports by cluster or by week.</p>
               </div>

               {/* MODE TOGGLE */}
               <div className="mb-8 flex justify-center">
                  <div className="inline-flex items-center gap-5 rounded-2xl px-4 py-3 backdrop-blur-sm  sm:px-8 sm:py-4">
                     <button
                        onClick={() => handleModeChange('cluster')}
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
                        onClick={() => handleModeChange('week')}
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

               {mode === 'cluster' ? (
                  <div className="flex inline-flex gap-4">
                     <div className="grid grid-cols-1 gap-6 lg:grid-cols-[18rem_1fr]">
                        {/* Cluster */}
                        <div>
                           <label className="mb-2 ml-2 block text-md text-white">
                              <strong>Cluster:</strong>
                           </label>

                           <Listbox value={selectedClusterId} onChange={handleClusterChange}>
                              <div className="relative w-72">
                                 <ListboxButton className="w-full cursor-pointer rounded-full border border-white/10 bg-slate-900 px-4 py-3 text-left text-white">
                                    <span>{selectedCluster?.name ?? 'Select a cluster...'}</span>

                                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                                       ▼
                                    </span>
                                 </ListboxButton>

                                 <ListboxOptions className="absolute z-20 mt-2 max-h-60 w-full overflow-auto rounded-xl bg-slate-900 p-1 shadow-xl">
                                    {clusters
                                       .filter((c) => c.name)
                                       .map((cluster) => (
                                          <ListboxOption
                                             key={cluster.id}
                                             value={cluster.id}
                                             className="cursor-pointer rounded-lg px-4 py-2 text-white data-focus:bg-blue-500/20 data-selected:bg-blue-500/30"
                                          >
                                             {cluster.name}
                                          </ListboxOption>
                                       ))}
                                 </ListboxOptions>
                              </div>
                           </Listbox>
                        </div>

                        {/* Date range */}
                        <div>
                           <label className="mb-2 ml-2 block text-md text-white">
                              <strong>Date range</strong>
                              <em> (Optional):</em>
                           </label>

                           <div className="flex items-end gap-1">
                              <div className="w-full">
                                 <div className="relative">
                                    <DatePicker
                                       selected={inputValueToDate(startDate)}
                                       onChange={handleClusterStartDateChange}
                                       dateFormat="dd/MM/yyyy"
                                       placeholderText="Start date"
                                       className="w-full rounded-full cursor-pointer border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                                       calendarClassName="results-datepicker"
                                       popperClassName="z-50"
                                    />
                                    <FaCalendarAlt className="pointer-events-none absolute right-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                 </div>
                              </div>

                              <div className="w-full">
                                 <div className="relative">
                                    <DatePicker
                                       selected={inputValueToDate(endDate)}
                                       onChange={handleClusterEndDateChange}
                                       dateFormat="dd/MM/yyyy"
                                       placeholderText="End date"
                                       minDate={inputValueToDate(startDate)}
                                       className="w-full cursor-pointer rounded-full border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                                       calendarClassName="results-datepicker"
                                       popperClassName="z-50"
                                    />

                                    <FaCalendarAlt className="pointer-events-none absolute right-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               ) : (
                  <>
                     <p className="text-slate-300">
                        Select a start date and get all results for the next 7 days:
                     </p>

                     <div className="flex mt-4 inline-flex gap-4">
                        <div className="grid grid-cols-1">
                           <div>
                              <div className="flex items-end gap-1">
                                 <div className="w-full">
                                    <div className="relative">
                                       <DatePicker
                                          selected={inputValueToDate(startDate)}
                                          onChange={handleWeekStartDateChange}
                                          dateFormat="dd/MM/yyyy"
                                          placeholderText="Start date"
                                          className="w-full rounded-full cursor-pointer border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                                          calendarClassName="results-datepicker"
                                          popperClassName="z-50"
                                       />
                                       <FaCalendarAlt className="pointer-events-none absolute right-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    </div>
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>
                  </>
               )}

               {/* LOADING */}
               {loading && <p className="mt-8 text-center text-slate-300">Loading reports...</p>}

               {/* EMPTY STATE */}
               {!loading && reports.length === 0 && (
                  <p className="mt-8 text-center text-slate-400">No reports found</p>
               )}

               {/* RESULTS */}
               <div className="mt-8 space-y-5 sm:space-y-6">
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
                                       'group w-full text-left',
                                       'rounded-3xl border px-3 py-3 sm:px-4 sm:py-4',
                                       'transition-all duration-200',
                                       'cursor-pointer hover:-translate-y-[1px] hover:shadow-lg',
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
                                                'mt-1 h-3 w-3 shrink-0 rounded-full',
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
                                                      'rounded-full border px-2 py-0.5 text-[11px]',
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
                                                   <span className="inline-flex max-w-full items-center gap-2 px-3 py-1 text-sm font-medium text-white">
                                                      <FaDatabase
                                                         className="shrink-0 text-emerald-300"
                                                         aria-hidden="true"
                                                      />
                                                      <span className="min-w-0 break-words">
                                                         {r.cluster || 'Unknown'}
                                                      </span>
                                                   </span>
                                                )}

                                                <span className="inline-flex max-w-full items-center gap-2 rounded-lg px-3 py-1 text-sm font-medium text-white">
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
                                          <span className="transition group-hover:translate-x-0.5">
                                             <IoIosArrowForward aria-hidden="true" />
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
