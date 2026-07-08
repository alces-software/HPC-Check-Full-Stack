'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from '@headlessui/react';
import { FaLayerGroup, FaUser, FaUsers } from 'react-icons/fa';
import { IoIosSettings } from 'react-icons/io';

function timeNumberToInput(value) {
   const numericValue = Number(value);

   if (Number.isNaN(numericValue)) return '';

   let hours;
   let minutes;

   if (Number.isInteger(numericValue) && numericValue >= 100) {
      hours = Math.floor(numericValue / 100);
      minutes = numericValue % 100;
   } else {
      hours = Math.floor(numericValue);
      minutes = Math.round((numericValue - hours) * 60);
   }

   if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return '';

   return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

export default function TeamSettingsPage() {
   const searchParams = useSearchParams();
   const teamId = searchParams.get('id');

   const [team, setTeam] = useState([]);
   const [clustersPerDay, setClustersPerDay] = useState(0);
   const [startWindow, setStartWindow] = useState('');
   const [endWindow, setEndWindow] = useState('');
   const [loadingTeams, setLoadingTeams] = useState(true);

   const loadTeam = useCallback(async () => {
      try {
         const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/teams/id/${teamId}`);
         const data = await res.json();

         setTeam(data.body);
         setClustersPerDay(data.body.clusters_per_day);
         setStartWindow(timeNumberToInput(data.body.start_window));
         setEndWindow(timeNumberToInput(data.body.end_window));
      } catch (err) {
         console.error('Failed to fetch teams:', err);
         setTeam([]);
      } finally {
         setLoadingTeams(false);
      }
   }, [teamId]);

   useEffect(() => {
      loadTeam();
   }, [loadTeam]);

   const [selectedUserId, setSelectedUserId] = useState('');
   const [selectedPoolId, setSelectedPoolId] = useState('');

   const [teamUsers, setTeamUsers] = useState([]);
   const [users, setUsers] = useState([]);

   const [pools, setPools] = useState([]);
   const [teamPools, setTeamPools] = useState([]);

   const [statusMessage, setStatusMessage] = useState('');
   const [statusType, setStatusType] = useState('success');
   const [savingSettings, setSavingSettings] = useState(false);
   const [pendingRemovalPool, setPendingRemovalPool] = useState(null);

   const getTeamUsers = useCallback(async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/people/team/${teamId}`);
      const data = await res.json();
      setTeamUsers(data.body);
   }, [teamId]);

   useEffect(() => {
      getTeamUsers();
   }, [getTeamUsers]);

   useEffect(() => {
      async function getUsers() {
         const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/people/team/not/${teamId}`);
         const data = await res.json();
         setUsers(data.body);
      }
      getUsers();
   }, [teamId]);

   const getPools = useCallback(async () => {
      try {
         const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pool/team/not/${teamId}`);
         const data = await res.json();

         setPools(data.body ?? []);
      } catch (err) {
         console.error('Failed to fetch available pools:', err);
         setPools([]);
      }
   }, [teamId]);

   useEffect(() => {
      getPools();
   }, [getPools]);

   const getTeamPools = useCallback(async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pool/team/${teamId}`);
      const data = await res.json();
      const pools = data.body ?? [];

      const enrichedPools = await Promise.all(
         pools.map(async (pool) => {
            const clusterRes = await fetch(
               `${process.env.NEXT_PUBLIC_API_URL}/hpc/pool/${pool.id}`
            );
            const clusterData = await clusterRes.json();
            return {
               ...pool,
               clusters: clusterData.body ?? []
            };
         })
      );
      setTeamPools(enrichedPools);
   }, [teamId]);

   useEffect(() => {
      getTeamPools();
   }, [getTeamPools]);

   if (!team) {
      return (
         <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 p-6">
            <div className="rounded-3xl border border-white/10 bg-white/10 p-10 text-center shadow-2xl backdrop-blur-xl">
               <h1 className="mb-4 text-4xl font-bold text-white">Team not found</h1>

               <p className="mb-6 text-slate-300">No team exists with ID: {teamId}</p>
            </div>
         </main>
      );
   }

   const handleAddUser = async () => {
      if (!selectedUserId) {
         showStatus('Please select a user.', 'error');
         return;
      }

      const userToAdd = users.find((user) => user.id === selectedUserId);
      const userTeamId = userToAdd.teamId;

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/people/team/${userTeamId}`);
      const data = await res.json();

      if (data.body && data.body.length === 1) {
         alert(
            `You cannot add ${userToAdd.name} as they are the only remaining member in their team.`
         );
         return;
      }

      try {
         const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/people/team/${selectedUserId}`,
            {
               method: 'PATCH',
               headers: {
                  'Content-Type': 'application/json'
               },
               body: JSON.stringify({
                  teamId: teamId
               })
            }
         );

         const data = await res.json();

         if (!res.ok || !data.success) {
            throw new Error(data.message || 'Failed to add user to team.');
         }

         setUsers((previousUsers) => previousUsers.filter((user) => user.id !== selectedUserId));

         setSelectedUserId('');
         getTeamUsers();

         setStatusMessage('User added to team.');
         setStatusType('success');
      } catch (err) {
         console.error(err);
         setStatusMessage('Failed to add user to team.');
         setStatusType('error');
      }
   };

   const handleAddPool = async () => {
      if (!selectedPoolId) {
         showStatus('Please select a pool.', 'error');
         return;
      }

      try {
         const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pool/team/${selectedPoolId}`, {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json'
            },
            body: JSON.stringify({
               teamId: teamId
            })
         });

         const data = await res.json();

         if (!res.ok || !data.success) {
            throw new Error(data.message || 'Failed to add user to team.');
         }

         setPools((previousPools) => previousPools.filter((pool) => pool.id !== selectedPoolId));

         setSelectedPoolId('');
         getTeamPools();

         setStatusMessage('Pool added to team.');
         setStatusType('success');
      } catch (err) {
         console.error(err);
         setStatusMessage('Failed to add pool to team.');
         setStatusType('error');
      }
   };

   const openRemovePoolConfirmation = (poolId) => {
      const poolToRemove = teamPools.find((pool) => pool.id === poolId);
      setPendingRemovalPool(poolToRemove || { id: poolId, name: 'this pool' });
   };

   async function confirmRemovePool() {
      if (!pendingRemovalPool) {
         return;
      }

      try {
         const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/pool/team/${pendingRemovalPool.id}`,
            {
               method: 'DELETE',
               headers: {
                  'Content-Type': 'application/json'
               },
               body: JSON.stringify({
                  teamId: teamId
               })
            }
         );

         const data = await res.json().catch(() => ({}));

         if (!res.ok || !data.success) {
            throw new Error(data.message || 'Failed to remove pool from team.');
         }

         const removedPool = teamPools.find((pool) => pool.id === pendingRemovalPool.id);
         if (removedPool) {
            setPools((previousPools) => [...previousPools, removedPool]);
         }

         setTeamPools((previousPools) =>
            previousPools.filter((pool) => pool.id !== pendingRemovalPool.id)
         );
         setPendingRemovalPool(null);
         showStatus('Pool removed from team.');
      } catch (err) {
         console.error(err);
         setPendingRemovalPool(null);
         showStatus('Failed to remove pool from team.', 'error');
      }
   }

   const showStatus = (message, type = 'success') => {
      setStatusMessage(message);
      setStatusType(type);
   };

   const handleSaveSettings = async () => {
      if (!teamId) return;

      try {
         setSavingSettings(true);
         setStatusMessage('');

         const startWindowInt = timeInputToInt(startWindow);
         const endWindowInt = timeInputToInt(endWindow);

         if (clustersPerDay < 0) {
            setStatusMessage("Can't set clusters per day to zero.");
            setStatusType('error');
            return;
         } else if (!startWindow || !endWindow) {
            setStatusMessage('Please select a start and end time.');
            setStatusType('error');
            return;
         } else if (startWindowInt >= endWindowInt) {
            setStatusMessage('Start time must be before end time.');
            setStatusType('error');
            return;
         } else if (
            clustersPerDay === team.clusters_per_day &&
            startWindowInt === team.start_window &&
            endWindowInt === team.end_window
         ) {
            setStatusMessage('There are no settings changes to save.');
            setStatusType('error');
            return;
         }

         const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/teams`, {
            method: 'PATCH',
            headers: {
               'Content-Type': 'application/json'
            },
            body: JSON.stringify({
               id: teamId,
               clusters_per_day: clustersPerDay,
               start_window: startWindowInt,
               end_window: endWindowInt
            })
         });

         const data = await res.json();

         if (!res.ok || !data.success) {
            throw new Error(data.message || 'Failed to update settings');
         }

         setTeam((prev) => ({
            ...prev,
            clusters_per_day: clustersPerDay,
            start_window: startWindowInt,
            end_window: endWindowInt
         }));

         setStatusMessage('Settings updated successfully.');
         setStatusType('success');
      } catch (err) {
         console.error(err);
         setStatusMessage('Failed to save settings.');
         setStatusType('error');
      } finally {
         setSavingSettings(false);
      }
   };

   if (loadingTeams) {
      return (
         <main className="flex min-h-screen items-center justify-center">
            <p className="text-white">Loading team...</p>
         </main>
      );
   }

   if (!team) {
      return (
         <main className="flex min-h-screen items-center justify-center">
            <p className="text-white">Team not found: {teamId}</p>
         </main>
      );
   }

   return (
      <main className="flex min-h-screen items-center justify-center">
         <div className="absolute h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />

         <div className="relative z-10 w-full max-w-5xl">
            <div className="rounded-3xl border border-white/10 bg-white/10 p-10 shadow-2xl backdrop-blur-xl">
               <div className="mt-8 text-center">
                  <div className="mb-4 flex justify-center">
                     <FaUsers className="h-20 w-20 text-amber-300" aria-hidden="true" />
                  </div>

                  <h1 className="text-5xl font-bold text-white">{team.name}</h1>

                  <p className="mt-3 text-lg text-slate-300">
                     Manage users and pools assigned to this team.
                  </p>

                  <p className="mt-2 text-sm text-amber-300">id: {team.id}</p>
               </div>

               {statusMessage && (
                  <div
                     className={`mt-8 rounded-2xl border px-4 py-4 text-sm ${
                        statusType === 'error'
                           ? 'border-red-500/30 bg-red-500/10 text-red-100'
                           : 'border-green-500/30 bg-green-500/10 text-emerald-100'
                     }`}
                  >
                     {statusMessage}
                  </div>
               )}

               <div className="mt-10 grid gap-6 lg:grid-cols-2">
                  <div className="rounded-2xl border border-blue-400/20 bg-blue-500/10 p-6">
                     <FaUser className="mb-3 text-4xl text-blue-300" aria-hidden="true" />

                     <h2 className="mb-2 text-2xl font-bold text-white">Users</h2>

                     <p className="mb-4 text-sm text-slate-300">Add existing users to this team.</p>

                     <div className="mb-6 flex gap-3">
                        <Listbox
                           as="div"
                           value={selectedUserId}
                           onChange={setSelectedUserId}
                           className="w-full"
                        >
                           <div className="relative">
                              <ListboxButton className="w-full rounded-xl border border-slate-600 bg-slate-800/80 px-3 py-3 text-left cursor-pointer text-white outline-none transition hover:border-white/20 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30">
                                 {users.find((user) => user.id === selectedUserId)?.name ||
                                    'Select user'}

                                 <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                                    ▼
                                 </span>
                              </ListboxButton>

                              <ListboxOptions className="absolute z-50 mt-2 max-h-40 w-full overflow-y-auto rounded-xl border border-white/10 bg-slate-900/95 shadow-2xl backdrop-blur-xl">
                                 {users.map((user) => (
                                    <ListboxOption
                                       key={user.id}
                                       value={user.id}
                                       className="cursor-pointer px-4 py-3 text-white transition data-[active]:bg-blue-500/20 data-[selected]:font-semibold"
                                    >
                                       {user.name}
                                    </ListboxOption>
                                 ))}
                              </ListboxOptions>
                           </div>
                        </Listbox>

                        <button
                           type="button"
                           onClick={handleAddUser}
                           className="rounded-xl bg-blue-600 px-5 py-3 cursor-pointer font-semibold text-white transition hover:bg-blue-500"
                        >
                           Add
                        </button>
                     </div>

                     <div className="border-t border-white/10 pt-4">
                        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-300">
                           Users in Team
                        </h3>

                        <div className="space-y-2">
                           {teamUsers.length === 0 ? (
                              <p className="text-sm text-slate-400">No users assigned yet.</p>
                           ) : (
                              teamUsers.map((user) => (
                                 <div
                                    key={user.id}
                                    className="flex items-start justify-between rounded-xl border border-slate-600 bg-slate-800/80 px-4 py-3 text-white"
                                 >
                                    <div>
                                       <p className="font-medium text-white">{user.name}</p>

                                       <p className="text-xs text-slate-400">{user.id}</p>
                                    </div>
                                 </div>
                              ))
                           )}
                        </div>
                     </div>
                  </div>

                  <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-6">
                     <FaLayerGroup className="mb-3 text-4xl text-emerald-300" aria-hidden="true" />

                     <h2 className="mb-2 text-2xl font-bold text-white">Pools</h2>

                     <p className="mb-4 text-sm text-slate-300">
                        Add existing cluster pools to this team.
                     </p>

                     <div className="mb-6 flex gap-3">
                        <Listbox
                           as="div"
                           value={selectedPoolId}
                           onChange={setSelectedPoolId}
                           className={'w-full'}
                        >
                           <div className="relative">
                              <ListboxButton className="w-full rounded-xl border border-slate-600 bg-slate-800/80 px-3 py-3 text-left cursor-pointer text-white outline-none transition hover:border-white/20 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30">
                                 {pools.find((pool) => pool.id === selectedPoolId)?.name ||
                                    'Select pool'}

                                 <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                                    ▼
                                 </span>
                              </ListboxButton>

                              <ListboxOptions className="absolute z-50 mt-2 max-h-40 w-full overflow-auto rounded-xl border border-white/10 bg-slate-900/95 shadow-2xl backdrop-blur-xl">
                                 {pools.map((pool) => (
                                    <ListboxOption
                                       key={pool.id}
                                       value={pool.id}
                                       className="cursor-pointer px-4 py-3 text-white transition data-[active]:bg-blue-500/20 data-[selected]:font-semibold"
                                    >
                                       {pool.name}
                                    </ListboxOption>
                                 ))}
                              </ListboxOptions>
                           </div>
                        </Listbox>

                        <button
                           type="button"
                           onClick={handleAddPool}
                           className="rounded-xl bg-emerald-600 px-5 py-3 cursor-pointer font-semibold text-white transition hover:bg-emerald-500"
                        >
                           Add
                        </button>
                     </div>

                     <div className="border-t border-white/10 pt-4">
                        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-300">
                           Pools in Team
                        </h3>

                        <div className="space-y-2">
                           {teamPools.length === 0 ? (
                              <p className="text-sm text-slate-400">No pools assigned yet.</p>
                           ) : (
                              teamPools.map((pool) => (
                                 <div
                                    key={pool.id}
                                    className="flex items-center justify-between rounded-xl border border-slate-600 bg-slate-800/80 px-4 py-3 text-white"
                                 >
                                    <div className="relative flex-1">
                                       {/* Full card click target */}
                                       <Link
                                          href={`/pools?id=${pool.id}`}
                                          className="absolute inset-0 z-0"
                                          aria-label={`View ${pool.name}`}
                                       />

                                       {/* Card content */}
                                       <div className="relative z-10 pointer-events-none">
                                          <p className="font-medium text-white transition hover:text-amber-300">
                                             {pool.name}
                                          </p>

                                          <p className="text-xs text-slate-400">{pool.id}</p>

                                          {pool.clusters.length > 0 && (
                                             <div className="mt-3">
                                                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                                                   Clusters
                                                </p>

                                                <div className="flex flex-col gap-2">
                                                   {pool.clusters.map((cluster) => (
                                                      <Link
                                                         key={cluster.id}
                                                         href={`/clusters?id=${cluster.id}`}
                                                         className="relative z-20 pointer-events-auto w-fit"
                                                      >
                                                         <span className="block rounded-lg bg-slate-700/80 px-2.5 py-1 text-xs text-slate-200 ring-1 ring-slate-600 transition hover:ring-cyan-400/50">
                                                            {cluster.name}
                                                         </span>
                                                      </Link>
                                                   ))}
                                                </div>
                                             </div>
                                          )}

                                          <p className="mt-3 text-xs text-cyan-300">
                                             View pool settings
                                          </p>
                                       </div>
                                    </div>
                                    <button
                                       type="button"
                                       onClick={() => openRemovePoolConfirmation(pool.id)}
                                       className="ml-3 rounded-full border border-red-400/40 bg-red-500/10 px-2.5 py-1 text-sm text-red-200 transition hover:bg-red-500/20"
                                       aria-label={`Remove ${pool.name} from team`}
                                    >
                                       ✕
                                    </button>
                                 </div>
                              ))
                           )}
                        </div>
                     </div>
                  </div>
               </div>

               {/* SETTINGS SECTION */}
               <div className="mt-6 rounded-2xl border border-purple-400/20 bg-purple-500/10 p-6">
                  <IoIosSettings className="mb-3 text-4xl text-purple-300" aria-hidden="true" />

                  <h2 className="mb-2 text-2xl font-bold text-white">Settings</h2>

                  <p className="mb-4 text-sm text-slate-300">Team configuration options.</p>

                  <div className="flex flex-col gap-3">
                     <label className="text-sm text-slate-300">Clusters per day</label>

                     <input
                        type="number"
                        value={clustersPerDay}
                        onChange={(e) => setClustersPerDay(Number(e.target.value))}
                        min={1}
                        className="w-full rounded-xl border border-slate-600 bg-slate-800/80 px-3 py-3 text-white outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30"
                     />
                  </div>

                  <div className="mt-4 flex flex-col gap-3">
                     <label className="text-sm text-slate-300">
                        <strong>Time window for cluster checks</strong>
                     </label>

                     <div className="flex items-center gap-3">
                        <input
                           type="time"
                           value={startWindow}
                           onChange={(event) => setStartWindow(event.target.value)}
                           aria-label="Check window start time"
                           className="min-w-0 flex-1 rounded-xl cursor-pointer border border-slate-600 bg-slate-800/80 px-3 py-3 text-white outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30"
                        />

                        <span className="shrink-0 text-sm font-semibold text-slate-300">to</span>

                        <input
                           type="time"
                           value={endWindow}
                           onChange={(event) => setEndWindow(event.target.value)}
                           aria-label="Check window end time"
                           className="min-w-0 flex-1 cursor-pointer rounded-xl border border-slate-600 bg-slate-800/80 px-3 py-3 text-white outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30"
                        />
                     </div>
                  </div>

                  {/* optional future button hook */}
                  <div className="mt-5 flex justify-end">
                     <button
                        type="button"
                        onClick={handleSaveSettings}
                        disabled={savingSettings}
                        className="rounded-xl bg-purple-600 px-5 py-3 font-semibold text-white transition hover:bg-purple-500 disabled:opacity-50"
                     >
                        {savingSettings ? 'Saving...' : 'Save'}
                     </button>
                  </div>
               </div>
            </div>
         </div>

         {pendingRemovalPool && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/70 px-4 backdrop-blur-sm">
               <div className="w-full max-w-md rounded-3xl border border-red-400/20 bg-slate-900/95 p-6 shadow-2xl">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-2xl text-red-300">
                     !
                  </div>

                  <h3 className="text-xl font-semibold text-white">Remove pool from team?</h3>

                  <p className="mt-2 text-sm text-slate-300">
                     This will remove{' '}
                     <span className="font-semibold text-white">{pendingRemovalPool.name}</span>{' '}
                     from this team.
                  </p>

                  <div className="mt-6 flex justify-end gap-3">
                     <button
                        type="button"
                        onClick={() => setPendingRemovalPool(null)}
                        className="rounded-xl border border-slate-600 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-800"
                     >
                        Cancel
                     </button>

                     <button
                        type="button"
                        onClick={confirmRemovePool}
                        className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-500"
                     >
                        Remove Pool
                     </button>
                  </div>
               </div>
            </div>
         )}
      </main>
   );
}
