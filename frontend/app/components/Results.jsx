"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
   Listbox,
   ListboxButton,
   ListboxOptions,
   ListboxOption,
} from "@headlessui/react";

export default function ResultsPage() {
   const router = useRouter();

   const [clusters, setClusters] = useState([]);
   const [clustersLoaded, setClustersLoaded] = useState(false);

   const [selectedClusterId, setSelectedClusterId] = useState(null);

   const [reports, setReports] = useState([]);
   const [loading, setLoading] = useState(false);

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
            console.error("Failed to load clusters:", err);
            setClusters([]);
         } finally {
            setClustersLoaded(true);
         }
      }

      loadClusters();
   }, []);

   // ----------------------------
   // Fetch reports
   // ----------------------------
   useEffect(() => {
      if (!selectedClusterId) return;

      async function loadReports() {
         setLoading(true);

         try {
            const res = await fetch(
               `${process.env.NEXT_PUBLIC_API_URL}/report/cluster/${selectedClusterId}`
            );

            const data = await res.json();
            setReports(data?.body ?? []);
         } catch (err) {
            console.error("Failed to load reports:", err);
            setReports([]);
         } finally {
            setLoading(false);
         }
      }

      loadReports();
   }, [selectedClusterId]);

   // ----------------------------
   // Group reports by date
   // ----------------------------
   const grouped = useMemo(() => {
      const map = {};

      for (const r of reports ?? []) {
         const key = new Date(r.startDate).toLocaleDateString("en-GB");

         if (!map[key]) map[key] = [];
         map[key].push(r);
      }

      return map;
   }, [reports]);

   // ----------------------------
   // Selected cluster object
   // ----------------------------
   const selectedCluster = useMemo(() => {
      return clusters.find(
         (c) => String(c.id) === String(selectedClusterId)
      );
   }, [clusters, selectedClusterId]);

   // ----------------------------
   // Loading gate
   // ----------------------------
   if (!clustersLoaded) {
      return (
         <main className="flex min-h-screen items-center justify-center text-white">
            Loading clusters...
         </main>
      );
   }

   return (
      <main className="flex justify-center space-y-8">
         <div className="w-full max-w-5xl rounded-3xl border border-white/10 bg-white/10 p-10 shadow-2xl backdrop-blur-xl">

            {/* Header */}
            <div className="text-center mb-10">
               <div className="text-5xl mb-4">📊</div>
               <h1 className="text-5xl font-bold text-white">
                  Report Explorer
               </h1>
               <p className="text-slate-300 mt-2">
                  Select a cluster to view reports
               </p>
            </div>

            {/* Cluster Dropdown */}
            <div className="mb-6">
               <label className="mb-2 block text-sm text-slate-200">
                  Cluster
               </label>

               <Listbox value={selectedClusterId} onChange={setSelectedClusterId}>
                  <div className="relative">

                     <ListboxButton className="w-full cursor-pointer rounded-xl border border-slate-600 bg-slate-800/80 px-4 py-3 text-left text-white backdrop-blur-md transition hover:border-white/20">
                        {selectedCluster?.name || "Select a cluster..."}
                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                           ▼
                        </span>
                     </ListboxButton>

                     <ListboxOptions className="absolute z-50 mt-2 max-h-60 w-full overflow-auto rounded-xl border border-white/10 bg-slate-900/95 backdrop-blur-xl shadow-2xl">

                        {clusters.map((c) => (
                           <ListboxOption
                              key={c.id}
                              value={c.id}
                              className="cursor-pointer px-4 py-3 text-white transition data-[active]:bg-white/10 data-[selected]:font-semibold"
                           >
                              {c.name}
                           </ListboxOption>
                        ))}

                     </ListboxOptions>

                  </div>
               </Listbox>
            </div>

            {/* Loading */}
            {loading && (
               <p className="text-center text-slate-300">
                  Loading reports...
               </p>
            )}

            {/* Empty state */}
            {!loading && selectedClusterId && reports.length === 0 && (
               <p className="text-center text-slate-400">
                  No reports found
               </p>
            )}

            {/* Grouped results */}
            <div className="space-y-6">
               {Object.entries(grouped).map(([date, items]) => (
                  <div
                     key={date}
                     className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden"
                  >
                     {/* Header */}
                     <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 bg-white/5">
                        <h2 className="text-white font-semibold">
                           {date}
                        </h2>

                        <span className="text-xs text-slate-300 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
                           {items.length} {items.length === 1 ? "report" : "reports"}
                        </span>
                     </div>

                     {/* Body */}
                     <div className="p-4 space-y-3">
                        {items.map((r) => {
                           const passed = r.passed;

                           return (
                              <button
                                 key={r.id}
                                 onClick={() => router.push(`/report?id=${r.id}`)}
                                 className={[
                                    "w-full flex items-center justify-between rounded-xl p-4 transition border",
                                    passed
                                       ? "bg-green-500/10 border-green-400/20 hover:bg-green-500/15"
                                       : "bg-red-500/10 border-red-400/20 hover:bg-red-500/15",
                                 ].join(" ")}
                              >
                                 {/* left */}
                                 <div className="flex items-center gap-3">
                                    <div
                                       className={[
                                          "h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold",
                                          passed
                                             ? "bg-green-500/20 text-green-300"
                                             : "bg-red-500/20 text-red-300",
                                       ].join(" ")}
                                    >
                                       {passed ? "✓" : "✕"}
                                    </div>

                                    <div>
                                       <div className="text-white font-medium">
                                          Report #{r.id}
                                       </div>
                                       <div className="text-xs text-slate-400">
                                          {passed ? "Passed checks" : "Failed checks"}
                                       </div>
                                    </div>
                                 </div>

                                 {/* right */}
                                 <div className="text-xs text-slate-400 group-hover:text-white transition">
                                    Open →
                                 </div>
                              </button>
                           );
                        })}
                     </div>
                  </div>
               ))}
            </div>

         </div>
      </main>
   );
}