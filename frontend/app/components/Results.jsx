"use client";

import { useState, useEffect } from "react";
import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
} from "@headlessui/react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function Results() {
  const [tester, setTester] = useState("");
  const [cluster, setCluster] = useState("");
  const [date, setDate] = useState(new Date());

  const [allNames, setAllNames] = useState([]);
  const [allClusters, setAllClusters] = useState([]);

  const [report, setReport] = useState(null);
  const [loadingReport, setLoadingReport] = useState(false);

  const [copied, setCopied] = useState(false);

  const canSearch = cluster !== "" && date !== null;

  const names = Array.isArray(allNames)
    ? allNames.map((person) => person.name)
    : [];

  const clusters = Array.isArray(allClusters)
    ? allClusters.map((cluster) => cluster.name)
    : [];

  function formatDate(date) {
    return date.toLocaleDateString("en-GB");
  }

  function outcomeStyle(outcome) {
    return outcome === "PASS"
      ? "bg-green-500/20 text-green-300 border-green-400/30"
      : "bg-red-500/20 text-red-300 border-red-400/30";
  }

  async function getReportData(reportId) {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/report/id/${reportId}`
    );

    const data = await res.json();

    if (!data.success) {
      setReport(null);
      return;
    }

    const reportData = data.body;

    const resultsWithTitles = await Promise.all(
      reportData.results.map(async (result) => {
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

    const personRes = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/people/id/${reportData.personId}`
    );
    const personData = await personRes.json();

    const clusterRes = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/hpc/id/${reportData.clusterId}`
    );
    const clusterData = await clusterRes.json();

    const start = new Date(Number(reportData.startTime));
    const end = new Date(Number(reportData.endTime));
    const diffMs = end.getTime() - start.getTime();

    const hours = Math.floor(diffMs / 1000 / 60 / 60);
    const minutes = Math.floor((diffMs / 1000 / 60) % 60);
    const seconds = Math.floor((diffMs / 1000) % 60);

    setReport({
      ...reportData,
      person: personData?.body?.name || "Unknown",
      cluster: clusterData?.body?.name || "Unknown",
      duration: `${hours}h ${minutes}m ${seconds}s`,
      results: resultsWithTitles,
    });
  }

  async function findReport() {
    try {
      setLoadingReport(true);
      setReport(null);

      // const selectedPerson = allNames.find((person) => person.name === tester);
      const selectedCluster = allClusters.find((hpc) => hpc.name === cluster);

      // if (!selectedPerson || !selectedCluster || !date) return;
      if (!selectedCluster || !date) return;

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/report/cluster/${selectedCluster.id}`
      );

      const data = await res.json();

      if (!data.success) {
        setReport(null);
        return;
      }

      const matchingReport = data.body.find((report) => {
        const reportDate = new Date(Number(report.startDate)).toDateString();
        const selectedDate = date.toDateString();

        return (
          report.clusterId === selectedCluster.id &&
          reportDate === selectedDate
        );
      });

      if (!matchingReport) {
        alert("No report found for those selections");
        setReport(null);
        return;
      }

      await getReportData(matchingReport.id);
    } catch (error) {
      console.error("Failed to find report:", error);
      setReport(null);
    } finally {
      setLoadingReport(false);
    }
  }

  useEffect(() => {
    async function getNames() {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/people`);
      const data = await res.json();
      setAllNames(Array.isArray(data.body) ? data.body : []);
    }

    getNames();
  }, []);

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


  const handleShare = async () => {
    await navigator.clipboard.writeText(
      `${window.location.protocol}//${window.location.host}/report?id=${report.id}`
    );

    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 p-6">
      <div className="w-full max-w-6xl">
        <div className="rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur-xl">

          {/* HEADER */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white">
              HPC Test Results
            </h1>

            <p className="mt-2 text-slate-300">
              {report
                ? `Results for ${report.person}'s test on ${report.cluster} ${formatDate(
                  new Date(Number(report.startTime))
                )}`
                : "Select cluster and date to display results"}
            </p>
          </div>

          {/* SHARED INPUT STYLE */}
          {/* (kept inside component for clarity, move outside if you want) */}
          {(() => {
            const glassButton =
              "w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-left text-white backdrop-blur-md transition " +
              "hover:border-white/20 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/30";

            return (
              <>
                {/* FILTERS */}
                <div className="mb-4 grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 md:grid-cols-2">

                  {/* TESTER */}
                  {/* <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-300">
                      Tester
                    </label>

                    <Listbox value={tester} onChange={setTester}>
                      <div className="relative">

                        <ListboxButton className={glassButton}>
                          {tester || "Select tester"}

                          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                            ▼
                          </span>
                        </ListboxButton>

                        <ListboxOptions className="absolute z-50 mt-2 max-h-60 w-full overflow-auto rounded-xl border border-white/10 bg-slate-900/95 backdrop-blur-xl shadow-2xl">

                          {names.map((name) => (
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
                  </div> */}

                  {/* CLUSTER */}
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

                        <ListboxOptions className="absolute z-50 cursor-pointer mt-2 max-h-60 w-full overflow-auto rounded-xl border border-white/10 bg-slate-900/95 backdrop-blur-xl shadow-2xl">

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

                  {/* DATE */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-300">
                      Date
                    </label>

                    <DatePicker
                      selected={date}
                      onChange={(d) => setDate(d)}
                      dateFormat="dd/MM/yyyy"
                      wrapperClassName="w-full"
                      className="w-full rounded-xl cursor-pointer border border-white/10 bg-slate-900/60 px-4 py-3 text-white backdrop-blur-md outline-none transition hover:border-white/20 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/30"
                      calendarClassName="hpc-datepicker"
                    />
                  </div>

                </div>

                {/* BUTTON */}
                <div className="mb-4 flex justify-center">
                  <button
                    type="button"
                    onClick={findReport}
                    disabled={!canSearch || loadingReport}
                    className="cursor-pointer rounded-xl bg-blue-500 px-6 py-3 font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loadingReport ? "Loading..." : "View Results"}
                  </button>
                </div>

                {/* RESULTS */}
                {report ? (
                  <>
                    {/* TABLE */}
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
                            {report.results.map((result, index) => {
                              const outcome = result.passed ? "PASS" : "FAIL";

                              return (
                                <tr
                                  key={`${result.instructionId}-${index}`}
                                  className={
                                    index !== report.results.length - 1
                                      ? "border-b border-white/10"
                                      : ""
                                  }
                                >
                                  <td className="px-6 py-4">
                                    <span
                                      className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wide ${outcomeStyle(
                                        outcome
                                      )}`}
                                    >
                                      {outcome}
                                    </span>
                                  </td>

                                  <td className="px-6 py-4 font-medium text-white">
                                    {result.title}
                                  </td>

                                  <td className="whitespace-pre-line px-6 py-4 text-slate-300">
                                    {result.note || "-"}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* FOOTER */}
                    <div className="mt-4 flex flex-col items-end text-md">
                      <div className="text-slate-400">
                        Tester: <span className="text-slate-200">{report.person}</span>
                      </div>

                      <div className="text-slate-400">
                        Cluster: <span className="text-slate-200">{report.cluster}</span>
                      </div>

                      <div className="text-slate-400">
                        Duration: <span className="text-slate-200">{report.duration}</span>
                      </div>

                      <button
                        type="button"
                        onClick={handleShare}
                        className={`mt-4 rounded-lg border px-4 py-2 text-sm font-medium transition ${
                          copied
                            ? "border-emerald-500/30 bg-emerald-500/20 text-emerald-300"
                            : "border-white/10 bg-white/10 text-white hover:bg-white/20"
                        }`}
                      >
                        {copied ? "✓ Link Copied" : "Share Results"}
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-12 text-center">
                    <p className="text-lg font-semibold text-white">
                      {loadingReport
                        ? "Loading report..."
                        : "Select a cluster and date, then click View Results"}
                    </p>

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