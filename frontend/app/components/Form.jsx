'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { FaClipboardList, FaRegCopy, FaCheck, FaLightbulb } from 'react-icons/fa';
import Loading from '../components/Loading';

function getTodayTimeMs(value) {
   const numericValue = Number(value);

   if (Number.isNaN(numericValue)) return null;

   let hours;
   let minutes;

   if (Number.isInteger(numericValue) && numericValue >= 100) {
      hours = Math.floor(numericValue / 100);
      minutes = numericValue % 100;
   } else {
      hours = Math.floor(numericValue);
      minutes = Math.round((numericValue - hours) * 60);
   }

   if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;

   const date = new Date();
   date.setHours(hours, minutes, 0, 0);

   return date.getTime();
}

function getTimeRemainingMs(endTimeMs) {
   if (!endTimeMs) return 0;

   return Math.max(0, endTimeMs - Date.now());
}

function formatTimeRemaining(milliseconds) {
   const totalSeconds = Math.floor(milliseconds / 1000);
   const hours = Math.floor(totalSeconds / 3600);
   const minutes = Math.floor((totalSeconds % 3600) / 60);
   const seconds = totalSeconds % 60;

   return [hours, minutes, seconds].map((value) => String(value).padStart(2, '0')).join(':');
}

function getNodeText(node) {
   if (node === null || node === undefined || typeof node === 'boolean') return '';
   if (typeof node === 'string' || typeof node === 'number') return String(node);
   if (Array.isArray(node)) return node.map(getNodeText).join('');
   if (node.props?.children) return getNodeText(node.props.children);

   return '';
}

function CopyablePre({ children }) {
   const [copied, setCopied] = useState(false);
   const code = getNodeText(children).replace(/\n$/, '');

   async function copyCode() {
      try {
         await navigator.clipboard.writeText(code);
         setCopied(true);
         setTimeout(() => setCopied(false), 1500);
      } catch (err) {
         console.error('Failed to copy code:', err);
      }
   }

   return (
      <div className="not-prose mt-0 mb-0 relative my-4 overflow-hidden rounded-xl border border-white/10 bg-slate-950">
         <button
            type="button"
            onClick={copyCode}
            className="absolute right-2 top-2 flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-200 transition hover:bg-white/10"
            aria-label={copied ? 'Copied code to clipboard' : 'Copy code to clipboard'}
            title={copied ? 'Copied' : 'Copy'}
         >
            {copied ? (
               <FaCheck className="h-3.5 w-3.5 text-green-300" aria-hidden="true" />
            ) : (
               <FaRegCopy className="h-3.5 w-3.5" aria-hidden="true" />
            )}
         </button>

         <pre className="overflow-x-auto p-4 pr-20 text-sm text-slate-100">{children}</pre>
      </div>
   );
}

