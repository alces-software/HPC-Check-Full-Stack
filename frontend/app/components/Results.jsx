"use client";

import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";


const clusters = ["bmrc", "gpu-l40s", "gpu-h100", "compute", ""];

const results = [
  { outcome: "FAIL", task: "Login & Basic Access", notes: "" },
  { outcome: "PASS", task: "Home Directory & User Quota + Filesystem Experience", notes: "" },
  { outcome: "PASS", task: "Scratch / Lustre Storage + Filesystem Experience", notes: "" },
  { outcome: "PASS", task: "Slurm Scheduler Status", notes: "" },
  { outcome: "PASS", task: "GPU / Compute Node Availability", notes: "" },
  { outcome: "FAIL", task: "Light Test Job Submission", notes: "" },
  { outcome: "PASS", task: "Services & Environment", notes: "" },
  { outcome: "PASS", task: "Cleanup & Verification", notes: "" },
];

export default function Results() {
  const [tester, setTester] = useState("Calum");
  const [cluster, setCluster] = useState("");
  const [date, setDate] = useState(new Date(2026, 4, 29));
  const [allNames, setAllNames] = useState([])
  const [allClusters, setAllClusters] = useState([])

  const duration = "00:31:28";

  function formatDate(date) {
    return date.toLocaleDateString("en-GB");
  }

  function outcomeStyle(outcome) {
    return outcome === "PASS"
      ? "bg-green-500/20 text-green-300 border-green-400/30"
      : "bg-red-500/20 text-red-300 border-red-400/30";
  }



    // GET NAMES
    useEffect(() => {
      async function getNames() {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/people`);
        const data = await res.json();
        setAllNames(data.body);
      }
      getNames();
    }, []);


    // GETS ALL HPC CLUSTER DATA
useEffect(() => {

    async function getAllClusters() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/hpc`
        );

        const data = await res.json();

        console.log("Fetched clusters:", data.body);

        setAllClusters(data.body);

        
      } catch (error) {
        console.error("Failed to fetch clusters:", error);
      }
    }

    getAllClusters();
  }, []);

  const clusters = allClusters.map((cluster) => cluster.name);



 const names = allNames.map((person) => person.name);




  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur-xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white">HPC Test Results</h1>
            <p className="mt-2 text-slate-300">
              Results for {formatDate(date)} on {cluster}
            </p>
          </div>

          <div className="mb-8 grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-300">
                Tester
              </label>

              <select
                value={tester}
                onChange={(event) => setTester(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-white outline-none focus:border-blue-400"
              >
                {names.map((name) => (
                  <option key={name} value={name} className="bg-slate-900">
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-300">
                Cluster
              </label>

              <select
                value={cluster}
                onChange={(event) => setCluster(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-white outline-none focus:border-blue-400"
              >
                {clusters.map((clusterName) => (
                  <option
                    key={clusterName}
                    value={clusterName}
                    className="bg-slate-900"
                  >
                    {clusterName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-300">
                Date
              </label>

              <DatePicker
                selected={date}
                onChange={(selectedDate) => setDate(selectedDate)}
                dateFormat="dd/MM/yyyy"
                wrapperClassName="w-full"
                className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-white outline-none focus:border-blue-400"
                calendarClassName="hpc-datepicker"
              />
            </div>
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
                  {results.map((result, index) => (
                    <tr
                      key={result.task}
                      className={
                        index !== results.length - 1
                          ? "border-b border-white/10"
                          : ""
                      }
                    >
                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wide ${outcomeStyle(
                            result.outcome
                          )}`}
                        >
                          {result.outcome}
                        </span>
                      </td>

                      <td className="px-6 py-4 font-medium text-white">
                        {result.task}
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
              Tester: <span className="text-slate-200">{tester}</span>
            </div>

            <div className="text-slate-400">
              Cluster: <span className="text-slate-200">{cluster}</span>
            </div>

            <div className="text-slate-400">
              Duration: <span className="text-slate-200">{duration}</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}