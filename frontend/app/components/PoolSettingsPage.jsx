'use client';

import { useEffect, useState } from 'react';
import { FaServer } from 'react-icons/fa';
import { useSearchParams } from 'next/navigation';

import ReportSkeleton from './PoolSkeleton';

export default function PoolClustersPage() {
   const searchParams = useSearchParams();
   const poolId = searchParams.get('id');

   const [pool, setPool] = useState(null);

   const [clusters, setClusters] = useState([]);
   const [availableClusters, setAvailableClusters] = useState([]);

   const [selectedClusterId, setSelectedClusterId] = useState('');

   const [loading, setLoading] = useState(true);

   const [statusMessage, setStatusMessage] = useState('');
   const [statusType, setStatusType] = useState('success');

   useEffect(() => {
      if (!poolId) return;

      loadData();
   }, [poolId]);

   async function loadData() {
      setLoading(true);

      try {
         const [poolResponse, clustersResponse, allClustersResponse] = await Promise.all([
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/pool/id/${poolId}`),
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/hpc/pool/${poolId}`),
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/hpc`)
         ]);

         const poolData = await poolResponse.json();
         const clustersData = await clustersResponse.json();
         const allClustersData = await allClustersResponse.json();

         setPool(poolData.body);
         setClusters(clustersData.body);
         setAvailableClusters(allClustersData.body);
      } catch {
         showStatus('Failed to load pool data.', 'error');
      }

      setLoading(false);
   }

   function showStatus(message, type = 'success') {
      setStatusMessage(message);
      setStatusType(type);

      setTimeout(() => {
         setStatusMessage('');
      }, 3000);
   }

   async function handleAddCluster() {
      if (!selectedClusterId) return;

      try {
         const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/hpc/pool/add/${selectedClusterId}`,
            {
               method: 'PATCH',
               headers: {
                  'Content-Type': 'application/json'
               },
               body: JSON.stringify({
                  poolId
               })
            }
         );

         if (!response.ok) {
            throw new Error();
         }

         showStatus('Cluster added.');

         setSelectedClusterId('');

         loadData();
      } catch {
         showStatus('Failed to add cluster.', 'error');
      }
   }

   async function handleRemoveCluster(clusterId) {
      try {
         const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/hpc/pool/remove/${clusterId}`,
            {
               method: 'PATCH',
               headers: {
                  'Content-Type': 'application/json'
               },
               body: JSON.stringify({
                  poolId
               })
            }
         );

         if (!response.ok) {
            throw new Error();
         }

         showStatus('Cluster removed.');

         loadData();
      } catch {
         showStatus('Failed to remove cluster.', 'error');
      }
   }

   if (loading) {
      return <ReportSkeleton />;
   }

   if (!pool) {
      return (
         <main className="flex min-h-screen items-center justify-center">
            <p className="text-white">Pool not found: {poolId}</p>
         </main>
      );
   }

   const selectableClusters = availableClusters.filter(
      (cluster) => !clusters.some((poolCluster) => poolCluster.id === cluster.id)
   );

   return (
      <main className="flex min-h-screen items-center justify-center">
         <div className="relative z-10 w-full">
            <div className="p-10">
               <div className="text-left">
                  <h1 className="text-5xl font-bold text-white">{pool.name}</h1>

                  <p className="mt-3 text-lg text-slate-300">
                     Manage clusters assigned to this pool.
                  </p>

                  <p className="mt-2 text-sm text-amber-300">id: {pool.id}</p>
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

               <div className="mt-10 rounded-2xl border border-blue-400/20 bg-blue-500/10 p-6">
                  <div className="mb-6 flex items-center justify-between">
                     <div>
                        <h2 className="text-2xl font-bold text-white">Clusters</h2>

                        <p className="mt-1 text-sm text-slate-300">
                           Select a cluster to add it to this pool.
                        </p>
                     </div>

                     <button
                        type="button"
                        disabled={!selectedClusterId}
                        onClick={handleAddCluster}
                        className={`rounded-xl px-5 py-3 cursor-pointer font-semibold text-white transition ${
                           selectedClusterId
                              ? 'bg-blue-600 hover:bg-blue-500'
                              : 'cursor-not-allowed bg-slate-600 opacity-50'
                        }`}
                     >
                        Add Selected
                     </button>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                     {selectableClusters.map((cluster) => {
                        const assignedElsewhere = cluster.poolId && cluster.poolId !== poolId;

                        const selected = selectedClusterId === cluster.id;

                        return (
                           <button
                              key={cluster.id}
                              type="button"
                              onClick={() => setSelectedClusterId(selected ? '' : cluster.id)}
                              className={`rounded-2xl border cursor-pointer p-5 text-left transition ${
                                 selected
                                    ? 'border-blue-400 bg-blue-500/20 shadow-lg shadow-blue-500/20'
                                    : 'border-white/10 bg-slate-800/70 hover:border-blue-300/50 hover:bg-slate-700/70'
                              }`}
                           >
                              <div className="flex justify-between">
                                 <div>
                                    <h3 className="text-lg font-semibold text-white">
                                       {cluster.name}
                                    </h3>

                                    <p className="mt-1 text-xs text-slate-400">{cluster.id}</p>
                                 </div>

                                 <FaServer
                                    className={`text-3xl ${
                                       selected ? 'text-blue-300' : 'text-slate-500'
                                    }`}
                                 />
                              </div>

                              <div className="mt-4 flex gap-2">
                                 <span
                                    className={`rounded-full px-3 py-1 text-xs ${
                                       assignedElsewhere
                                          ? 'bg-amber-500/20 text-amber-300'
                                          : 'bg-green-500/20 text-green-300'
                                    }`}
                                 >
                                    {assignedElsewhere ? 'Assigned to another pool' : 'Available'}
                                 </span>

                                 {selected && (
                                    <span className="rounded-full bg-blue-500/30 px-3 py-1 text-xs text-blue-200">
                                       Selected
                                    </span>
                                 )}
                              </div>
                           </button>
                        );
                     })}
                  </div>

                  <div className="mt-10 border-t border-white/10 pt-6">
                     <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-300">
                        Clusters in Pool
                     </h3>

                     <div className="space-y-2">
                        {clusters.length === 0 ? (
                           <p className="text-sm text-slate-400">No clusters assigned yet.</p>
                        ) : (
                           clusters.map((cluster) => (
                              <div
                                 key={cluster.id}
                                 className="flex items-center justify-between rounded-xl border border-slate-600 bg-slate-800/80 px-4 py-3 text-white"
                              >
                                 <div>
                                    <p className="font-medium">{cluster.name}</p>

                                    <p className="text-xs text-slate-400">{cluster.id}</p>
                                 </div>

                                 <button
                                    onClick={() => handleRemoveCluster(cluster.id)}
                                    className="ml-3 cursor-pointer flex h-8 w-8 items-center justify-center rounded-lg border border-red-500/20 bg-red-500/10 text-red-300 transition hover:bg-red-500/20 hover:text-red-200"
                                    title="Delete pool"
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
         </div>
      </main>
   );
}
