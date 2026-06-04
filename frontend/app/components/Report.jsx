"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function Report() {
   const searchParams = useSearchParams();
   const id = searchParams.get("id");

   const [report, setReport] = useState(null);
   const [loading, setLoading] = useState(() => (id ? true : false));

   function calculateDuration(start, end) {
      const diffMs = end.getTime() - start.getTime();

      const hours = Math.floor(diffMs / 1000 / 60 / 60);
      const minutes = Math.floor((diffMs / 1000 / 60) % 60);
      const seconds = Math.floor((diffMs / 1000) % 60);

      return `${hours}h ${minutes}m ${seconds}s`;
   }

   function outcomeStyle(outcome) {
      return outcome === true
         ? "bg-green-500/20 text-green-300 border-green-400/30"
         : "bg-red-500/20 text-red-300 border-red-400/30";
   }

   function formatDate(date) {
      return date.toLocaleDateString("en-GB");
   }

   useEffect(() => {
      if (!id) return;

      async function getReportData() {
         try {
            const res = await fetch(
               `${process.env.NEXT_PUBLIC_API_URL}/report/id/${id}`
            ).then(async res => {
               return await res.json();
            });
            if (!res.success) return;
            const data = res.body;

            const resultsWithTitles = await Promise.all(
               data.results.map(async (result) => {
                  try {
                     const instructionRes = await fetch(
                        `${process.env.NEXT_PUBLIC_API_URL}/instruction/specific/${result.instructionId}`
                     );

                     const instructionData = await instructionRes.json();

                     return {
                        ...result,
                        title:
                           instructionData?.body?.title ||
                           instructionData?.title ||
                           "Unknown",
                     };
                  } catch {
                     return {
                        ...result,
                        title: "Unknown",
                     };
                  }
               })
            );

            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/people/id/${data.personId}`)
               .then(res => res.json())
               .then(res => data.person = res.body.name);

            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/hpc/id/${data.clusterId}`)
               .then(res => res.json())
               .then(res => {
                  data.cluster = res.body.name
               });

            data.duration = calculateDuration(new Date(data.startTime), new Date(data.endTime));

            setReport({
               ...data,
               results: resultsWithTitles,
            });
         } catch (error) {
            console.error("Failed to load report:", error);
         } finally {
            setLoading(false);
         }
      }

      getReportData();
   }, [id]);

   if (loading) {
      return (
         <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 p-6">
            <div className="w-full max-w-6xl">
               <div className="rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur-xl">
                  <div className="animate-pulse">
                     {/* Header */}
                     <div className="mb-8">
                        <div className="h-10 w-72 rounded-lg bg-white/10" />
                        <div className="mt-3 h-5 w-96 rounded bg-white/5" />
                     </div>

                     {/* Table */}
                     <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                        <div className="border-b border-white/10 bg-slate-900/50 px-6 py-4">
                           <div className="flex gap-6">
                              <div className="h-4 w-20 rounded bg-white/10" />
                              <div className="h-4 w-48 rounded bg-white/10" />
                              <div className="h-4 w-32 rounded bg-white/10" />
                           </div>
                        </div>

                        <div className="p-6">
                           {[...Array(3)].map((_, i) => (
                              <div
                                 key={i}
                                 className={`flex items-center gap-6 py-4 ${i !== 2 ? "border-b border-white/10" : ""
                                    }`}
                              >
                                 <div className="h-8 w-20 rounded-full bg-white/10" />
                                 <div className="h-5 flex-1 rounded bg-white/10" />
                                 <div className="h-5 w-64 rounded bg-white/5" />
                              </div>
                           ))}
                        </div>
                     </div>

                     {/* Footer */}
                     <div className="mt-4 flex flex-col items-end gap-2">
                        <div className="h-4 w-40 rounded bg-white/10" />
                        <div className="h-4 w-36 rounded bg-white/10" />
                        <div className="h-4 w-32 rounded bg-white/10" />
                     </div>
                  </div>
               </div>
            </div>
         </main>
      );
   }

   if (!report) {
      return (
         <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 p-6">
            <div className="w-full max-w-6xl">
               <div className="rounded-3xl border border-red-500/20 bg-white/10 p-8 shadow-2xl backdrop-blur-xl">
                  <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
                     <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-red-400/30 bg-red-500/10">
                        <span className="text-3xl">⚠</span>
                     </div>

                     <h2 className="text-2xl font-semibold text-white">
                        Report Not Found
                     </h2>

                     <p className="mt-2 max-w-md text-slate-300">
                        The requested HPC test report could not be located.
                        It may have been removed, or the URL may be incorrect.
                     </p>

                     <button
                        onClick={() => window.history.back()}
                        className="mt-6 rounded-xl border border-white/10 bg-white/10 px-5 py-2 text-sm font-medium text-white transition hover:bg-white/20"
                     >
                        Go Back
                     </button>
                  </div>
               </div>
            </div>
         </main>
      );
   }

   return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 p-6">
         <div className="w-full max-w-6xl">
            <div className="rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur-xl">
               <div className="mb-8">
                  <h1 className="text-4xl font-bold text-white">
                     HPC Test Results
                  </h1>
                  <p className="mt-2 text-slate-300">
                     Results for {formatDate(new Date(report.startTime))} on{" "}
                     {report.cluster}
                  </p>
               </div>

               <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                  <div className="overflow-x-auto">
                     <table className="w-full text-left">
                        <thead className="bg-slate-900/50">
                           <tr>
                              <th className="w-32 px-6 py-4 text-sm font-semibold uppercase tracking-wide text-slate-300">
                                 Outcome
                              </th>
                              <th className="px-6 py-4 text-sm font-semibold uppercase tracking-wide text-slate-300">
                                 Task
                              </th>
                              <th className="w-64 px-6 py-4 text-sm font-semibold uppercase tracking-wide text-slate-300">
                                 Notes
                              </th>
                           </tr>
                        </thead>

                        <tbody>
                           {report.results.map((result, index) => (
                              <tr
                                 key={result.title}
                                 className={
                                    index !== report.results.length - 1
                                       ? "border-b border-white/10"
                                       : ""
                                 }
                              >
                                 <td className="px-6 py-4">
                                    <span
                                       className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wide ${outcomeStyle(
                                          result.passed
                                       )}`}
                                    >
                                       {result.passed ? "PASS" : "FAIL"}
                                    </span>
                                 </td>

                                 <td className="px-6 py-4 font-medium text-white">
                                    {result.title}
                                 </td>

                                 <td className="whitespace-pre-line px-6 py-4 text-slate-300">
                                    {result.note || "-"}
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               </div>

               <div className="mt-4 flex flex-col items-end text-md">
                  <div className="text-slate-400">
                     Tester:{" "}
                     <span className="text-slate-200">{report.person}</span>
                  </div>

                  <div className="text-slate-400">
                     Cluster:{" "}
                     <span className="text-slate-200">{report.cluster}</span>
                  </div>

                  <div className="text-slate-400">
                     Duration:{" "}
                     <span className="text-slate-200">{report.duration}</span>
                  </div>
               </div>
            </div>
         </div>
      </main>
   );
}