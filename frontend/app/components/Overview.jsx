'use client';

import { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import { FaCalendarAlt } from "react-icons/fa";

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

export default function Overview() {
   const [date, setDate] = useState('');
   const [report, setReport] = useState({});
   const [reportLoaded, setReportLoaded] = useState(false);

   // Get initial overview report
   useEffect(() => {
      async function loadReport() {
         try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/report/overview`);
            const data = await res.json();
            setReport(data?.body ?? {});
         } catch (error) {
            console.error(error);
            setReport({});
         } finally {
            setReportLoaded(true);
         }
      }

      loadReport();
   }, []);

   // Get different report when date is changed
   useEffect(() => {
      async function loadReportFromDate() {
         setReportLoaded(false);
         setReport({});

         try {
            const res = await fetch(
               `${process.env.NEXT_PUBLIC_API_URL}/report/overview` +
                  `?${new URLSearchParams({
                     date: date
                  }).toString()}`
            );
            const data = await res.json();
            setReport(data?.body ?? {});
         } catch (error) {
            console.error(error);
            setReport({});
         } finally {
            setReportLoaded(true);
         }
      }

      loadReportFromDate();
   }, [date]);

   useEffect(() => {
      console.log(report);
   }, [report]);

   // Show loading
   if (!reportLoaded) {
      return (
         <main className="flex min-h-screen items-center justify-center text-white">
            Loading overview...
         </main>
      );
   }

   // Page
   return (
      <main className="flex justify-center space-y-8">
         <div className="relative z-10 w-full">
            <div className="p-10 ">
               {/* Header */}
               <div className="mb-10 text-left">
                  

                  <h1 className="text-4xl sm:text-5xl font-bold text-white">Reports Overview</h1>

                  <p className="mt-3 text-lg text-slate-300">
                     View a break down of a day&apos;s reports.
                  </p>
               </div>

           


     
           
                                       <p className='text-slate-300'>Select a date and view the status of all reports for that day:</p>
           
                                       <div className='flex mt-4 inline-flex gap-4'>
           
           
           
           
                                           <div className="grid grid-cols-1">
           
                                               <div>
           
           
                                                   <div className="flex items-end gap-1">
                                                       <div className="w-full">
           
           
                                                           <div className='relative'>
           
           
           
                                                               <DatePicker
                                                                   selected={inputValueToDate(date)}
                                                                   onChange={(selectedDate) => setDate(dateToInputValue(selectedDate))}
                                                                  
                                                                   dateFormat="dd/MM/yyyy"
                                                                   placeholderText={new Date().toLocaleDateString('en-GB')}
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


                                       {/* Body */}
               <div className="mb-6 overflow-hidden mt-6">
                  {!report.id ? (
                     <p className="flex items-center justify-center text-white">
                        No overview available
                     </p>
                  ) : (
                     <div>
                        <h1 className="mb-4 text-3xl font-bold text-white md:text-4xl">
                           Breakdown
                        </h1>

                        <h2 className="mb-4 border-t border-white/10 pt-4 text-lg font-semibold text-white md:text-2xl">
                           Completed checks
                        </h2>

                        {report.reports.length > 0 ? (
                           <div className="space-y-4">
                              {report.reports.map((element) => (
                                 <div
                                    key={element.id}
                                    className="rounded-xl border border-white/10 bg-slate-800/70 p-4 shadow-sm transition"
                                 >
                                    <div className="flex flex-col gap-3 sm:grid sm:grid-cols-4 sm:items-center">
                                       {/* Status */}
                                       <div>
                                          <span
                                             className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                                                element.passed
                                                   ? 'border-green-400/30 bg-green-500/20 text-green-300'
                                                   : 'border-red-400/30 bg-red-500/20 text-red-300'
                                             }`}
                                          >
                                             {element.passed ? 'Passed' : 'Failed'}
                                          </span>
                                       </div>

                                       {/* Cluster */}
                                       <div className="text-sm text-white sm:text-base">
                                          <span className="block text-xs uppercase text-slate-400">
                                             Cluster
                                          </span>
                                          {element.cluster}
                                       </div>

                                       {/* Person */}
                                       <div className="text-sm text-white sm:text-base">
                                          <span className="block text-xs uppercase text-slate-400">
                                             Person
                                          </span>
                                          {element.person}
                                       </div>

                                       {/* Timestamp */}
                                       <div className="text-sm text-white sm:text-base">
                                          <span className="block text-xs uppercase text-slate-400">
                                             Duration
                                          </span>
                                          {calculateDuration(
                                             new Date(element.startDate),
                                             new Date(element.endDate)
                                          )}
                                       </div>
                                    </div>

                                    {/* Results */}
                                    <div className="mt-5 space-y-3 border-t border-white/10 pt-4">
                                       {console.log('Component rendered')}

                                       {element.results.map((result) => (
                                          <div
                                             key={`${result.instructionId}`}
                                             className="rounded-lg border border-white/10 bg-slate-900/40 p-3 transition"
                                          >
                                             <div className="mb-2 flex items-start justify-between gap-3">
                                                <h3 className="text-sm font-semibold text-white sm:text-base">
                                                   {result.title}
                                                </h3>

                                                <span
                                                   className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${
                                                      result.passed
                                                         ? 'border-green-400/30 bg-green-500/20 text-green-300'
                                                         : 'border-red-400/30 bg-red-500/20 text-red-300'
                                                   }`}
                                                >
                                                   {result.passed ? 'Passed' : 'Failed'}
                                                </span>
                                             </div>

                                             <p className="block text-xs uppercase text-slate-400">
                                                Notes:
                                             </p>
                                             <p className="break-words text-sm leading-relaxed text-slate-300">
                                                {result.note}
                                             </p>
                                          </div>
                                       ))}
                                    </div>
                                 </div>
                              ))}
                           </div>
                        ) : (
                           <p className="flex items-center justify-center text-white">
                              No completed reports
                           </p>
                        )}

                        <h2 className="mb-4 mt-4 border-t border-white/10 pt-4 text-lg font-semibold text-white md:text-2xl">
                           Missing checks
                        </h2>

                        {report.missing.length === 0 ? (
                           <p className="flex items-center justify-center text-white">
                              All reports completed
                           </p>
                        ) : (
                           <div className="space-y-4">
                              {report.missing.map((element) => (
                                 <div
                                    key={element.clusterId}
                                    className="rounded-xl border border-white/10 bg-slate-800/70 p-4 shadow-sm transition hover:bg-slate-800/90"
                                 >
                                    <div className="flex flex-col gap-4 sm:grid sm:grid-cols-3 sm:items-center">
                                       {/* Status */}
                                       <div>
                                          <span className="inline-flex rounded-full border border-yellow-400/30 bg-yellow-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-yellow-300">
                                             Missing
                                          </span>
                                       </div>

                                       {/* Cluster */}
                                       <div className="text-sm text-white sm:text-base">
                                          <span className="block text-xs uppercase text-slate-400">
                                             Cluster
                                          </span>
                                          {element.cluster}
                                       </div>

                                       {/* Person */}
                                       <div className="text-sm text-white sm:text-base">
                                          <span className="block text-xs uppercase text-slate-400">
                                             Person
                                          </span>
                                          {element.person}
                                       </div>
                                    </div>
                                 </div>
                              ))}
                           </div>
                        )}
                     </div>
                  )}
               </div>
           
           
           
                            
           
           
           
           
           
           
           
           
           
           
           
                          
           
           
           
            </div>
         </div>
      </main>
   );
}
