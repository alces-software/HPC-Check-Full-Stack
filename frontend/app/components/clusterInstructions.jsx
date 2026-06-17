"use client";

import { useState, useEffect } from "react";
import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
} from "@headlessui/react";

export default function Results() {
  const [cluster, setCluster] = useState("");
  const [allClusters, setAllClusters] = useState([]);

  const [instructions, setInstructions] = useState([]);
  const [loadingInstructions, setLoadingInstructions] = useState(false);

  const selectedCluster = allClusters.find((hpc) => hpc.name === cluster);
  const canSearch = Boolean(selectedCluster);

  const clusters = Array.isArray(allClusters)
    ? allClusters.map((cluster) => cluster.name)
    : [];

  async function getInstructionsForCluster() {
    if (!selectedCluster) return;

    try {
      setLoadingInstructions(true);
      setInstructions([]);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/instruction/all/${selectedCluster.id}`
      );

      const data = await res.json();

      if (!data.success) {
        setInstructions([]);
        return;
      }

      setInstructions(Array.isArray(data.body) ? data.body : []);
    } catch (error) {
      console.error("Failed to fetch instructions:", error);
      setInstructions([]);
    } finally {
      setLoadingInstructions(false);
    }
  }

  useEffect(() => {
    async function getAllClusters() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/hpc`);
        const data = await res.json();

        setAllClusters(Array.isArray(data.body) ? data.body : []);
      } catch (error) {
        console.error("Failed to fetch clusters:", error);
      }
    }

    getAllClusters();
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-6xl">
        <div className="rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur-xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white">
              Cluster Instructions
            </h1>

            <p className="mt-2 text-slate-300">
              Select a cluster to view its instructions.
            </p>
          </div>

          {(() => {
            const glassButton =
              "w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-left text-white backdrop-blur-md transition " +
              "hover:border-white/20 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/30";

            return (
              <>
                <div className="mb-4 grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-300">
                      Cluster
                    </label>

                    <Listbox value={cluster} onChange={setCluster}>
                      <div className="relative">
                        <ListboxButton className={glassButton}>
                          {cluster || "Select cluster"}

                          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                            ▼
                          </span>
                        </ListboxButton>

                        <ListboxOptions className="absolute z-50 mt-2 max-h-60 w-full cursor-pointer overflow-auto rounded-xl border border-white/10 bg-slate-900/95 shadow-2xl backdrop-blur-xl">
                          {clusters.map((name) => (
                            <ListboxOption
                              key={name}
                              value={name}
                              className="cursor-pointer px-4 py-3 text-white transition data-[active]:bg-blue-500/20 data-[selected]:font-semibold"
                            >
                              {name}
                            </ListboxOption>
                          ))}
                        </ListboxOptions>
                      </div>
                    </Listbox>
                  </div>
                </div>

                <div className="mb-4 flex justify-center">
                  <button
                    type="button"
                    onClick={getInstructionsForCluster}
                    disabled={!canSearch || loadingInstructions}
                    className="cursor-pointer rounded-xl bg-blue-500 px-6 py-3 font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loadingInstructions ? "Loading..." : "View Instructions"}
                  </button>
                </div>

                {instructions.length > 0 ? (
                  <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead className="bg-slate-900/50">
                          <tr>
                            <th className="px-6 py-4 text-sm font-semibold uppercase tracking-wide text-slate-300">
                              Title
                            </th>
                            <th className="px-6 py-4 text-sm font-semibold uppercase tracking-wide text-slate-300">
                              Instruction
                            </th>
                            <th className="w-64 px-6 py-4 text-sm font-semibold uppercase tracking-wide text-slate-300">
                              Command
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {instructions.map((instruction, index) => (
                            <tr
                              key={instruction.id || index}
                              className={
                                index !== instructions.length - 1
                                  ? "border-b border-white/10"
                                  : ""
                              }
                            >
                              <td className="px-6 py-4 font-medium text-white">
                                {instruction.title || "Untitled"}
                              </td>

                              <td className="whitespace-pre-line px-6 py-4 text-slate-300">
                                {instruction.description ||
                                  instruction.instruction ||
                                  instruction.task ||
                                  "-"}
                              </td>

                              <td className="whitespace-pre-line px-6 py-4 font-mono text-sm text-slate-300">
                                {instruction.command || "-"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-12 text-center">
                    <p className="text-lg font-semibold text-white">
                      {loadingInstructions
                        ? "Loading instructions..."
                        : "Select a cluster, then click View Instructions"}
                    </p>
                  </div>
                )}

                {selectedCluster && instructions.length > 0 && (
                  <div className="mt-4 flex flex-col items-end text-md">
                    <div className="text-slate-400">
                      Cluster:{" "}
                      <span className="text-slate-200">
                        {selectedCluster.name}
                      </span>
                    </div>

                    <div className="text-slate-400">
                      Instructions:{" "}
                      <span className="text-slate-200">
                        {instructions.length}
                      </span>
                    </div>
                  </div>
                )}
              </>
            );
          })()}
        </div>
      </div>
    </main>
  );
}