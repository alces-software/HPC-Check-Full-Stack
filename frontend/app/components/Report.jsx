'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { IoCopy, IoShare, IoCheckmark } from 'react-icons/io5';

export default function Report() {
   const searchParams = useSearchParams();
   const id = searchParams.get('id');
   const [report, setReport] = useState(null);
   const [copied, setCopied] = useState(false);
   const [shared, setShared] = useState(false);

   function calculateDuration(start, end) {
      const diffMs = end.getTime() - start.getTime();

      const hours = Math.floor(diffMs / 1000 / 60 / 60);
      const minutes = Math.floor((diffMs / 1000 / 60) % 60);
      const seconds = Math.floor((diffMs / 1000) % 60);

      return `${hours}h ${minutes}m ${seconds}s`;
   }

   function outcomeStyle(outcome) {
      return outcome === true
         ? 'bg-green-500/20 text-green-300 border-green-400/30'
         : 'bg-red-500/20 text-red-300 border-red-400/30';
   }

   function formatDate(date) {
      return date.toLocaleDateString('en-GB');
   }

   useEffect(() => {
      if (!id) return;

      async function getReportData() {
         try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/report/id/${id}`).then(
               (r) => r.json()
            );

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
                        title: instructionData?.body?.title || instructionData?.title || 'Unknown'
                     };
                  } catch {
                     return { ...result, title: 'Unknown' };
                  }
               })
            );

            data.duration = calculateDuration(new Date(data.startTime), new Date(data.endTime));

            setReport({
               ...data,
               results: resultsWithTitles
            });
         } catch (error) {
            console.error('Failed to load report:', error);
         }
      }

      getReportData();
   }, [id]);

   const handleCopy = async () => {
      try {
         await navigator.clipboard.writeText(window.location.href);
         setCopied(true);
         setTimeout(() => setCopied(false), 1500);
      } catch (err) {
         console.error('Failed to copy:', err);
      }
   };

   const handleShare = async () => {
      try {
         navigator
            .share({
               title: `${report.cluster} report`,
               url: window.location.href
            })
            .catch(() => {});
         setShared(true);
         setTimeout(() => setShared(false), 1500);
      } catch (err) {
         console.error('Failed to share:', err);
      }
   };

   if (!report) {
      return (
         <main className="flex justify-center py-10">
            <div className="w-full max-w-6xl">
               <div className="rounded-3xl border border-red-500/20 bg-white/10 p-8 shadow-2xl backdrop-blur-xl">
                  <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
                     <h2 className="text-2xl font-semibold text-white">Report Not Found</h2>

                     <p className="mt-2 text-slate-300">
                        The requested report could not be located.
                     </p>

                     <button
                        onClick={() => window.history.back()}
                        className="mt-6 rounded-xl border border-white/10 bg-white/10 px-5 py-2 text-sm text-white hover:bg-white/20"
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
      <main className="space-y-8">
         <div className="rounded-2xl border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur-xl md:p-8">
            {/* Header */}
            <div className="mb-6 flex items-start justify-between md:mb-8">
               <div>
                  <h1 className="text-3xl font-bold text-white md:text-4xl">HPC Test Results</h1>

                  <p className="mt-2 text-slate-300">
                     Results for {formatDate(new Date(report.startTime))} on {report.cluster}
                  </p>

                  <p className="mt-2 text-slate-300">
                     Checks:
                     <span
                        className={`ml-2 rounded-full border px-2 py-1 text-xs font-semibold uppercase tracking-wide ${
                           report.passed
                              ? 'border-green-400/30 bg-green-500/20 text-green-300'
                              : 'border-red-400/30 bg-red-500/20 text-red-300'
                        }`}
                     >
                        {report.passed ? 'Passed' : 'Failed'}
                     </span>
                  </p>
               </div>
               <div className="flex gap-2">
                  <button
                     type="button"
                     onClick={handleCopy}
                     className={`cursor-pointer rounded-lg border p-2 transition-all duration-300 ${
                        copied
                           ? 'border-green-400/40 bg-green-500/20 text-green-300'
                           : 'border-white/10 bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white'
                     }`}
                     title={copied ? 'Copied!' : 'Copy report link'}
                     aria-label={copied ? 'Copied!' : 'Copy report link'}
                  >
                     {copied ? (
                        <IoCheckmark className="h-5 w-5 animate-pulse" />
                     ) : (
                        <IoCopy className="h-5 w-5" />
                     )}
                  </button>

                  {typeof navigator.share === 'function' && (
                     <button
                        type="button"
                        onClick={handleShare}
                        className={`cursor-pointer rounded-lg border p-2 transition-all duration-300 ${
                           shared
                              ? 'border-green-400/40 bg-green-500/20 text-green-300'
                              : 'border-white/10 bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white'
                        }`}
                        title={shared ? 'Shared!' : 'Share report'}
                        aria-label={shared ? 'Shared!' : 'Share report'}
                     >
                        {shared ? (
                           <IoCheckmark className="h-5 w-5 animate-pulse" />
                        ) : (
                           <IoShare className="h-5 w-5" />
                        )}
                     </button>
                  )}
               </div>
            </div>

            {/* TABLE */}
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
               {/* Mobile */}
               <div className="divide-y divide-white/10 md:hidden">
                  {report.results.map((result, index) => (
                     <div key={index} className="p-4">
                        <div className="flex items-start justify-between gap-3">
                           <h3 className="min-w-0 flex-1 break-words text-white">{result.title}</h3>

                           <span
                              className={`shrink-0 whitespace-nowrap rounded-full border px-3 py-1 text-xs font-bold uppercase ${outcomeStyle(
                                 result.passed
                              )}`}
                           >
                              {result.passed ? 'PASS' : 'FAIL'}
                           </span>
                        </div>

                        <p className="mt-3 text-sm text-slate-300">{result.note || 'No notes'}</p>
                     </div>
                  ))}
               </div>

               {/* Desktop */}
               <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left">
                     <thead className="bg-slate-900/50">
                        <tr>
                           <th className="px-6 py-4 text-sm text-slate-300">Outcome</th>
                           <th className="px-6 py-4 text-sm text-slate-300">Task</th>
                           <th className="px-6 py-4 text-sm text-slate-300">Notes</th>
                        </tr>
                     </thead>

                     <tbody>
                        {report.results.map((result, index) => (
                           <tr key={index} className="border-b border-white/10">
                              <td className="px-6 py-4">
                                 <span
                                    className={`rounded-full border px-3 py-1 text-xs font-bold uppercase ${outcomeStyle(
                                       result.passed
                                    )}`}
                                 >
                                    {result.passed ? 'PASS' : 'FAIL'}
                                 </span>
                              </td>

                              <td className="px-6 py-4 text-white">{result.title}</td>

                              <td className="px-6 py-4 text-slate-300">{result.note || '-'}</td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>

            {/* FOOTER */}
            <div className="mt-6 border-t border-white/10 pt-6">
               <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  <div>
                     <p className="text-xs text-slate-400">Tester</p>
                     <p className="text-white">
                        {report.person} #{report.personId}
                     </p>
                  </div>

                  <div>
                     <p className="text-xs text-slate-400">Cluster</p>
                     <p className="text-white">
                        {report.cluster} #{report.clusterId}
                     </p>
                  </div>

                  <div>
                     <p className="text-xs text-slate-400">Duration</p>
                     <p className="text-white">{report.duration}</p>
                  </div>
               </div>
            </div>
         </div>
      </main>
   );
}
