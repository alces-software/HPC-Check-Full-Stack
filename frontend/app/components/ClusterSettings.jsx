
"use client";

import { useState, useEffect } from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import ClusterInstructionsPDF from "./ClusterInstructionsPDF.jsx";

export default function ClusterSettingsPage({ cluster, clusterId }) {
  const [activeTab, setActiveTab] = useState("instructions");
  const [steps, setSteps] = useState([]);
  const [loadingSteps, setLoadingSteps] = useState(false);
  const [stepsError, setStepsError] = useState("");

  async function getSteps() {
    if (!clusterId) return;

    setLoadingSteps(true);
    setStepsError("");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/instruction/all/${clusterId}`
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch instructions");
      }

      setSteps(data.body ?? []);
    } catch (err) {
      console.error(err);
      setSteps([]);
      setStepsError("Could not load instructions for this cluster.");
    } finally {
      setLoadingSteps(false);
    }
  }

  useEffect(() => {
    getSteps();
  }, [clusterId]);

  return (
    <main className="relative flex min-h-screen justify-center overflow-hidden px-6 py-8">
      <div className="absolute left-0 top-0 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl" />

      <div className="relative z-10 w-full max-w-6xl">
        <div className="rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur-xl">
          <div className="mb-10 text-left">
            <h1 className="text-5xl font-bold text-white">
              {cluster.name}
            </h1>

            <p className="mt-4 text-lg text-slate-300">
              Cluster settings and overview
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <span className="rounded-full border border-green-400/30 bg-green-500/20 px-4 py-2 text-sm font-semibold text-green-300">
                Healthy
              </span>

              <span className="rounded-full border border-blue-400/30 bg-blue-500/20 px-4 py-2 text-sm font-semibold text-blue-300">
                Last Checked: 17/06/26
              </span>

              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 font-mono text-sm text-slate-300">
                {clusterId}
              </span>
            </div>
          </div>

          <div className="mb-8 flex justify-center">
            <div className="inline-flex items-center gap-5 rounded-2xl bg-white/[0.03] px-8 py-4 backdrop-blur-sm">
              <button
                type="button"
                onClick={() => setActiveTab("instructions")}
                className={[
                  "cursor-pointer border-b-2 pb-2 text-sm font-semibold tracking-wide transition",
                  activeTab === "instructions"
                    ? "border-blue-400 text-white"
                    : "border-transparent text-slate-400 hover:text-white",
                ].join(" ")}
              >
                Instructions
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("results")}
                className={[
                  "cursor-pointer border-b-2 pb-2 text-sm font-semibold tracking-wide transition",
                  activeTab === "results"
                    ? "border-blue-400 text-white"
                    : "border-transparent text-slate-400 hover:text-white",
                ].join(" ")}
              >
                Results
              </button>
            </div>
          </div>

          {activeTab === "instructions" && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm">
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-bold text-white">
                    Instructions
                  </h2>

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
                    {({ loading }) =>
                      loading ? "Preparing PDF..." : "Export PDF"
                    }
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

              <div className="space-y-6">
                {steps.map((step, index) => (
                  <section
                    key={step.id}
                    className="rounded-2xl border border-white/10 bg-white/5 p-6"
                  >
                    <div className="mb-4 flex items-start justify-between gap-4">
                      <div>
                        <div className="mb-2 flex items-center gap-3">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-blue-400/30 bg-blue-500/20 text-sm font-bold text-blue-300">
                            {index + 1}
                          </span>

                          <h3 className="text-xl font-semibold text-white">
                            {step.title}
                          </h3>
                        </div>

                        <p className="text-slate-300">
                          {step.description}
                        </p>
                      </div>

                      {step.expectedTime && (
                        <span className="shrink-0 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-300">
                          {step.expectedTime}
                        </span>
                      )}
                    </div>

                    <details className="mb-4 rounded-xl border border-white/10 bg-slate-900/40 p-4">
                      <summary className="cursor-pointer font-medium text-blue-300 transition hover:text-blue-200">
                        View Methods
                      </summary>

                      <ul className="mt-4 space-y-3 text-slate-300">
                        {(step.methods || []).length === 0 && (
                          <li className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-400">
                            No methods available for this instruction.
                          </li>
                        )}

                        {(step.methods || []).map((method, methodIndex) => (
                          <li
                            key={method.id}
                            className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-4"
                          >
                            <div className="flex gap-3">
                              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-xs font-semibold text-blue-300">
                                {methodIndex + 1}
                              </span>

                              <p className="text-sm leading-relaxed text-slate-300">
                                {method.content}
                              </p>
                            </div>
                          </li>
                        ))}
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
                ))}
              </div>
            </div>
          )}

          {activeTab === "results" && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm">
              <h2 className="text-3xl font-bold text-white">
                Results
              </h2>

              <p className="mt-3 text-slate-300">
                Results for this cluster will go here.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}