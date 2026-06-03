"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function Report() {
   const searchParams = useSearchParams();
   const id = searchParams.get("id");

   const [report, setReport] = useState(null);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      if (!id) {
         setLoading(false);
         return;
      }

      async function getReportData() {
         try {
            const res = await fetch(
               `http://localhost:3001/report/id/${id}`
            ).then(async res => {
               return await res.json();
            });
            if (!res.success) return;
            const data = res.body;

            const resultsWithTitles = await Promise.all(
               data.results.map(async (result) => {
                  try {
                     const instructionRes = await fetch(
                        `http://localhost:3001/instruction/specific/${result.instructionId}`
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

   function outcomeStyle(outcome) {
      return outcome === true
         ? "bg-green-500/20 text-green-300 border-green-400/30"
         : "bg-red-500/20 text-red-300 border-red-400/30";
   }

   function formatDate(date) {
      return date.toLocaleDateString("en-GB");
   }

   if (loading) {
      return <p>Loading report...</p>;
   }

   if (!report) {
      return <p>Report not found.</p>;
   }

   return (
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 p-6">
         <div className="mx-auto max-w-6xl">
            <div className="rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur-xl">
               <div className="mb-8">
                  <h1 className="text-4xl font-bold text-white">HPC Test Results</h1>
                  <p className="mt-2 text-slate-300">
                     Results for {formatDate(new Date(report.startTime))} on {report.clusterId}
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
                                    {result.notes || "-"}
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               </div>

               <div className="mt-4 flex flex-col items-end text-md">
                  <div className="text-slate-400">
                     Tester: <span className="text-slate-200">{report.personId}</span>
                  </div>

                  <div className="text-slate-400">
                     Cluster: <span className="text-slate-200">{report.clusterId}</span>
                  </div>

                  {/* <div className="text-slate-400">
                     Duration: <span className="text-slate-200">{duration}</span>
                  </div> */}
               </div>
            </div>
         </div>
      </main>
   );

}