"use client";

import { useState, useEffect, useRef } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

export default function Form() {
  const [completedSteps, setCompletedSteps] = useState({});
  const [allClusters, setAllClusters] = useState([]);
  const [steps, setSteps] = useState([]);
  const [allNames, setAllNames] = useState([]);
  const [startTime] = useState(() => Date.now());
  const [submitting, setSubmitting] = useState(false);
  const [nameID] = useState(() => Cookies.get("selectedPersonId") || "");
  const [cookieCluster] = useState(() => Cookies.get("currentCluster") || "");
  const [editing, setEditing] = useState(false)
  const [addMethod, setAddMethod] = useState(false)
  const router = useRouter();
  const redirected = useRef(false);

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

  const clusterId = allClusters.find(
    (c) => c.name === cookieCluster
  )?.id;

  // GET STEPS
  useEffect(() => {
    if (!clusterId) return;

    async function getSteps() {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/instruction/all/${clusterId}`
      );
      const data = await res.json();
      setSteps(data.body);
    }

    getSteps();
  }, [clusterId]);

  function toggleStep(stepId) {
    setCompletedSteps((prev) => ({
      ...prev,
      [stepId]: !prev[stepId],
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);

    const formData = new FormData(event.currentTarget);

    for (const step of steps) {
      const passed = Boolean(completedSteps[step.id]);

      if (!passed) {
        const failureReason = formData
          .get(`step${step.id}FailureReason`)
          ?.toString()
          .trim();

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
          note: String(note || ""),
        };
      }),
    };

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/report/add`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      Cookies.remove("selectedPersonId");
      Cookies.remove("currentCluster");

      alert("Report submitted successfully.");
      router.replace(`/report?id=${data.body.reportId}`);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  console.log(steps);

  if (!clusterId || !nameID) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900">
        <div className="rounded-2xl border border-white/10 bg-white/10 px-8 py-6 text-white backdrop-blur-xl">
          Loading report...
        </div>
      </main>
    );
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 px-6 py-8">
      {/* background */}
      <div className="absolute left-0 top-0 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl" />

      {/* content wrapper */}
      <div className="relative z-10 w-full max-w-6xl">
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur-xl"
        >
          {/* Header */}
          <div className="mb-10 text-center">
            <div className="mb-4 flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-4xl shadow-xl">
                📋
              </div>
            </div>
            <h1 className="text-4xl font-bold text-white">
              Process Documentation
            </h1>
            <p className="mt-3 text-lg text-slate-300">
              {name}&apos;s Check for{" "}
              <span className="font-semibold text-blue-300">
                {cookieCluster}
              </span>
            </p>
          </div>

          {/* Steps */}
          <div className="space-y-6">
            {steps.map((step) => {
              const isCompleted = Boolean(completedSteps[step.id]);

              return (
                <section
                  key={step.id}
                  className="rounded-2xl border border-white/10 bg-white/5 p-6"
                >
                  <h2 className="mb-4 text-xl font-semibold text-white">
                    {step.title}
                  </h2>

                  <p className="mb-4 text-slate-300">
                    {step.description}
                  </p>

                  <details className="mb-4 rounded-xl border border-white/10 bg-slate-900/40 p-4">
                    <summary className="cursor-pointer font-medium text-blue-300">
                      View Methods
                    </summary>

                    <ul className="mt-4 space-y-2 text-slate-300">
                      {step.methods.map((method, i) => (
                        <li key={method.id}>
                          {method.content.includes(":") ? (
                            <>
                              <p>
                                {method.content.split(":")[0]}:
                              </p>
                              <pre className="mt-3 overflow-auto rounded-xl border border-slate-700 bg-black/70 p-4 text-sm text-green-400">
                                <code>
                                  {method.content
                                    .split(":")
                                    .slice(1)
                                    .join(":")
                                    .trim()}
                                </code>
                              </pre>
                            </>
                          ) : (
                            <div className="mt-7 overflow-auto p-4 text-md">
                            {method.content}
                            </div>
                          )}

                          {editing && (

                          <div className="flex justify-end">

                          <button
                          type="button"
                          className="rounded-lg bg-red-700 opacity-[0.9] px-3 py-2 mt-8 font-medium text-white cursor-pointer hover:bg-red-600">
                            Delete Method
                            </button>
                            </div>

                          )}
                        </li>
                        
                      ))}

                       {!editing ? (
                      <div className="flex flex-col justify-end">
                      <button
                          type="button"
                          onClick={() => setEditing(true)}
                          className="rounded-lg bg-blue-500 opacity-[0.9] px-3 py-2 mt-8 font-medium text-white cursor-pointer hover:bg-blue-600">
                            Edit Methods
                            </button>
                            </div>
                       ) : (
                        <>

                        
                        <div className="flex flex-col justify-end">


                          {!addMethod? (
                      <button
                          type="button"
                          onClick={() => setAddMethod(true)}
                          className="rounded-lg bg-green-600 opacity-[0.9] px-3 py-2 mt-8 font-medium text-white cursor-pointer hover:bg-green-700">
                            Add Method ＋
                            </button>
                            ) : (

                              <div className="mt-4">
                                <textarea
                                rows={6}
    
                                placeholder="Enter method..."
    
                                className="w-full rounded-xl border border-slate-700 bg-slate-900 p-4 text-white"
                                />
                                <div className="mt-3 flex justify-end">
                                  <button
                                  type="button"
                                  onClick={()=>setAddMethod(false)}
                                  className="rounded-lg cursor-pointer bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                                  >
                                    Save Method
                                    </button>
                                    </div>
                                    </div>
                                  )} 

                           
  


                            <button
                        type="button"
                        onClick={() => {
                          setEditing(false)
                          setAddMethod(false)
                        }}

                        className="rounded-lg bg-blue-500 px-3 py-2 mt-8 font-medium text-white cursor-pointer hover:bg-blue-600"
                        >
                          Close Editor Ｘ
                          </button>
                            </div>
                       
                        
                          
                          </>
                        )
                        }
                    </ul>
                  </details>

                  {/* toggle */}
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-white">
                      Completed Successfully
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
                    placeholder={
                      isCompleted
                        ? "Notes (optional)"
                        : "What went wrong?"
                    }
                    className={`mt-4 w-full rounded-xl border p-3 text-white ${isCompleted
                      ? "border-white/10 bg-slate-900/50"
                      : "border-red-500/30 bg-red-900/20"
                      }`}
                  />
                </section>
              );
            })}
          </div>

          {/* submit */}
          <button
            type="submit"
            disabled={submitting}
            className="mt-10 w-full cursor-pointer rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 py-4 text-lg font-semibold text-white shadow-lg transition hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit Report"}
          </button>
        </form>
      </div>
    </main>
  );
}