export default function Form() {
   const [completedSteps, setCompletedSteps] = useState({});

   const [bonusChallenge, setBonusChallenge] = useState(null);
   const [bonusCompleted, setBonusCompleted] = useState(false);

   const [checkFocus, setCheckFocus] = useState(null);
   const [focusReflection, setFocusReflection] = useState('');

   const [hpcQuestion, setHpcQuestion] = useState(null);
   const [selectedAnswerIndex, setSelectedAnswerIndex] = useState(null);
   const [hpcQuestionResult, setHpcQuestionResult] = useState(null);

   //METHOD-HIDING SETTINGS
   const [hiddenMethodIds, setHiddenMethodIds] = useState([]);
   const [revealedMethodIds, setRevealedMethodIds] = useState([]);
   const MAX_HIDDEN_METHODS = 2;
   const HIDE_METHOD_CHANCE = 0.2;

   const [allClusters, setAllClusters] = useState([]);
   const [steps, setSteps] = useState([]);
   const [allNames, setAllNames] = useState([]);
   const [startTime] = useState(() => Date.now());
   const [windowReady, setWindowReady] = useState(false);
   const [endTimeMs, setEndTimeMs] = useState(null);
   const [timeRemainingMs, setTimeRemainingMs] = useState(0);
   const [submitting, setSubmitting] = useState(false);
   const [nameID] = useState(() => Cookies.get('selectedPersonId') || '');
   const [cookieCluster] = useState(() => Cookies.get('currentCluster') || '');
   const canSubmit = windowReady && timeRemainingMs > 0;

   const [editingMethodId, setEditingMethodId] = useState(null);
   const [editedMethodContent, setEditedMethodContent] = useState('');
   const [newMethod, setNewMethod] = useState('');

   const [editingStepID, setEditingStepID] = useState(null);
   const [addMethodStepID, setAddMethodStepID] = useState(null);

   const router = useRouter();
   const redirected = useRef(false);
   const timeLimitRedirected = useRef(false);
   const isFinalTwentyMinutes = windowReady && timeRemainingMs <= 20 * 60 * 1000;

   useEffect(() => {
      if (!endTimeMs) {
         return;
      }

      const timer = setInterval(() => {
         setTimeRemainingMs(getTimeRemainingMs(endTimeMs));
      }, 1000);

      return () => clearInterval(timer);
   }, [endTimeMs]);

   useEffect(() => {
      if (!nameID) {
         return;
      }

      async function getTeamTimeLimit() {
         try {
            const personRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/people/id/${nameID}`);
            const personData = await personRes.json();
            const teamId = personData.body?.teamId;

            if (!teamId) {
               setWindowReady(true);
               return;
            }

            const teamRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/teams/id/${teamId}`);
            const teamData = await teamRes.json();
            const endMs = getTodayTimeMs(teamData.body?.end_window);

            if (endMs !== null) {
               setTimeRemainingMs(getTimeRemainingMs(endMs));
               setEndTimeMs(endMs);
            }

            setWindowReady(true);
         } catch (err) {
            console.error('Failed to load team time limit:', err);
            setWindowReady(true);
         }
      }

      getTeamTimeLimit();
   }, [nameID]);

   useEffect(() => {
      if ((!nameID || !cookieCluster) && !redirected.current) {
         redirected.current = true;
         router.replace('/name');
      }
   }, [nameID, cookieCluster, router]);

   // GET NAMES
   useEffect(() => {
      async function getNames() {
         const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/people`);
         const data = await res.json();
         setAllNames(data.body);
      }
      getNames();
   }, []);

   useEffect(() => {
      if (!windowReady || timeRemainingMs > 0 || timeLimitRedirected.current) return;

      if (nameID && cookieCluster) {
         timeLimitRedirected.current = true;

         alert(
            'You have exceeded the time limit for checks. Speak to your manager or system administrator. You will now be redirected to the home page.'
         );

         router.push('/');
      }
   }, [windowReady, timeRemainingMs, nameID, cookieCluster, router]);

   const name = allNames.find((p) => p.id === nameID)?.name;

   // GET CLUSTERS
   useEffect(() => {
      async function getAllClusters() {
         const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/hpc`);
         const data = await res.json();
         setAllClusters(data.body);
      }
      getAllClusters();
   }, []);

   const clusterId = allClusters.find((c) => c.id === cookieCluster)?.id;
   const clusterName = allClusters.find((c) => c.id === cookieCluster)?.name;

   function chooseHiddenMethods(loadedSteps) {
      const hiddenIds = [];

      for (const step of loadedSteps) {
         for (const method of step.methods || []) {
            if (hiddenIds.length >= MAX_HIDDEN_METHODS) {
               return hiddenIds;
            }

            if (Math.random() < HIDE_METHOD_CHANCE) {
               hiddenIds.push(method.id);
            }
         }
      }
      return hiddenIds;
   }

   const getSteps = useCallback(async () => {
      if (!clusterId) return;

      try {
         const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/instruction/all/${clusterId}`);
         const data = await res.json();

         const loadedSteps = data.body ?? [];
         const selectedHiddenMethodIds = chooseHiddenMethods(loadedSteps);

         setSteps(loadedSteps);
         setHiddenMethodIds(selectedHiddenMethodIds);
         setRevealedMethodIds([]);
      } catch (err) {
         console.error(err);
      }
   }, [clusterId]);

   function revealMethod(methodId) {
      setRevealedMethodIds((currentIds) => {
         if (currentIds.includes(methodId)) return currentIds;

         return [...currentIds, methodId];
      });
   }

   useEffect(() => {
      getSteps();
   }, [getSteps]);

   useEffect(() => {
      async function getBonusChallenge() {
         try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bonus-challenge/random`);
            const data = await res.json();

            if (!data.success) {
               setBonusChallenge(null);
               return;
            }
            setBonusChallenge(data.body);
         } catch (error) {
            console.error('Failed to fetch bonus challenge:', error);
            setBonusChallenge(null);
         }
      }

      getBonusChallenge();
   }, []);

   useEffect(() => {
      async function getHpcQuestion() {
         try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/hpc-question/random`);
            const data = await res.json();

            if (!data.success) {
               setHpcQuestion(null);
               return;
            }

            setHpcQuestion(data.body);
         } catch (error) {
            console.error('Failed to fetch HPC question', error);
            setHpcQuestion(null);
         }
      }
      getHpcQuestion();
   }, []);

   async function checkHpcAnswer(answerIndex) {
      if (!hpcQuestion || hpcQuestionResult) return;

      try {
         setSelectedAnswerIndex(answerIndex);

         const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/hpc-question/check`, {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json'
            },
            body: JSON.stringify({
               questionId: hpcQuestion.id,
               selectedAnswerIndex: answerIndex,
               optionOrder: hpcQuestion.optionOrder
            })
         });

         const data = await res.json();

         if (!res.ok) {
            throw new Error(data.error || 'Failed to check answer');
         }

         setHpcQuestionResult(data.body);
      } catch (error) {
         console.error('Failed to check HPC answer:', error);
      }
   }

   useEffect(() => {
      async function getCheckFocus() {
         try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/check-focus/random`);
            const data = await res.json();

            if (!data.success) {
               setCheckFocus(null);
               return;
            }

            setCheckFocus(data.body);
         } catch (error) {
            console.error('Failed to fetch check focus:', error);
            setCheckFocus(null);
         }
      }

      getCheckFocus();
   }, []);

   function toggleStep(stepId) {
      setCompletedSteps((prev) => ({
         ...prev,
         [stepId]: !prev[stepId]
      }));
   }

   async function handleSubmit(event) {
      event.preventDefault();
      setSubmitting(true);

      const formData = new FormData(event.currentTarget);

      for (const step of steps) {
         const passed = Boolean(completedSteps[step.id]);

         if (!passed) {
            const failureReason = formData.get(`step${step.id}FailureReason`)?.toString().trim();

            if (!failureReason) {
               alert(`Please provide a failure reason for ${step.title}`);
               setSubmitting(false);
               return;
            }
         }
      }

      const payload = {
         clusterId,
         personId: nameID,
         startTime,
         endTime: Date.now(),
         results: steps.map((step) => {
            const passed = Boolean(completedSteps[step.id]);

            const note = passed
               ? formData.get(`step${step.id}Notes`)
               : formData.get(`step${step.id}FailureReason`);

            return {
               instructionId: step.id,
               passed,
               note: String(note || '')
            };
         }),
         bonusChallengeResult:
            bonusChallenge && bonusCompleted
               ? {
                    bonusChallengeId: bonusChallenge.id,
                    completed: bonusCompleted
                 }
               : null,

         checkFocusResult: checkFocus
            ? {
                 checkFocusId: checkFocus.id,
                 reflection: focusReflection.trim()
              }
            : null
      };

      try {
         const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/report`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
         });

         const data = await res.json();

         if (!res.ok) throw new Error(data.message);

         Cookies.remove('selectedPersonId');
         Cookies.remove('currentCluster');

         alert('Report submitted successfully.');
         router.replace(`/report?id=${data.body.reportId}`);
      } catch (err) {
         console.error(err);
      } finally {
         setSubmitting(false);
      }
   }

   if (!clusterId || !nameID) {
      return <Loading />;
   }

   // DELETE METHOD
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

         await getSteps(); // refresh methods
      } catch (err) {
         console.error(err);
      }
   }

   // ADD METHOD
   async function addNewMethod(instructionId, content) {
      try {
         const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/method`, {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json'
            },
            body: JSON.stringify({
               id: instructionId,
               content: content
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

   // UPDATE METHOD
   async function updateMethod(methodId, content) {
      try {
         const apiUrl = process.env.NEXT_PUBLIC_API_URL;
         const url = `${apiUrl}/method`;

         const res = await fetch(url, {
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

   return (
      <main className="flex justify-center space-y-8">
         <div className="relative z-10 w-full">
            <form onSubmit={handleSubmit} className="p-10">
               {/* Header */}
               <div className="mb-10 text-center md:text-left">
                  <h1 className="text-4xl sm:text-5xl font-bold text-white">
                     Process Documentation
                  </h1>

                  <p className="mt-3 text-lg text-slate-300">
                     {name}&apos;s Check for{' '}
                     <span className="font-semibold text-blue-300">{clusterName}</span>
                  </p>
               </div>

               {/* Focus */}
               {checkFocus && (
                  <section className="mb-8 rounded-2xl border border-purple-400/30 bg-purple-500/10 p-4 md:p-6">
                     <p className="text-sm font-semibold uppercase tracking-wide text-purple-300">
                        Today&apos;s Focus
                     </p>

                     <h2 className="mt-1 text-xl font-semibold text-white">{checkFocus.title}</h2>

                     <p className="mt-2 text-slate-200">{checkFocus.description}</p>
                  </section>
               )}

               {/* Steps */}
               <div className="space-y-6">
                  {steps.length == 0 && (
                     <p className="text-lg text-slate-300 text-center">No instruction available</p>
                  )}

                  {steps.map((step, index) => {
                     const isCompleted = Boolean(completedSteps[step.id]);
                     const isEditing = editingStepID === step.id;
                     const isAddingMethod = addMethodStepID === step.id;
                     const shouldShowQuiz =
                        hpcQuestion && index === Math.floor(steps.length / 2) - 1;

                     return (
                        <div key={step.id} className="space-y-6">
                           <section className="rounded-2xl border border-white/10 bg-white/5 p-4 md:p-6">
                              <div className="mb-2 flex items-center gap-3">
                                 <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-blue-400/30 bg-blue-500/20 text-sm font-bold text-blue-300">
                                    {index + 1}
                                 </span>

                                 <h2 className="text-xl font-semibold text-white">{step.title}</h2>

                                 {step.expectedTime && (
                                    <span className="shrink-0 rounded-full border border-blue-400/20 bg-blue-500/20 px-3 py-1 text-right text-sm font-semibold text-blue-200">
                                       {step.expectedTime}
                                    </span>
                                 )}
                              </div>

                              <p className="mb-4 text-slate-300">{step.description}</p>

                              <details className="mb-4 rounded-xl border border-white/10 bg-slate-900/40 p-3 md:p-4">
                                 <summary className="cursor-pointer font-medium text-blue-300">
                                    View Methods
                                 </summary>

                                 <ul className="mt-4 space-y-2 text-slate-300">
                                    {(step.methods || []).map((method, i) => {
                                       const isMethodHidden = hiddenMethodIds.includes(method.id);
                                       const isMethodRevealed = revealedMethodIds.includes(
                                          method.id
                                       );

                                       return (
                                          <li key={`${step.id}-${method.id}-${i}`}>
                                             {i > 0 && <hr className="border-white/10 mb-2" />}

                                             {editingMethodId === method.id ? (
                                                <div className="mt-4">
                                                   <textarea
                                                      rows={6}
                                                      value={editedMethodContent}
                                                      onChange={(e) =>
                                                         setEditedMethodContent(e.target.value)
                                                      }
                                                      className="w-full rounded-xl border border-slate-700 bg-slate-900 p-4 text-white"
                                                   />

                                                   <div className="mt-3 flex flex-col gap-3 md:flex-row md:justify-end">
                                                      <button
                                                         type="button"
                                                         onClick={() => {
                                                            setEditingMethodId(null);
                                                            setEditedMethodContent('');
                                                         }}
                                                         className="mt-8 w-full cursor-pointer rounded-xl border border-slate-300/25 bg-slate-500/10 px-4 py-2 text-sm font-semibold text-slate-100 shadow-md shadow-black/20 transition duration-200 hover:-translate-y-0.5 hover:border-slate-300/45 hover:bg-slate-500/20 hover:text-white focus:outline-none focus:ring-2 focus:ring-slate-300/45 focus:ring-offset-2 focus:ring-offset-slate-950 active:translate-y-0 md:w-auto"
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
                                                         className="mt-8 w-full cursor-pointer rounded-xl border border-green-300/25 bg-green-500/10 px-4 py-2 text-sm font-semibold text-green-100 shadow-md shadow-black/20 transition duration-200 hover:-translate-y-0.5 hover:border-green-300/45 hover:bg-green-500/20 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-300/45 focus:ring-offset-2 focus:ring-offset-slate-950 active:translate-y-0 md:w-auto"
                                                      >
                                                         Save Changes
                                                      </button>
                                                   </div>
                                                </div>
                                             ) : (
                                                <div className="flex gap-3">
                                                   <div className="prose prose-invert max-w-none overflow-x-auto">
                                                      {isMethodHidden && !isMethodRevealed ? (
                                                         <div className="flex items-center gap-3">
                                                            <p className="text-yellow-200 mt-0 mb-0">
                                                               Independent challenge — work this
                                                               method out yourself.
                                                            </p>

                                                            <button
                                                               type="button"
                                                               onClick={() =>
                                                                  revealMethod(method.id)
                                                               }
                                                               className="flex h-8 w-8 shrink-0 cursor-pointer transition-all items-center justify-center rounded-full border border-yellow-400/30 bg-yellow-400/10 text-yellow-300 hover:bg-yellow-400/20"
                                                               aria-label="Reveal method guidance"
                                                               title="Reveal guidance"
                                                            >
                                                               <FaLightbulb />
                                                            </button>
                                                         </div>
                                                      ) : (
                                                         <ReactMarkdown
                                                         
                                                         >
                                                            {method.content}
                                                         </ReactMarkdown>
                                                      )}
                                                   </div>
                                                </div>
                                             )}

                                             {isEditing && !(editingMethodId === method.id) && (
                                                <div className="flex flex-col gap-3 md:flex-row md:justify-end">
                                                   <button
                                                      type="button"
                                                      onClick={() => {
                                                         setEditingMethodId(method.id);
                                                         setEditedMethodContent(method.content);
                                                      }}
                                                      className="mt-8 w-full cursor-pointer rounded-xl border border-blue-300/25 bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-100 shadow-md shadow-black/20 transition duration-200 hover:-translate-y-0.5 hover:border-blue-300/45 hover:bg-blue-500/20 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-300/45 focus:ring-offset-2 focus:ring-offset-slate-950 active:translate-y-0 md:w-auto"
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
                                                      className="mt-8 w-full cursor-pointer rounded-xl border border-red-300/25 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-100 shadow-md shadow-black/20 transition duration-200 hover:-translate-y-0.5 hover:border-red-300/45 hover:bg-red-500/20 hover:text-white focus:outline-none focus:ring-2 focus:ring-red-300/45 focus:ring-offset-2 focus:ring-offset-slate-950 active:translate-y-0 md:w-auto"
                                                   >
                                                      Delete Method
                                                   </button>
                                                </div>
                                             )}
                                          </li>
                                       );
                                    })}

                                    {!isEditing ? (
                                       <div className="flex flex-col justify-end">
                                          <button
                                             type="button"
                                             onClick={() => setEditingStepID(step.id)}
                                             className="mt-8 cursor-pointer rounded-xl border border-white/15 bg-white/10 px-5 py-2.5 text-sm font-semibold text-slate-100 shadow-md shadow-black/20 backdrop-blur transition duration-200 hover:-translate-y-0.5 hover:border-blue-300/45 hover:bg-blue-400/15 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-300/45 focus:ring-offset-2 focus:ring-offset-slate-950 active:translate-y-0"
                                          >
                                             Edit Methods
                                          </button>
                                       </div>
                                    ) : (
                                       <div className="flex flex-col justify-end">
                                          {!isAddingMethod ? (
                                             <button
                                                type="button"
                                                onClick={() => setAddMethodStepID(step.id)}
                                                className="mt-8 cursor-pointer rounded-xl border border-emerald-300/25 bg-emerald-400/10 px-5 py-2.5 text-sm font-semibold text-emerald-100 shadow-md shadow-black/20 backdrop-blur transition duration-200 hover:-translate-y-0.5 hover:border-emerald-300/45 hover:bg-emerald-400/20 hover:text-white focus:outline-none focus:ring-2 focus:ring-emerald-300/45 focus:ring-offset-2 focus:ring-offset-slate-950 active:translate-y-0"
                                             >
                                                Add Method +
                                             </button>
                                          ) : (
                                             <div className="mt-4">
                                                <textarea
                                                   rows={6}
                                                   value={newMethod}
                                                   onChange={(e) => setNewMethod(e.target.value)}
                                                   placeholder="Enter method..."
                                                   className="w-full rounded-xl border border-slate-700 bg-slate-900 p-4 text-white"
                                                />

                                                <div className="mt-3 flex flex-col gap-3 md:flex-row md:justify-end">
                                                   <button
                                                      type="button"
                                                      onClick={() => {
                                                         setAddMethodStepID(null);
                                                      }}
                                                      className="w-full cursor-pointer rounded-xl border border-slate-300/25 bg-slate-500/10 px-4 py-2 text-sm font-semibold text-slate-100 shadow-md shadow-black/20 transition duration-200 hover:-translate-y-0.5 hover:border-slate-300/45 hover:bg-slate-500/20 hover:text-white focus:outline-none focus:ring-2 focus:ring-slate-300/45 focus:ring-offset-2 focus:ring-offset-slate-950 active:translate-y-0 md:w-auto"
                                                   >
                                                      Cancel
                                                   </button>

                                                   <button
                                                      type="button"
                                                      onClick={() => {
                                                         const sanitizedContent = newMethod.trim();

                                                         if (sanitizedContent === '') {
                                                            alert('Please enter a method');
                                                         } else {
                                                            addNewMethod(step.id, sanitizedContent);
                                                         }
                                                      }}
                                                      className="w-full cursor-pointer rounded-xl border border-green-300/25 bg-green-500/15 px-5 py-2 text-sm font-semibold text-green-100 shadow-md shadow-black/20 transition duration-200 hover:-translate-y-0.5 hover:border-green-300/45 hover:bg-green-500/25 hover:text-white focus:outline-none focus:ring-2 focus:ring-green-300/45 focus:ring-offset-2 focus:ring-offset-green-950 active:translate-y-0 md:w-auto"
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
                                                setNewMethod('');
                                             }}
                                             className="mt-8 cursor-pointer rounded-xl border border-slate-300/20 bg-slate-100/10 px-5 py-2.5 text-sm font-semibold text-slate-200 shadow-md shadow-black/20 backdrop-blur transition duration-200 hover:-translate-y-0.5 hover:border-slate-200/40 hover:bg-slate-100/15 hover:text-white focus:outline-none focus:ring-2 focus:ring-slate-200/40 focus:ring-offset-2 focus:ring-offset-slate-950 active:translate-y-0"
                                          >
                                             Close Editor X
                                          </button>
                                       </div>
                                    )}
                                 </ul>
                              </details>

                              <div className="grid gap-4 md:grid-cols-2">
                                 {step.good && (
                                    <div className="rounded-xl border border-green-400/20 bg-green-500/10 p-4">
                                       <p className="text-xs font-semibold uppercase tracking-wide text-green-300">
                                          Good
                                       </p>

                                       <p className="mt-2 text-md leading-relaxed text-slate-100">
                                          {step.good}
                                       </p>
                                    </div>
                                 )}

                                 {step.bad && (
                                    <div className="rounded-xl border border-red-400/20 bg-red-500/10 p-4">
                                       <p className="text-xs font-semibold uppercase tracking-wide text-red-300">
                                          Bad
                                       </p>

                                       <p className="mt-2 text-md leading-relaxed text-slate-100">
                                          {step.bad}
                                       </p>
                                    </div>
                                 )}
                              </div>

                              {/* toggle */}
                              <div className="flex mt-5 items-center justify-between">
                                 <span className="font-medium text-white">
                                    <strong>Completed Successfully</strong>
                                 </span>

                                 <label className="relative inline-flex cursor-pointer items-center">
                                    <input
                                       type="checkbox"
                                       checked={isCompleted}
                                       onChange={() => toggleStep(step.id)}
                                       className="peer sr-only"
                                    />

                                    <span className="h-7 w-14 rounded-full bg-slate-600 transition after:absolute after:left-1 after:top-1 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition peer-checked:bg-green-500 peer-checked:after:translate-x-7" />
                                 </label>
                              </div>

                              {/* notes */}
                              <textarea
                                 name={
                                    isCompleted
                                       ? `step${step.id}Notes`
                                       : `step${step.id}FailureReason`
                                 }
                                 rows={4}
                                 placeholder={isCompleted ? 'Notes (optional)' : 'What went wrong?'}
                                 className={`mt-4 w-full rounded-xl border p-3 text-white ${
                                    isCompleted
                                       ? 'border-white/10 bg-slate-900/50'
                                       : 'border-red-500/30 bg-red-900/20'
                                 }`}
                              />
                           </section>

                           {/* Questionnaire */}
                           {shouldShowQuiz && (
                              <section className="rounded-2xl border border-cyan-400/30 bg-cyan-500/10 p-4 md:p-6">
                                 <p className="text-sm font-semibold uppercase tracking-wide text-cyan-300">
                                    HPC Quick Check
                                 </p>

                                 <h2 className="mt-2 text-xl font-semibold text-white">
                                    {hpcQuestion.question}
                                 </h2>

                                 <div className="mt-4 grid gap-3">
                                    {hpcQuestion.options.map((option, optionIndex) => {
                                       const isSelected = selectedAnswerIndex === optionIndex;
                                       const isCorrectAnswer =
                                          hpcQuestionResult?.correctAnswerIndex === optionIndex;

                                       return (
                                          <button
                                             key={`${hpcQuestion.id}-${optionIndex}`}
                                             type="button"
                                             onClick={() => checkHpcAnswer(optionIndex)}
                                             disabled={Boolean(hpcQuestionResult)}
                                             className={`rounded-xl border cursor-pointer px-4 py-3 text-left text-sm font-medium transition ${
                                                isSelected
                                                   ? 'border-cyan-300 bg-cyan-400/20 text-white'
                                                   : 'border-white/10 bg-slate-900/40 text-slate-200 hover:border-cyan-300/40 hover:bg-cyan-400/10'
                                             } ${
                                                hpcQuestionResult && isCorrectAnswer
                                                   ? 'border-green-300 bg-green-500/20 text-green-100'
                                                   : ''
                                             }`}
                                          >
                                             {option}
                                          </button>
                                       );
                                    })}
                                 </div>

                                 {hpcQuestionResult && (
                                    <div
                                       className={`mt-4 rounded-xl border p-4 ${
                                          hpcQuestionResult.correct
                                             ? 'border-green-400/30 bg-green-500/10'
                                             : 'border-red-400/30 bg-red-500/10'
                                       }`}
                                    >
                                       <p
                                          className={`font-semibold ${
                                             hpcQuestionResult.correct
                                                ? 'text-green-300'
                                                : 'text-red-300'
                                          }`}
                                       >
                                          {hpcQuestionResult.correct ? 'Correct' : 'Not quite'}
                                       </p>

                                       <p className="mt-2 text-sm text-slate-200">
                                          {hpcQuestionResult.explanation}
                                       </p>
                                    </div>
                                 )}
                              </section>
                           )}
                        </div>
                     );
                  })}
               </div>

               {/* Focus Text Box */}
               {checkFocus && (
                  <section className="mt-8 rounded-2xl border border-purple-400/30 bg-purple-500/10 p-4 md:p-6">
                     <p className="text-sm font-semibold uppercase tracking-wide text-purple-300">
                        Focus Reflection
                     </p>

                     <p className="mt-2 text-slate-200">
                        Did today&apos;s focus change what you noticed during the check?
                     </p>

                     <textarea
                        name="focusReflection"
                        rows={4}
                        placeholder="Optional reflection..."
                        value={focusReflection}
                        onChange={(e) => setFocusReflection(e.target.value)}
                        className="mt-4 w-full rounded-xl border border-purple-400/20 bg-slate-900/50 p-3 text-white placeholder:text-slate-500"
                     />
                  </section>
               )}

               {/* Bonus challenges */}
               {bonusChallenge && (
                  <section className="mt-8 rounded-2xl border border-yellow-400/30 bg-yellow-500/10 p-4 md:p-6">
                     <div className="flex items-start gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-yellow-400/30 bg-yellow-400/20 text-sm font-bold text-yellow-200">
                           ★
                        </span>

                        <div>
                           <p className="text-sm font-semibold uppercase tracking-wide text-yellow-300">
                              Bonus Challenge
                           </p>

                           <h2 className="mt-1 text-xl font-semibold text-white">
                              {bonusChallenge.title}
                           </h2>

                           <p className="mt-2 text-slate-200">{bonusChallenge.description}</p>
                        </div>
                     </div>

                     <div className="mt-5 flex items-center justify-between">
                        <span className="font-medium text-white">
                           <strong>
                              {bonusCompleted ? 'Bonus Completed' : 'Complete Bonus Challenge'}
                           </strong>
                        </span>

                        <label className="relative inline-flex cursor-pointer items-center">
                           <input
                              type="checkbox"
                              checked={bonusCompleted}
                              onChange={() => setBonusCompleted((current) => !current)}
                              className="peer sr-only"
                           />

                           <span className="h-7 w-14 rounded-full bg-slate-600 transition after:absolute after:left-1 after:top-1 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition peer-checked:bg-yellow-400 peer-checked:after:translate-x-7" />
                        </label>
                     </div>
                  </section>
               )}

               {/* submit */}
               <button
                  type="submit"
                  disabled={submitting || steps.length === 0 || !canSubmit}
                  aria-disabled={submitting || steps.length === 0}
                  className="mt-10 w-full cursor-pointer rounded-4xl border border-slate-200/25 bg-gradient-to-r from-blue-500 via-blue-500 to-indigo-600 py-4 text-lg font-semibold text-white shadow-xl shadow-blue-950/30 transition duration-200 hover:-translate-y-0.5 hover:border-blue-100/40 hover:from-blue-400 hover:via-blue-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-blue-200/60 focus:ring-offset-2 focus:ring-offset-slate-950 active:translate-y-0 disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-50"
               >
                  {submitting ? 'Submitting...' : 'Submit Report'}
               </button>
            </form>
         </div>

         <div className="fixed bottom-4 right-4 z-30 rounded-3xl border border-white/10 bg-white/10 px-4 py-3 text-right shadow-2xl backdrop-blur-xl">
            <div className="flex items-center gap-3">
               <span className="text-xs font-semibold uppercase tracking-wide text-white/80">
                  Time remaining
               </span>

               <span
                  className={`text-xl font-bold tabular-nums ${
                     isFinalTwentyMinutes ? 'text-red-500' : 'text-white'
                  }`}
               >
                  {!windowReady
                     ? '--:--:--'
                     : timeRemainingMs > 0
                       ? formatTimeRemaining(timeRemainingMs)
                       : 'END'}
               </span>
            </div>
         </div>
      </main>
   );
}
