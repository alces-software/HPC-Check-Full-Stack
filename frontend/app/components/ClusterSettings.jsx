'use client';

import { PDFDownloadLink } from '@react-pdf/renderer';
import ReactMarkdown from 'react-markdown';
import ClusterInstructionsPDF from './ClusterInstructionsPDF.jsx';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaDatabase, FaUser } from 'react-icons/fa';
import { IoIosArrowForward } from 'react-icons/io';

export default function ClusterSettingsPage() {
   const searchParams = useSearchParams();
   const clusterId = searchParams.get('id');

   const [clusters, setClusters] = useState([]);
   const [loadingClusters, setLoadingClusters] = useState(true);

   const loadClusters = useCallback(async () => {
      try {
         const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/hpc`);
         const data = await res.json();
         const clusterResponse = data.body ?? [];
         const enrichedClusters = await Promise.all(
            clusterResponse.map(async (cluster) => {
               const poolRes = await fetch(
                  `${process.env.NEXT_PUBLIC_API_URL}/pool/id/${cluster.poolId}`
               );
               const poolData = await poolRes.json();
               return {
                  ...cluster,
                  pool: poolData.body ?? []
               };
            })
         );

         console.log(enrichedClusters);

         setClusters(enrichedClusters);
      } catch (err) {
         console.error('Failed to fetch clusters:', err);
         setClusters([]);
      } finally {
         setLoadingClusters(false);
      }
   }, []);

   useEffect(() => {
      loadClusters();
   }, [loadClusters]);

   const cluster = clusters.find((cluster) => cluster.id === clusterId);
   const [activeTab, setActiveTab] = useState('instructions');
   const [steps, setSteps] = useState([]);
   const [loadingSteps, setLoadingSteps] = useState(false);
   const [stepsError, setStepsError] = useState('');

   const [status, setStatus] = useState('');
   const [recentCheckDate, setRecentCheckDate] = useState(false);
   const [hasChecks, setHasChecks] = useState(false);

   // METHOD EDITING
   const [editingMethodId, setEditingMethodId] = useState(null);
   const [editedMethodContent, setEditedMethodContent] = useState('');
   const [newMethod, setNewMethod] = useState('');
   const [editingStepID, setEditingStepID] = useState(null);
   const [addMethodStepID, setAddMethodStepID] = useState(null);
   const [editingInstructionId, setEditingInstructionId] = useState(null);

   const [editedInstructionTitle, setEditedInstructionTitle] = useState('');
   const [editedInstructionDescription, setEditedInstructionDescription] = useState('');
   const [editedInstructionExpectedTime, setEditedInstructionExpectedTime] = useState('');
   const [editedInstructionGood, setEditedInstructionGood] = useState('');
   const [editedInstructionBad, setEditedInstructionBad] = useState('');
   const [editedInstructionPosition, setEditedInstructionPosition] = useState(0);

   const [addingInstruction, setAddingInstruction] = useState(false);
   const [newInstructionTitle, setNewInstructionTitle] = useState('');
   const [newInstructionDescription, setNewInstructionDescription] = useState('');
   const [newInstructionExpectedTime, setNewInstructionExpectedTime] = useState('');
   const [newInstructionGood, setNewInstructionGood] = useState('');
   const [newInstructionBad, setNewInstructionBad] = useState('');

   const [reports, setReports] = useState([]);

   const router = useRouter();

   const recentReports = useMemo(() => {
      const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

      return (reports ?? []).filter((report) => {
         return report.startDate >= oneWeekAgo;
      });
   }, [reports]);

   const groupedReports = useMemo(() => {
      const map = {};

      for (const report of recentReports) {
         const key = new Date(report.startDate).toLocaleDateString('en-GB');

         if (!map[key]) {
            map[key] = [];
         }

         map[key].push(report);
      }

      return map;
   }, [recentReports]);

   const getSteps = useCallback(async () => {
      if (!clusterId) return;

      setLoadingSteps(true);
      setStepsError('');

      try {
         const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/instruction/all/${clusterId}`);

         const data = await res.json();

         if (!res.ok) {
            throw new Error(data.message || 'Failed to fetch instructions');
         }

         setSteps(data.body ?? []);
      } catch (err) {
         console.error(err);
         setSteps([]);
         setStepsError('Could not load instructions for this cluster.');
      } finally {
         setLoadingSteps(false);
      }
   }, [clusterId]);

   useEffect(() => {
      getSteps();
   }, [clusterId, getSteps]);

   useEffect(() => {
      async function getReports() {
         if (!clusterId) return;

         try {
            const res = await fetch(
               `${process.env.NEXT_PUBLIC_API_URL}/report/cluster/${clusterId}`
            );

            const data = await res.json();

            if (!res.ok) {
               throw new Error(data.message || 'Failed to fetch reports');
            }

            if (data.body.length === 0) {
               setHasChecks(false);
               return;
            }

            setHasChecks(true);
            setStatus(data.body[0].passed);

            const date = new Date(data.body[0].endDate);

            const formatted = date.toLocaleDateString('en-GB', {
               day: '2-digit',
               month: '2-digit',
               year: '2-digit'
            });

            setRecentCheckDate(formatted);
            setReports(data.body ?? []);
         } catch (err) {
            console.error(err);
         }
      }

      getReports();
   }, [clusterId]);

   async function deleteMethod(methodId) {
      try {
         const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/method/${methodId}`, {
            method: 'DELETE',
            headers: {
               'Content-Type': 'application/json'
            }
         });

         if (!res.ok) {
            throw new Error('Failed to delete method');
         }

         await getSteps();
      } catch (err) {
         console.error(err);
         alert(err.message);
      }
   }

   async function addNewMethod(instructionId, content) {
      try {
         const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/method`, {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json'
            },
            body: JSON.stringify({
               id: instructionId,
               content
            })
         });

         const data = await res.json();

         if (!res.ok) {
            throw new Error(data.error || 'Failed to add method');
         }

         await getSteps();

         setNewMethod('');
         setAddMethodStepID(null);
      } catch (err) {
         console.error(err);
         alert(err.message);
      }
   }

   async function updateMethod(methodId, content) {
      try {
         const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/method`, {
            method: 'PATCH',
            headers: {
               'Content-Type': 'application/json'
            },
            body: JSON.stringify({
               id: methodId,
               content: content
            })
         });

         const data = await res.json();

         if (!res.ok) {
            throw new Error(data.error || 'Failed to update method');
         }

         await getSteps();

         setEditingMethodId(null);
         setEditedMethodContent('');
      } catch (err) {
         console.error(err);
         alert(err.message);
      }
   }

   async function updateInstruction(id, title, description, expectedTime, bad, good, position) {
      try {
         const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/instruction`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
               id,
               title,
               description,
               expectedTime,
               bad,
               good,
               position
            })
         });

         const data = await res.json();

         if (!res.ok) throw new Error(data.error || 'Failed to update instruction');

         await getSteps();

         setEditingInstructionId(null);
      } catch (err) {
         console.error(err);
         alert(err.message);
      }
   }

   async function addInstruction() {
      try {
         const title = newInstructionTitle.trim();
         const description = newInstructionDescription.trim();
         const expectedTime = newInstructionExpectedTime.trim();
         const good = newInstructionGood.trim();
         const bad = newInstructionBad.trim();

         if (!title || !description || !expectedTime || !good || !bad) {
            alert('All inputs are required');
            return;
         }

         const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/instruction`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
               clusterId,
               title,
               description,
               expectedTime,
               good,
               bad
            })
         });

         const data = await res.json();

         if (!res.ok) throw new Error(data.error || 'Failed to add instruction');

         await getSteps();

         setAddingInstruction(false);
         setNewInstructionTitle('');
         setNewInstructionDescription('');
         setNewInstructionExpectedTime('');
         setNewInstructionGood('');
         setNewInstructionBad('');
      } catch (err) {
         console.error(err);
         alert(err.message);
      }
   }

   async function deleteInstruction(id) {
      try {
         const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/instruction/${id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
         });

         const data = await res.json();

         if (!res.ok) {
            throw new Error(data.error || 'Failed to delete instruction');
         }

         await getSteps();
      } catch (err) {
         console.error(err);
         alert(err.message);
      }
   }

   if (loadingClusters) {
      return (
         <main className="flex min-h-screen items-center justify-center">
            <p className="text-white">Loading cluster...</p>
         </main>
      );
   }

   return (
      <main className="flex justify-center space-y-8">
         <div className="relative z-10 w-full">
            <div className="p-10 ">
               {/* Header */}
               <div className="mb-10 text-left">
                  <h1 className="text-5xl font-bold text-white">{cluster.name}</h1>

                  <p className="mt-3 text-lg text-slate-300">Cluster settings and overview</p>

                  <div className="mt-6 space-y-3">
                     {!hasChecks ? (
                        <div className="flex flex-wrap justify-start gap-3">
                           <span className="rounded-full border border-blue-400/30 bg-blue-500/20 px-4 py-2 text-sm font-semibold text-blue-200">
                              No checks have been performed for this cluster
                           </span>
                        </div>
                     ) : (
                        <div className="flex flex-wrap justify-start gap-3">
                           {status ? (
                              <span className="rounded-full border border-green-400/30 bg-green-500/20 px-4 py-2 text-sm font-semibold text-green-300">
                                 Status: Healthy
                              </span>
                           ) : (
                              <span className="rounded-full border border-red-400/30 bg-red-500/20 px-4 py-2 text-sm font-semibold text-red-300">
                                 Status: Failed
                              </span>
                           )}

                           {recentCheckDate && (
                              <span className="rounded-full border border-blue-400/30 bg-blue-500/20 px-4 py-2 text-sm font-semibold text-blue-300">
                                 Last Checked: {recentCheckDate}
                              </span>
                           )}
                        </div>
                     )}

                     <div className="flex flex-wrap justify-start gap-3 pt-3">
                        <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 font-mono text-sm text-slate-300">
                           id: {clusterId}
                        </span>

                        <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 font-mono text-sm text-slate-300">
                           pool: {cluster.pool.name}
                        </span>
                     </div>
                  </div>
               </div>

               <div className="mb-8 flex justify-center">
                  <div className="inline-flex items-center gap-5 rounded-2xl px-8 py-4 backdrop-blur-sm">
                     <button
                        type="button"
                        onClick={() => setActiveTab('instructions')}
                        className={[
                           'cursor-pointer border-b-2 pb-2 text-sm font-semibold tracking-wide transition',
                           activeTab === 'instructions'
                              ? 'border-blue-400 text-white'
                              : 'border-transparent text-slate-400 hover:text-white'
                        ].join(' ')}
                     >
                        Instructions
                     </button>

                     <button
                        type="button"
                        onClick={() => setActiveTab('results')}
                        className={[
                           'cursor-pointer border-b-2 pb-2 text-sm font-semibold tracking-wide transition',
                           activeTab === 'results'
                              ? 'border-blue-400 text-white'
                              : 'border-transparent text-slate-400 hover:text-white'
                        ].join(' ')}
                     >
                        Recent results
                     </button>
                  </div>
               </div>

               {activeTab === 'instructions' && (
                  <div className="rounded-2xl border border-white/10 p-4 backdrop-blur-sm md:p-6">
                     <div className="mb-6 flex items-start justify-between gap-4">
                        <div>
                           <h2 className="text-3xl font-bold text-white">Instructions</h2>

                           <p className="mt-2 text-slate-300">
                              Daily checks and methods for this cluster.
                           </p>
                        </div>

                        {!loadingSteps && steps.length > 0 && (
                           <PDFDownloadLink
                              document={
                                 <ClusterInstructionsPDF
                                    cluster={cluster}
                                    clusterId={clusterId}
                                    steps={steps}
                                 />
                              }
                              fileName={`${cluster.name}-instructions.pdf`}
                              className="cursor-pointer rounded-xl border border-blue-300/25 bg-blue-500/10 px-5 py-2.5 text-sm font-semibold text-blue-100 shadow-md shadow-black/20 transition duration-200 hover:-translate-y-0.5 hover:border-blue-300/45 hover:bg-blue-500/20 hover:text-white"
                           >
                              {({ loading }) => (loading ? 'Preparing PDF...' : 'Export PDF')}
                           </PDFDownloadLink>
                        )}
                     </div>

                     {loadingSteps && (
                        <p className="text-center text-lg text-slate-300">
                           Loading instructions...
                        </p>
                     )}

                     {stepsError && (
                        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                           {stepsError}
                        </div>
                     )}

                     {!loadingSteps && !stepsError && steps.length === 0 && (
                        <p className="text-center text-lg text-slate-300">
                           No instructions available
                        </p>
                     )}

                     {addingInstruction ? (
                        <div className="mb-6 space-y-3 rounded-xl border border-white/10 p-3 md:p-4">
                           <input
                              value={newInstructionTitle}
                              onChange={(e) => setNewInstructionTitle(e.target.value)}
                              placeholder="Title"
                              className="w-full rounded-xl border border-slate-700 bg-slate-900 p-3 text-white"
                           />

                           <textarea
                              value={newInstructionDescription}
                              onChange={(e) => setNewInstructionDescription(e.target.value)}
                              placeholder="Description"
                              className="w-full rounded-xl border border-slate-700 bg-slate-900 p-3 text-white"
                           />

                           <input
                              value={newInstructionExpectedTime}
                              onChange={(e) => setNewInstructionExpectedTime(e.target.value)}
                              placeholder="Expected time"
                              className="w-full rounded-xl border border-slate-700 bg-slate-900 p-3 text-white"
                           />

                           <input
                              value={newInstructionGood}
                              onChange={(e) => setNewInstructionGood(e.target.value)}
                              placeholder="Good outcome"
                              className="w-full rounded-xl border border-slate-700 bg-slate-900 p-3 text-white"
                           />

                           <input
                              value={newInstructionBad}
                              onChange={(e) => setNewInstructionBad(e.target.value)}
                              placeholder="Bad outcome"
                              className="w-full rounded-xl border border-slate-700 bg-slate-900 p-3 text-white"
                           />

                           <div className="flex justify-end gap-3">
                              <button
                                 onClick={() => setAddingInstruction(false)}
                                 className="px-4 py-2 text-slate-300 cursor-pointer"
                              >
                                 Cancel
                              </button>

                              <button
                                 onClick={addInstruction}
                                 className="rounded-xl bg-green-500/20 px-4 py-2 text-green-200 cursor-pointer"
                              >
                                 Add Instruction
                              </button>
                           </div>
                        </div>
                     ) : (
                        <button
                           onClick={() => setAddingInstruction(true)}
                           className="mb-6 rounded-xl bg-blue-500/20 px-4 py-2 text-blue-200 cursor-pointer"
                        >
                           + Add Instruction
                        </button>
                     )}

                     <div className="space-y-6">
                        {steps.map((step, index) => {
                           const isEditing = editingStepID === step.id;
                           const isAddingMethod = addMethodStepID === step.id;

                           return (
                              <section
                                 key={step.id}
                                 className="rounded-2xl border border-white/10 bg-white/5 p-4 md:p-6"
                              >
                                 <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                    <div className="min-w-0 flex-1">
                                       {editingInstructionId === step.id ? (
                                          <div className="space-y-3">
                                             <input
                                                value={editedInstructionTitle}
                                                onChange={(e) =>
                                                   setEditedInstructionTitle(e.target.value)
                                                }
                                                className="w-full rounded-xl border border-slate-700 bg-slate-900 p-4 text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                                             />

                                             <textarea
                                                rows={4}
                                                value={editedInstructionDescription}
                                                onChange={(e) =>
                                                   setEditedInstructionDescription(e.target.value)
                                                }
                                                className="w-full rounded-xl border border-slate-700 bg-slate-900 p-4 text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                                             />

                                             <input
                                                value={editedInstructionExpectedTime}
                                                onChange={(e) =>
                                                   setEditedInstructionExpectedTime(e.target.value)
                                                }
                                                placeholder="Expected time (e.g. 5 mins)"
                                                className="w-full rounded-xl border border-slate-700 bg-slate-900 p-4 text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                                             />

                                             <input
                                                value={editedInstructionGood}
                                                onChange={(e) =>
                                                   setEditedInstructionGood(e.target.value)
                                                }
                                                placeholder="Everything worked"
                                                className="w-full rounded-xl border border-slate-700 bg-slate-900 p-4 text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                                             />
                                             <input
                                                value={editedInstructionBad}
                                                onChange={(e) =>
                                                   setEditedInstructionBad(e.target.value)
                                                }
                                                placeholder="Everything is on fire"
                                                className="w-full rounded-xl border border-slate-700 bg-slate-900 p-4 text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                                             />

                                             <div className="relative">
                                                <select
                                                   value={editedInstructionPosition}
                                                   onChange={(e) =>
                                                      setEditedInstructionPosition(e.target.value)
                                                   }
                                                   className="w-full appearance-none rounded-xl border border-slate-700 bg-slate-900 p-4 pr-12 text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                                                >
                                                   {Array.from({ length: steps.length }, (_, i) => (
                                                      <option key={i + 1} value={i + 1}>
                                                         {i + 1}
                                                      </option>
                                                   ))}
                                                </select>

                                                <svg
                                                   className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
                                                   fill="none"
                                                   stroke="currentColor"
                                                   strokeWidth="2"
                                                   viewBox="0 0 24 24"
                                                >
                                                   <path
                                                      strokeLinecap="round"
                                                      strokeLinejoin="round"
                                                      d="M19 9l-7 7-7-7"
                                                   />
                                                </svg>
                                             </div>

                                             <div className="flex justify-end gap-3">
                                                <button
                                                   type="button"
                                                   onClick={() => {
                                                      setEditingInstructionId(null);
                                                      setEditedInstructionTitle('');
                                                      setEditedInstructionDescription('');
                                                      setEditedInstructionExpectedTime('');
                                                      setEditedInstructionGood('');
                                                      setEditedInstructionBad('');
                                                      setEditedInstructionPosition(0);
                                                   }}
                                                   className="w-full cursor-pointer rounded-xl border border-slate-300/25 bg-slate-500/10 px-4 py-2 text-sm font-semibold text-slate-100 cursor-pointer md:w-auto"
                                                >
                                                   Cancel
                                                </button>

                                                <button
                                                   type="button"
                                                   onClick={() =>
                                                      updateInstruction(
                                                         step.id,
                                                         editedInstructionTitle.trim(),
                                                         editedInstructionDescription.trim(),
                                                         editedInstructionExpectedTime.trim(),
                                                         editedInstructionGood.trim(),
                                                         editedInstructionBad.trim(),
                                                         editedInstructionPosition
                                                      )
                                                   }
                                                   className="w-full cursor-pointer rounded-xl border border-green-300/25 bg-green-500/10 px-4 py-2 text-sm font-semibold text-green-100 cursor-pointer md:w-auto"
                                                >
                                                   Save Changes
                                                </button>
                                             </div>
                                          </div>
                                       ) : (
                                          <>
                                             <div className="mb-2 flex items-center gap-3">
                                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-blue-400/30 bg-blue-500/20 text-sm font-bold text-blue-300">
                                                   {index + 1}
                                                </span>

                                                <h2 className="text-xl font-semibold text-white">
                                                   {step.title}
                                                </h2>
                                                {step.expectedTime && (
                                                   <span className="shrink-0 rounded-full border border-blue-400/20 bg-blue-500/20 px-3 py-1 text-right text-sm font-semibold text-blue-200">
                                                      {step.expectedTime}
                                                   </span>
                                                )}
                                             </div>

                                             <p className="text-slate-300">{step.description}</p>
                                          </>
                                       )}
                                    </div>

                                    <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-start">
                                       <button
                                          type="button"
                                          onClick={() => {
                                             setEditingInstructionId(step.id);
                                             setEditedInstructionTitle(step.title || '');
                                             setEditedInstructionDescription(
                                                step.description || ''
                                             );
                                             setEditedInstructionExpectedTime(
                                                step.expectedTime || ''
                                             );
                                             setEditedInstructionGood(step.good || '');
                                             setEditedInstructionBad(step.bad || '');
                                             setEditedInstructionPosition(step.position || 1);
                                          }}
                                          className="w-full cursor-pointer rounded-xl border border-blue-300/25 bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-100 shadow-md shadow-black/20 transition duration-200 hover:-translate-y-0.5 hover:border-blue-300/45 hover:bg-blue-500/20 hover:text-white cursor-pointer md:w-auto"
                                       >
                                          Edit Instruction
                                       </button>

                                       <button
                                          type="button"
                                          onClick={() => {
                                             const confirmed = window.confirm(
                                                'Delete this instruction? This will remove all methods too.'
                                             );

                                             if (confirmed) {
                                                deleteInstruction(step.id);
                                             }
                                          }}
                                          className="w-full cursor-pointer rounded-xl border border-red-300/25 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-100 shadow-md shadow-black/20 transition duration-200 hover:-translate-y-0.5 hover:border-red-300/45 hover:bg-red-500/20 hover:text-white cursor-pointer md:w-auto"
                                       >
                                          Delete Instruction
                                       </button>
                                    </div>
                                 </div>

                                 <details className="mb-4 rounded-xl border border-white/10 bg-slate-900/40 p-3 md:p-4">
                                    <summary className="cursor-pointer font-medium text-blue-300 transition hover:text-blue-200 cursor-pointer">
                                       View Methods
                                    </summary>

                                    <ul className="mt-4 space-y-3 text-slate-300">
                                       {(step.methods || []).length === 0 && (
                                          <li className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-400">
                                             No methods available for this instruction.
                                          </li>
                                       )}

                                       {(step.methods || []).map((method, methodIndex) => (
                                          <li key={method.id} className="rounded-xl px-4 py-4">
                                             {editingMethodId === method.id ? (
                                                <div>
                                                   <textarea
                                                      rows={6}
                                                      value={editedMethodContent}
                                                      onChange={(e) =>
                                                         setEditedMethodContent(e.target.value)
                                                      }
                                                      className="w-full rounded-xl border border-slate-700 bg-slate-900 p-4 text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                                                   />

                                                   <div className="mt-3 flex flex-col gap-3 md:flex-row md:justify-end">
                                                      <button
                                                         type="button"
                                                         onClick={() => {
                                                            setEditingMethodId(null);
                                                            setEditedMethodContent('');
                                                         }}
                                                         className="w-full cursor-pointer rounded-xl border border-slate-300/25 bg-slate-500/10 px-4 py-2 text-sm font-semibold text-slate-100 shadow-md shadow-black/20 transition duration-200 hover:-translate-y-0.5 hover:border-slate-300/45 hover:bg-slate-500/20 hover:text-white md:w-auto"
                                                      >
                                                         Cancel
                                                      </button>

                                                      <button
                                                         type="button"
                                                         onClick={() => {
                                                            const sanitizedContent =
                                                               editedMethodContent.trim();

                                                            if (sanitizedContent === '') {
                                                               alert('Please enter method content');
                                                               return;
                                                            }

                                                            updateMethod(
                                                               method.id,
                                                               sanitizedContent
                                                            );
                                                         }}
                                                         className="w-full cursor-pointer rounded-xl border border-green-300/25 bg-green-500/10 px-4 py-2 text-sm font-semibold text-green-100 shadow-md shadow-black/20 transition duration-200 hover:-translate-y-0.5 hover:border-green-300/45 hover:bg-green-500/20 hover:text-white md:w-auto"
                                                      >
                                                         Save Changes
                                                      </button>
                                                   </div>
                                                </div>
                                             ) : (
                                                <div className="flex gap-3">
                                                   <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-xs font-semibold text-blue-300">
                                                      {methodIndex + 1}
                                                   </span>

                                                   <div className="prose prose-invert max-w-none text-sm leading-relaxed overflow-x-auto">
                                                      <ReactMarkdown>
                                                         {method.content}
                                                      </ReactMarkdown>
                                                   </div>
                                                </div>
                                             )}

                                             {isEditing && editingMethodId !== method.id && (
                                                <div className="mt-4 flex flex-col gap-3 md:flex-row md:justify-end">
                                                   <button
                                                      type="button"
                                                      onClick={() => {
                                                         setEditingMethodId(method.id);
                                                         setEditedMethodContent(method.content);
                                                      }}
                                                      className="w-full cursor-pointer rounded-xl border border-blue-300/25 bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-100 shadow-md shadow-black/20 transition duration-200 hover:-translate-y-0.5 hover:border-blue-300/45 hover:bg-blue-500/20 hover:text-white md:w-auto"
                                                   >
                                                      Edit Method
                                                   </button>

                                                   <button
                                                      type="button"
                                                      onClick={() => {
                                                         const confirmed = window.confirm(
                                                            'Are you sure you want to delete this method?'
                                                         );

                                                         if (confirmed) {
                                                            deleteMethod(method.id);
                                                         }
                                                      }}
                                                      className="w-full cursor-pointer rounded-xl border border-red-300/25 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-100 shadow-md shadow-black/20 transition duration-200 hover:-translate-y-0.5 hover:border-red-300/45 hover:bg-red-500/20 hover:text-white md:w-auto"
                                                   >
                                                      Delete Method
                                                   </button>
                                                </div>
                                             )}
                                          </li>
                                       ))}

                                       {!isEditing ? (
                                          <li className="flex flex-col justify-end">
                                             <button
                                                type="button"
                                                onClick={() => setEditingStepID(step.id)}
                                                className="mt-4 cursor-pointer rounded-xl border border-white/15 bg-white/10 px-5 py-2.5 text-sm font-semibold text-slate-100 shadow-md shadow-black/20 backdrop-blur transition duration-200 hover:-translate-y-0.5 hover:border-blue-300/45 hover:bg-blue-400/15 hover:text-white"
                                             >
                                                Edit Methods
                                             </button>
                                          </li>
                                       ) : (
                                          <li className="flex flex-col justify-end">
                                             {!isAddingMethod ? (
                                                <button
                                                   type="button"
                                                   onClick={() => setAddMethodStepID(step.id)}
                                                   className="mt-4 cursor-pointer rounded-xl border border-emerald-300/25 bg-emerald-400/10 px-5 py-2.5 text-sm font-semibold text-emerald-100 shadow-md shadow-black/20 backdrop-blur transition duration-200 hover:-translate-y-0.5 hover:border-emerald-300/45 hover:bg-emerald-400/20 hover:text-white"
                                                >
                                                   Add Method ＋
                                                </button>
                                             ) : (
                                                <div className="mt-4">
                                                   <textarea
                                                      rows={6}
                                                      value={newMethod}
                                                      onChange={(e) => setNewMethod(e.target.value)}
                                                      placeholder="Enter method..."
                                                      className="w-full rounded-xl border border-slate-700 bg-slate-900 p-4 text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                                                   />

                                                   <div className="mt-3 flex flex-col gap-3 md:flex-row md:justify-end">
                                                      <button
                                                         type="button"
                                                         onClick={() => {
                                                            setAddMethodStepID(null);
                                                            setNewMethod('');
                                                         }}
                                                         className="w-full cursor-pointer rounded-xl border border-slate-300/25 bg-slate-500/10 px-4 py-2 text-sm font-semibold text-slate-100 shadow-md shadow-black/20 transition duration-200 hover:-translate-y-0.5 hover:border-slate-300/45 hover:bg-slate-500/20 hover:text-white md:w-auto"
                                                      >
                                                         Cancel
                                                      </button>

                                                      <button
                                                         type="button"
                                                         onClick={() => {
                                                            const sanitizedContent =
                                                               newMethod.trim();

                                                            if (sanitizedContent === '') {
                                                               alert('Please enter a method');
                                                               return;
                                                            }

                                                            addNewMethod(step.id, sanitizedContent);
                                                         }}
                                                         className="w-full cursor-pointer rounded-xl border border-green-300/25 bg-green-500/15 px-5 py-2 text-sm font-semibold text-green-100 shadow-md shadow-black/20 transition duration-200 hover:-translate-y-0.5 hover:border-green-300/45 hover:bg-green-500/25 hover:text-white md:w-auto"
                                                      >
                                                         Add Method
                                                      </button>
                                                   </div>
                                                </div>
                                             )}

                                             <button
                                                type="button"
                                                onClick={() => {
                                                   setEditingStepID(null);
                                                   setAddMethodStepID(null);
                                                   setEditingMethodId(null);
                                                   setEditedMethodContent('');
                                                   setNewMethod('');
                                                   setEditingInstructionId(null);
                                                   setEditedInstructionTitle('');
                                                   setEditedInstructionDescription('');
                                                }}
                                                className="mt-4 cursor-pointer rounded-xl border border-slate-300/20 bg-slate-100/10 px-5 py-2.5 text-sm font-semibold text-slate-200 shadow-md shadow-black/20 backdrop-blur transition duration-200 hover:-translate-y-0.5 hover:border-slate-200/40 hover:bg-slate-100/15 hover:text-white"
                                             >
                                                Close Editor X
                                             </button>
                                          </li>
                                       )}
                                    </ul>
                                 </details>

                                 <div className="grid gap-4 md:grid-cols-2">
                                    {step.good && (
                                       <div className="rounded-xl border border-green-400/20 bg-green-500/10 p-4">
                                          <p className="text-xs font-semibold uppercase tracking-wide text-green-300">
                                             Good
                                          </p>

                                          <p className="mt-2 text-sm leading-relaxed text-slate-300">
                                             {step.good}
                                          </p>
                                       </div>
                                    )}

                                    {step.bad && (
                                       <div className="rounded-xl border border-red-400/20 bg-red-500/10 p-4">
                                          <p className="text-xs font-semibold uppercase tracking-wide text-red-300">
                                             Bad
                                          </p>

                                          <p className="mt-2 text-sm leading-relaxed text-slate-300">
                                             {step.bad}
                                          </p>
                                       </div>
                                    )}
                                 </div>
                              </section>
                           );
                        })}
                     </div>
                  </div>
               )}

               {activeTab === 'results' && (
                  <div className="rounded-2xl border border-white/10 p-6 backdrop-blur-sm">
                     <div className="mb-6">
                        <h2 className="text-3xl font-bold text-white">Recent Results</h2>

                        <p className="mt-3 text-slate-300">
                           Reports from the last 7 days for this cluster.
                        </p>
                     </div>

                     {reports.length === 0 && (
                        <p className="text-center text-slate-400">No reports found</p>
                     )}

                     {reports.length > 0 && recentReports.length === 0 && (
                        <p className="text-center text-slate-400">
                           No reports found in the last 7 days
                        </p>
                     )}

                     <div className="space-y-6">
                        {Object.entries(groupedReports).map(([date, items]) => (
                           <div
                              key={date}
                              className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm"
                           >
                              <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-5 py-3">
                                 <h2 className="font-semibold tracking-wide text-white">{date}</h2>

                                 <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                                    {items.length} reports
                                 </span>
                              </div>

                              <div className="space-y-2 p-4">
                                 {items.map((report) => {
                                    const passed = report.passed;

                                    return (
                                       <button
                                          key={report.id}
                                          type="button"
                                          onClick={() => router.push(`/report?id=${report.id}`)}
                                          className={[
                                             'group w-full text-left',
                                             'rounded-xl border px-4 py-4',
                                             'transition-all duration-200',
                                             'hover:-translate-y-[1px] hover:shadow-lg cursor-pointer',
                                             'active:scale-[0.99]',
                                             passed
                                                ? 'border-green-400/30 bg-green-500/20'
                                                : 'border-red-400/30 bg-red-500/20'
                                          ].join(' ')}
                                       >
                                          <div className="flex items-start justify-between gap-4">
                                             <div className="flex gap-3">
                                                <div
                                                   className={[
                                                      'mt-1 h-3 w-3 shrink-0 rounded-full',
                                                      passed ? 'bg-green-400' : 'bg-red-400'
                                                   ].join(' ')}
                                                />

                                                <div className="space-y-1">
                                                   <div className="flex items-center gap-2">
                                                      <span className="font-medium text-white">
                                                         Report #{report.id}
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

                                                   <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-300">
                                                      <div className="mt-3 flex flex-wrap gap-2">
                                                         <span className="inline-flex items-center gap-2 rounded-lg border border-slate-600 bg-slate-800/80 px-3 py-1 text-sm font-medium text-white">
                                                            <FaUser
                                                               className="text-blue-300"
                                                               aria-hidden="true"
                                                            />
                                                            {report.person || 'Unknown'}
                                                         </span>
                                                      </div>
                                                   </div>
                                                </div>
                                             </div>

                                             <div className="flex items-center gap-1 text-xs text-slate-300 transition group-hover:text-white">
                                                <span className="opacity-0 transition group-hover:opacity-100">
                                                   Open
                                                </span>

                                                <span className="transition group-hover:translate-x-0.5">
                                                   <IoIosArrowForward></IoIosArrowForward>
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
                  </div>
               )}
            </div>
         </div>
      </main>
   );
}
