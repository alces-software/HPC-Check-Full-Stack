'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { IoSwapHorizontal } from 'react-icons/io5';
import { IoIosArrowForward, IoMdDoneAll } from 'react-icons/io';
import { BsThreeDots } from 'react-icons/bs';
import { IoCloseSharp } from 'react-icons/io5';

function formatDateParam(date) {
   const year = date.getFullYear();
   const month = String(date.getMonth() + 1).padStart(2, '0');
   const day = String(date.getDate()).padStart(2, '0');

   return `${year}-${month}-${day}`;
}

function getDayStartMs(date) {
   const dayStart = new Date(date);
   dayStart.setHours(0, 0, 0, 0);

   return dayStart.getTime();
}

export default function Schedule() {
   const [weekOffset, setWeekOffset] = useState(0);
   const [schedule, setSchedule] = useState(null);
   const [loading, setLoading] = useState(true);

   // Swap system
   const [swapTarget, setSwapTarget] = useState(null);
   const [selectedSwapPerson, setSelectedSwapPerson] = useState(null);

   const [teamCache, setTeamCache] = useState({});
   const [reportStatus, setReportStatus] = useState({});

   const weekBeginning = useMemo(() => {
      const today = new Date();
      const base = new Date(today);

      const day = base.getDay();
      const diff = day === 0 ? -6 : 1 - day;

      base.setDate(base.getDate() + diff + weekOffset * 7);
      return base;
   }, [weekOffset]);

   const formattedWeekBeginning = weekBeginning.toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
   });

   const days = [
      ['mon', 'Monday', 0],
      ['tue', 'Tuesday', 1],
      ['wed', 'Wednesday', 2],
      ['thu', 'Thursday', 3],
      ['fri', 'Friday', 4]
   ];

   const fetchWeek = useCallback(async () => {
      try {
         setLoading(true);
         const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/rota/week/${
               weekBeginning.toISOString().split('T')[0]
            }`
         );

         const data = await res.json();
         setSchedule(data.body);
      } catch (err) {
         console.error('Failed to fetch rota:', err);
      } finally {
         setLoading(false);
      }
   }, [weekBeginning]);

   useEffect(() => {
      fetchWeek();
   }, [fetchWeek, weekBeginning]);

   useEffect(() => {
      if (!schedule) {
         return;
      }

      let ignore = false;

      async function fetchReportStatus() {
         try {
            const weekStart = new Date(weekBeginning);
            weekStart.setHours(0, 0, 0, 0);

            const weekEnd = new Date(weekBeginning);
            weekEnd.setDate(weekBeginning.getDate() + 4);
            weekEnd.setHours(23, 59, 59, 999);

            const queryStart = new Date(weekStart);
            queryStart.setDate(weekStart.getDate() - 1);

            const queryEnd = new Date(weekEnd);
            queryEnd.setDate(weekEnd.getDate() + 1);

            const params = new URLSearchParams({
               start: formatDateParam(queryStart),
               end: formatDateParam(queryEnd),
               page: '1',
               limit: '1000'
            });

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/report/week?${params}`);
            const data = await res.json();

            const status = {};
            const weekStartMs = weekStart.getTime();
            const weekEndMs = weekEnd.getTime();

            for (const report of data?.body ?? []) {
               const reportStartMs = Number(report.startDate);

               if (!report.clusterId || Number.isNaN(reportStartMs)) continue;
               if (reportStartMs < weekStartMs || reportStartMs > weekEndMs) {
                  continue;
               }

               status[`${report.clusterId}:${getDayStartMs(new Date(reportStartMs))}`] = true;
            }

            if (!ignore) {
               setReportStatus(status);
            }
         } catch (err) {
            console.error('Failed to fetch report status:', err);
            if (!ignore) {
               setReportStatus({});
            }
         }
      }

      fetchReportStatus();

      return () => {
         ignore = true;
      };
   }, [schedule, weekBeginning]);

   async function getTeamMembers(teamId) {
      if (teamCache[teamId]) return teamCache[teamId];

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/people/team/${teamId}`);

      const data = await res.json();

      setTeamCache((prev) => ({
         ...prev,
         [teamId]: data.body
      }));

      return data.body;
   }

   async function swapPerson(newPersonId) {
      if (!swapTarget) return;

      try {
         await fetch(`${process.env.NEXT_PUBLIC_API_URL}/rota/override`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
               personId: swapTarget.personId,
               newPersonId,
               date: swapTarget.date
            })
         });

         setSwapTarget(null);
         setSelectedSwapPerson(null);
         await fetchWeek();
      } catch (err) {
         console.error('Swap failed:', err);
      }
   }

   useEffect(() => {
      if (swapTarget) {
         document.body.style.overflow = 'hidden';
      } else {
         document.body.style.overflow = '';
      }

      return () => {
         document.body.style.overflow = '';
      };
   }, [swapTarget]);

   if (loading || !schedule) {
      return (
         <main className="flex items-center justify-center py-10">
            <div className="rounded-2xl bg-white/10 px-8 py-6 text-white backdrop-blur-xl">
               Loading schedule...
            </div>
         </main>
      );
   }

   return (
      <main className="space-y-8">
         <div className="rounded-3xl p-8 ">
            {/* Header */}
            <div className="mb-6 grid gap-4 text-center md:grid-cols-[1fr_auto] md:items-start md:text-left">
               <div className="order-1md:col-start-1 md:row-start-1">
                  <h1 className="text-4xl font-bold text-white">Weekly Schedule</h1>
                  <p className="mt-2  text-slate-300">Week beginning {formattedWeekBeginning}</p>
               </div>

               {/* KEYS */}
               {/* 
               <div className="order-2 flex pt-4 col-span-1 md:col-span-2 justify-center md:order-1 md:col-start-1 md:row-start-2 md:justify-end"> */}
               <div className="order-2 grid grid-cols-2 col-span-1 md:col-span-2  justify-center gap-3 pt-4 lg:flex lg:flex-nowrap md:order-3 md:col-start-1 md:row-start-2 md:justify-end">
                  <div className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-300">
                     <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-green-300/20 bg-green-500/10 text-green-400">
                        <IoMdDoneAll className="h-4 w-4" aria-hidden="true" />
                     </span>

                     <span className="font-semibold text-white">Completed Check</span>
                  </div>

                  <div className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-300">
                     <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-sky-300/20 bg-sky-500/10 text-sky-200/90">
                        <BsThreeDots className="h-4 w-4" aria-hidden="true" />
                     </span>

                     <span className="font-semibold text-white">Pending Check</span>
                  </div>

                  <div className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-300">
                     <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-red-300/20 bg-red-500/10 text-red-200/90">
                        <IoCloseSharp className="h-5 w-5" aria-hidden="true" />
                     </span>

                     <span className="font-semibold text-white">Missed Check</span>
                  </div>

                  <div className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-300">
                     <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-amber-300/20 bg-amber-500/10 text-amber-200/90">
                        <IoSwapHorizontal className="text-base" aria-hidden="true" />
                     </span>

                     <span>
                        <span className="font-semibold text-white">Swap</span> replaces a scheduled
                        person for that day.
                     </span>
                  </div>
               </div>

               <div className="order-3 flex justify-center gap-3 md:order-2 md:col-start-2 md:row-start-1 md:justify-end">
                  <button
                     onClick={() => setWeekOffset((w) => w - 1)}
                     className="rounded-lg cursor-pointer bg-white/10 px-3 py-1.5 text-md text-white hover:bg-white/20"
                  >
                     <div className="flex items-center gap-1">
                        <IoIosArrowForward className="rotate-180" aria-hidden="true" />
                        Prev
                     </div>
                  </button>

                  <button
                     onClick={() => setWeekOffset(0)}
                     className="rounded-lg cursor-pointer bg-green-500/20 px-3 py-1.5 text-md text-green-200 hover:bg-green-500/30"
                  >
                     Today
                  </button>

                  <button
                     onClick={() => setWeekOffset((w) => w + 1)}
                     className="rounded-lg cursor-pointer bg-white/10 px-3 py-1.5 text-md text-white hover:bg-white/20"
                  >
                     <div className="flex items-center gap-1">
                        Next
                        <IoIosArrowForward aria-hidden="true" />
                     </div>
                  </button>
               </div>
            </div>

            {/* Days */}
            <div className="space-y-4">
               {days.map(([dayKey, dayLabel, offset]) => {
                  const dayDate = new Date(weekBeginning);
                  dayDate.setDate(weekBeginning.getDate() + offset);

                  const dayStartMs = getDayStartMs(dayDate);

                  const today = new Date();
                  today.setHours(0, 0, 0, 0);

                  const isCurrentOrFuture = dayDate >= today;

                  const formattedDate = dayDate.toLocaleDateString('en-GB', {
                     day: 'numeric',
                     month: 'long',
                     year: 'numeric'
                  });

                  const isToday = today.toDateString() === dayDate.toDateString();

                  return (
                     <div
                        key={dayKey}
                        className={`overflow-hidden rounded-2xl border ${
                           isToday
                              ? 'border-green-400/40 bg-green-500/10'
                              : 'border-white/10 bg-white/5'
                        }`}
                     >
                        {/* Day header */}
                        <div
                           className={`flex items-center justify-between px-6 py-4 ${
                              isToday ? 'bg-green-500/20' : 'bg-slate-900/60'
                           }`}
                        >
                           <div>
                              <h2
                                 className={`text-lg font-semibold ${
                                    isToday ? 'text-green-300' : 'text-white'
                                 }`}
                              >
                                 {dayLabel}
                              </h2>
                              <span className="text-sm text-white/60">{formattedDate}</span>
                           </div>

                           {isToday && (
                              <span className="rounded-full bg-green-500 px-3 py-1 text-xs font-bold uppercase text-white">
                                 Today
                              </span>
                           )}
                        </div>

                        {/* People */}
                        <div>
                           {schedule?.[dayKey]?.closed || false ? (
                              <div className="px-6 py-4 text-white/70 italic">OFFICE CLOSED</div>
                           ) : Object.keys(schedule?.[dayKey] || {}).length === 0 ? (
                              <div className="px-6 py-4 text-white/70 italic">NO SCHEDULE</div>
                           ) : (
                              Object.entries(schedule?.[dayKey] || {}).map(
                                 ([name, person], index, arr) => {
                                    const date = new Date(weekBeginning);
                                    date.setDate(weekBeginning.getDate() + offset);

                                    return (
                                       <div
                                          key={person.id}
                                          className={`grid gap-4 px-6 py-4 md:grid-cols-[200px_1fr] ${
                                             index !== arr.length - 1
                                                ? 'border-b border-white/10'
                                                : ''
                                          }`}
                                       >
                                          <div className="flex items-center gap-3 font-semibold text-white">
                                             {name}
                                             {isCurrentOrFuture && (
                                                <button
                                                   className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-amber-300/20 bg-amber-500/10 text-amber-200/90 transition hover:border-amber-300/35 hover:bg-amber-500/15 hover:text-amber-100"
                                                   aria-label={`Swap ${name}`}
                                                   title={`Swap ${name}`}
                                                   onClick={async () => {
                                                      const teamMembers = await getTeamMembers(
                                                         person.teamId
                                                      );

                                                      setSwapTarget({
                                                         personName: name,
                                                         personId: person.id,
                                                         teamId: person.teamId,
                                                         date: date.toISOString().split('T')[0],
                                                         options: teamMembers
                                                      });

                                                      setSelectedSwapPerson(null);
                                                   }}
                                                >
                                                   <IoSwapHorizontal
                                                      className="cursor-pointer text-base"
                                                      aria-hidden="true"
                                                   />
                                                </button>
                                             )}
                                          </div>

                                          <div className="flex flex-wrap gap-2">
                                             {person.clusters.map((cluster) => {
                                                const hasReport = Boolean(
                                                   reportStatus[`${cluster.id}:${dayStartMs}`]
                                                );

                                                return (
                                                   <span
                                                      key={cluster.id}
                                                      className={`flex items-center  rounded-full ${
                                                         hasReport
                                                            ? 'bg-green-500/20 px-3 gap-2 py-1 text-sm text-green-200'
                                                            : isCurrentOrFuture
                                                              ? 'bg-blue-500/20 px-3 py-1 gap-2 text-sm text-blue-200'
                                                              : 'bg-red-500/20 px-3 py-1 gap-1 text-sm text-red-200'
                                                      }`}
                                                   >
                                                      {cluster.name}
                                                      <span
                                                         className={`flex h-5 w-5 shrink-0 items-center justify-center  ${
                                                            hasReport
                                                               ? 'text-green-400'
                                                               : isCurrentOrFuture
                                                                 ? 'text-blue-200/90'
                                                                 : 'text-red-200/90'
                                                         }`}
                                                      >
                                                         {hasReport ? (
                                                            <IoMdDoneAll
                                                               className="h-5 w-5"
                                                               aria-hidden="true"
                                                            />
                                                         ) : isCurrentOrFuture ? (
                                                            <BsThreeDots
                                                               className="h-5 w-5"
                                                               aria-hidden="true"
                                                            />
                                                         ) : (
                                                            <IoCloseSharp
                                                               className="h-7 w-7"
                                                               aria-hidden="true"
                                                            ></IoCloseSharp>
                                                         )}
                                                      </span>
                                                   </span>
                                                );
                                             })}
                                          </div>
                                       </div>
                                    );
                                 }
                              )
                           )}
                        </div>
                     </div>
                  );
               })}
            </div>
         </div>

         {/* ========================= */}
         {/* SWAP MODAL */}
         {/* ========================= */}
         {swapTarget && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-md">
               <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl">
                  {/* Header */}
                  <div className="mb-6">
                     <h3 className="text-3xl font-bold text-white">Swap Assignment</h3>

                     <p className="mt-2 text-slate-300">
                        Choose a replacement for{' '}
                        <span className="font-semibold text-white">{swapTarget.personName}</span>
                     </p>
                  </div>

                  {/* Summary */}
                  <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-5">
                     <div className="flex items-center justify-between gap-4">
                        <div>
                           <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                              Current
                           </p>

                           <p className="mt-1 text-lg font-semibold text-white">
                              {swapTarget.personName}
                           </p>
                        </div>

                        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-amber-300/20 bg-amber-500/10">
                           <IoSwapHorizontal className="text-xl text-amber-200" />
                        </div>

                        <div className="text-right">
                           <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                              Replacement
                           </p>

                           <p className="mt-1 text-lg font-semibold text-green-300">
                              {selectedSwapPerson?.name || 'Select below'}
                           </p>
                        </div>
                     </div>
                  </div>

                  {/* People */}
                  <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                     {swapTarget.options
                        .filter((p) => p.id !== swapTarget.personId)
                        .map((p) => {
                           const selected = selectedSwapPerson?.id === p.id;

                           return (
                              <button
                                 key={p.id}
                                 type="button"
                                 onClick={() => setSelectedSwapPerson(p)}
                                 className={`flex w-full cursor-pointer items-center justify-between rounded-xl border px-4 py-3 text-left transition-all ${
                                    selected
                                       ? 'border-green-400/40 bg-green-500/10'
                                       : 'border-white/10 bg-white/5 hover:bg-white/10'
                                 }`}
                              >
                                 <span className="font-semibold text-white">{p.name}</span>

                                 {selected && <IoMdDoneAll className="text-xl text-green-400" />}
                              </button>
                           );
                        })}
                  </div>

                  {/* Actions */}
                  <div className="mt-8 flex justify-end gap-3">
                     <button
                        onClick={() => {
                           setSwapTarget(null);
                           setSelectedSwapPerson(null);
                        }}
                        className="rounded-lg cursor-pointer bg-white/10 px-5 py-2.5 text-white transition hover:bg-white/20"
                     >
                        Cancel
                     </button>

                     <button
                        disabled={!selectedSwapPerson}
                        onClick={() => swapPerson(selectedSwapPerson.id)}
                        className={`rounded-lg px-5 py-2.5 font-semibold transition ${
                           selectedSwapPerson
                              ? 'bg-green-500/20 cursor-pointer text-green-200 hover:bg-green-500/30'
                              : 'cursor-not-allowed bg-white/10 text-white/40'
                        }`}
                     >
                        Confirm Swap
                     </button>
                  </div>
               </div>
            </div>
         )}
      </main>
   );
}
