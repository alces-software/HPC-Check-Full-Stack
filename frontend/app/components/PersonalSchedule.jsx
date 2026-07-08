'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { FaFolderOpen, FaInbox, FaUser } from 'react-icons/fa';
import { IoIosArrowForward } from 'react-icons/io';

const CHECK_START_BUFFER_MS = 20 * 60 * 1000;

function getTodayTimeMs(value) {
   const numericValue = Number(value);

   if (Number.isNaN(numericValue)) return null;

   const hours = Math.floor(numericValue);
   const minutes = Math.round((numericValue - hours) * 60);

   if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;

   const date = new Date();
   date.setHours(hours, minutes, 0, 0);

   return date.getTime();
}

function getLatestStartTime(timeWindow) {
   return timeWindow.endMs - CHECK_START_BUFFER_MS;
}

function getTimeRemainingToStartMs(timeWindow) {
   return Math.max(0, getLatestStartTime(timeWindow) - Date.now());
}

function getTimeToWindowOpen(timeWindow) {
   return Math.max(0, timeWindow.startMs - Date.now());
}

function isBeforeWindow(timeWindow) {
   return Date.now() < timeWindow.startMs;
}

function canStartCheck(timeWindow) {
   const now = Date.now();

   return now >= timeWindow.startMs && now <= getLatestStartTime(timeWindow);
}

function formatTimeRemaining(milliseconds) {
   const totalSeconds = Math.floor(milliseconds / 1000);
   const hours = Math.floor(totalSeconds / 3600);
   const minutes = Math.floor((totalSeconds % 3600) / 60);
   const seconds = totalSeconds % 60;

   return [hours, minutes, seconds].map((value) => String(value).padStart(2, '0')).join(':');
}

