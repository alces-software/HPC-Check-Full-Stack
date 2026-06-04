
"use client";

import { useState, useEffect } from "react";
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

  const canSearch = tester !== "" && cluster !== "" && date !== null;

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
    const seconds = Math.floor((diffMs / 1000 / 60) % 60);

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

      const selectedPerson = allNames.find((person) => person.name === tester);
      const selectedCluster = allClusters.find((hpc) => hpc.name === cluster);

      if (!selectedPerson || !selectedCluster || !date) return;

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/report/person/${selectedPerson.id}`
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

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 p-6">
      <div className="w-full max-w-6xl">
        <div className="rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur-xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white">
              HPC Test Results
            </h1>

            <p className="mt-2 text-slate-300">
              {report
                ? `Results for ${report.person}'s test on ${report.cluster
                } ${formatDate(new Date(Number(report.startTime)))}`
                : "Select tester, cluster and date to display results"}
            </p>
          </div>

          <div className="mb-4 grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-300">
                Tester
              </label>

              <select
                value={tester}
                onChange={(event) => setTester(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-white outline-none focus:border-blue-400"
              >
                <option value="" className="bg-slate-900">
                  Select tester
                </option>

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
                <option value="" className="bg-slate-900">
                  Select cluster
                </option>

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

          <div className="mb-8 flex justify-center">
            <button
              type="button"
              onClick={findReport}
              disabled={!canSearch || loadingReport}
              className="cursor-pointer rounded-xl bg-blue-500 px-6 py-3 font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loadingReport ? "Loading..." : "View Results"}
            </button>
          </div>

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
                        const outcome = result.passed
                          ? "PASS"
                          : "FAIL";

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
                  Tester:{" "}
                  <span className="text-slate-200">
                    {report.person}
                  </span>
                </div>

                <div className="text-slate-400">
                  Cluster:{" "}
                  <span className="text-slate-200">
                    {report.cluster}
                  </span>
                </div>

                <div className="text-slate-400">
                  Duration:{" "}
                  <span className="text-slate-200">
                    {report.duration}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-12 text-center">
              <p className="text-lg font-semibold text-white">
                {loadingReport
                  ? "Loading report..."
                  : "Select tester, cluster and date, then click View Results"}
              </p>

              <p className="mt-2 text-slate-400">
                The button is disabled until all required fields are selected.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}