export default function PersonalSchedule() {
   const [clusters, setClusters] = useState([]);
   const [name, setName] = useState('User');
   const [loading, setLoading] = useState(true);
   const [windowReady, setWindowReady] = useState(false);
   const [timeWindow, setTimeWindow] = useState(null);
   const [beforeWindow, setBeforeWindow] = useState(false);
   const [canComplete, setCanComplete] = useState(false);
   const [timeToChecks, setTimeToChecks] = useState(0);
   const [timeRemainingMs, setTimeRemainingMs] = useState(0);
   const router = useRouter();
   const redirected = useRef(false);
   const userId = Cookies.get('selectedPersonId');

   useEffect(() => {
      if (!timeWindow) {
         return;
      }

      function updateTimer() {
         setBeforeWindow(isBeforeWindow(timeWindow));
         setTimeToChecks(getTimeToWindowOpen(timeWindow));
         setTimeRemainingMs(getTimeRemainingToStartMs(timeWindow));
         setCanComplete(canStartCheck(timeWindow));
         setWindowReady(true);
      }

      updateTimer();

      const timer = setInterval(updateTimer, 1000);
      return () => clearInterval(timer);
   }, [timeWindow]);

   useEffect(() => {
      if (!userId && !redirected.current) {
         redirected.current = true;
         router.replace('/name');
      }
   }, [userId, router]);

   useEffect(() => {
      async function init() {
         try {
            // Get person name
            const nameRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/people/id/${userId}`);

            let teamId = null;

            const nameData = await nameRes.json();
            const person = nameData?.body;

            if (person?.name) {
               setName(person.name);
            }

            teamId = person?.teamId ?? null;

            // Get today's rota (NEW FORMAT: object, not array)
            const rotaRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/rota/person/${userId}`);

            const rotaData = await rotaRes.json();

            if (!rotaData?.success || !rotaData?.body) {
               setClusters([]);
               setLoading(false);
               return;
            }

            // Get time limits
            if (!teamId) {
               setWindowReady(true);
               setCanComplete(false);
            } else {
               const teamRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/teams/id/${teamId}`);
               const teamData = await teamRes.json();
               const startMs = getTodayTimeMs(teamData.body?.start_window);
               const endMs = getTodayTimeMs(teamData.body?.end_window);

               if (startMs !== null && endMs !== null) {
                  setTimeWindow({
                     startMs,
                     endMs
                  });
               } else {
                  setWindowReady(true);
                  setCanComplete(false);
               }
            }

            const personEntry = Object.values(rotaData.body)[0];

            const todaysClusters = personEntry?.clusters || [];

            // Check completion status
            const completedClusterIds = await Promise.all(
               todaysClusters.map(async (cluster) => {
                  try {
                     const response = await fetch(
                        `${process.env.NEXT_PUBLIC_API_URL}/report/today/cluster/${cluster.id}`
                     );

                     const json = await response.json();

                     return json?.success && Array.isArray(json.body) && json.body.length > 0
                        ? cluster.id
                        : null;
                  } catch (error) {
                     console.error(
                        'Failed to load completed report for cluster',
                        cluster.id,
                        error
                     );
                     return null;
                  }
               })
            );

            const completedIdsSet = new Set(completedClusterIds.filter(Boolean));

            const filteredClusters = todaysClusters.filter(
               (cluster) => !completedIdsSet.has(cluster.id)
            );

            setClusters(filteredClusters);
         } catch (err) {
            console.error(err);
            setClusters([]);
         } finally {
            setLoading(false);
         }
      }

      if (userId) init();
   }, [router, userId]);

   if (loading) {
      return (
         <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900">
            <div className="rounded-2xl border border-white/10 bg-white/10 px-8 py-6 text-white shadow-2xl backdrop-blur-xl">
               Loading clusters...
            </div>
         </main>
      );
   }

   const handleClusterClick = (cluster) => {
      if (!canComplete) return;

      Cookies.set('currentCluster', cluster.id);
      router.push('/form');
   };

   return (
      <main className="flex justify-center space-y-8">
         <div className="relative z-10 w-full">
            <div className="rounded-3xl p-10">
               {/* Header */}
               <div className="mb-10 text-left">
                  

                  <h1 className="text-4xl sm:text-5xl font-bold text-white">
                     {name}&apos;s Clusters
                  </h1>

                  {!windowReady ? (
                     <p className="mt-2 text-slate-300">Checking when checks are available...</p>
                  ) : beforeWindow ? (
                     <strong className="mt-2 block text-lg text-yellow-500">
                        Checks are not open yet. Please come back during the allocated time window.
                     </strong>
                  ) : !canComplete ? (
                     <strong className="mt-2 block text-lg text-red-500">
                        You are outside of the allocated time window for checks. Speak to your
                        manager or system administrator.
                     </strong>
                  ) : (
                     <p className="mt-2 text-slate-300">Select a cluster to complete your report</p>
                  )}
               </div>

               {/* Clusters */}
               {clusters.length > 0 ? (
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                     {clusters.map((cluster) => (
                        <button
                           key={cluster.id}
                           onClick={() => handleClusterClick(cluster)}
                           disabled={!windowReady || !canComplete}
                           className={`
                                        group
                                        rounded-2xl
                                        border
                                        border-blue-400/20
                                        bg-blue-500/10
                                        p-6
                                        text-left
                                        transition-all
                                        duration-300
                                        hover:-translate-y-2
                                        hover:border-blue-400/50
                                        hover:bg-blue-500/20
                                        hover:shadow-2xl
                                        disabled:cursor-not-allowed
                                        disabled:opacity-50
                                        disabled:hover:translate-y-0
                                        ${canComplete ? 'cursor-pointer' : ''}
                                    `}
                        >
                           <FaFolderOpen
                              className="mb-4 text-4xl text-blue-300"
                              aria-hidden="true"
                           />

                           <div className="text-xs font-semibold uppercase tracking-widest text-blue-300">
                              Cluster
                           </div>

                           <div className="mt-2 text-xl font-bold text-white">{cluster.name}</div>

                           <div className="mt-2 font-medium text-blue-300 transition-transform group-hover:translate-x-2">
                              <div className="flex items-center gap-1">
                                 Continue
                                 <IoIosArrowForward aria-hidden="true" />
                              </div>
                           </div>
                        </button>
                     ))}
                  </div>
               ) : (
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center">
                     <FaInbox className="mx-auto mb-4 text-6xl text-slate-300" aria-hidden="true" />

                     <h2 className="text-xl font-semibold text-white">No Clusters Assigned</h2>

                     <p className="mt-2 text-slate-300">
                        You don&apos;t have any clusters assigned for today.
                     </p>
                  </div>
               )}
            </div>
         </div>

         <div className="fixed bottom-4 right-4 z-30 rounded-3xl border border-white/10 bg-white/10 px-4 py-3 text-right shadow-2xl backdrop-blur-xl">
            <div className="flex items-center gap-3">
               {!windowReady ? (
                  <>
                     <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Checking window
                     </span>
                     <span className="text-xl font-bold tabular-nums text-white">--:--:--</span>
                  </>
               ) : beforeWindow ? (
                  <>
                     <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Checks open in
                     </span>
                     <span className="text-xl font-bold tabular-nums text-white">
                        {formatTimeRemaining(timeToChecks)}
                     </span>
                  </>
               ) : (
                  <>
                     <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Start check by
                     </span>
                     <span className="text-xl font-bold tabular-nums text-white">
                        {timeRemainingMs > 0 ? formatTimeRemaining(timeRemainingMs) : 'Ended'}
                     </span>
                  </>
               )}
            </div>
         </div>
      </main>
   );
}
