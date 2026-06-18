"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import {
    Listbox,
    ListboxButton,
    ListboxOptions,
    ListboxOption,
} from "@headlessui/react";

export default function TeamSettingsPage() {
    const searchParams = useSearchParams();
    const teamId = searchParams.get("id");

    const [team, setTeam] = useState([]);
    const [clustersPerDay, setClustersPerDay] = useState(0);
    const [loadingTeams, setLoadingTeams] = useState(true);

    const loadTeam = useCallback(async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/teams/id/${teamId}`);
            const data = await res.json();

            setTeam(data.body);
            setClustersPerDay(data.body.clusters_per_day);
        } catch (err) {
            console.error("Failed to fetch teams:", err);
            setTeam([]);
        } finally {
            setLoadingTeams(false);
        }
    }, [teamId]);

    useEffect(() => {
        loadTeam();
    }, [loadTeam]);

    const [selectedUserId, setSelectedUserId] = useState("");
    const [selectedClusterId, setSelectedClusterId] = useState("");

    const [teamUsers, setTeamUsers] = useState([]);
    const [users, setUsers] = useState([]);

    const [clusters, setClusters] = useState([]);
    const [teamClusters, setTeamClusters] = useState([]);

    const [statusMessage, setStatusMessage] = useState("");
    const [statusType, setStatusType] = useState("success");
    const [savingSettings, setSavingSettings] = useState(false);

    const getTeamUsers = useCallback(async () => {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/people/team/${teamId}`);
        const data = await res.json();
        setTeamUsers(data.body)
    }, [teamId]);

    useEffect(() => {
        getTeamUsers();
    }, [getTeamUsers]);

    useEffect(() => {
        async function getUsers() {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/people/team/not/${teamId}`);
            const data = await res.json();
            setUsers(data.body);
        }
        getUsers();
    }, [teamId]);

    useEffect(() => {
        async function getClusters() {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/hpc/team/not/${teamId}`);
            const data = await res.json();
            setClusters(data.body)
        }
        getClusters();
    }, [teamId]);

    const getTeamClusters = useCallback(async () => {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/hpc/team/${teamId}`);
        const data = await res.json();
        setTeamClusters(data.body);
    }, [teamId]);

    useEffect(() => {
        getTeamClusters();
    }, [getTeamClusters]);

    if (!team) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 p-6">
                <div className="rounded-3xl border border-white/10 bg-white/10 p-10 text-center shadow-2xl backdrop-blur-xl">
                    <h1 className="mb-4 text-4xl font-bold text-white">
                        Team not found
                    </h1>

                    <p className="mb-6 text-slate-300">
                        No team exists with ID: {teamId}
                    </p>


                </div>
            </main>
        );
    }

    const handleAddUser = async () => {
        if (!selectedUserId) {
            showStatus("Please select a user.", "error");
            return;
        }

        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/people/team/${selectedUserId}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        teamId: teamId,
                    }),
                }
            );

            const data = await res.json();

            if (!res.ok || !data.success) {
                throw new Error(data.message || "Failed to add user to team.");
            }

            setUsers((previousUsers) =>
                previousUsers.filter((user) => user.id !== selectedUserId)
            );

            setSelectedUserId("");
            getTeamUsers()

            setStatusMessage("User added to team.");
            setStatusType("success");
        } catch (err) {
            console.error(err);
            setStatusMessage("Failed to add user to team.");
            setStatusType("error");
        }
    };

    const handleAddCluster = async () => {
        if (!selectedClusterId) {
            showStatus("Please select a user.", "error");
            return;
        }

        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/hpc/team/${selectedClusterId}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        teamId: teamId,
                    }),
                }
            );

            const data = await res.json();

            if (!res.ok || !data.success) {
                throw new Error(data.message || "Failed to add user to team.");
            }

            setClusters((previousClusters) =>
                previousClusters.filter((cluster) => cluster.id !== selectedClusterId)
            );

            setSelectedClusterId("");
            getTeamClusters()

            setStatusMessage("Cluster added to team.");
            setStatusType("success");
        } catch (err) {
            console.error(err);
            setStatusMessage("Failed to add cluster to team.");
            setStatusType("error");
        }
    };

    const handleSaveSettings = async () => {
        if (!teamId) return;

        try {
            setSavingSettings(true);
            setStatusMessage("");

            if (clustersPerDay < 0) {
                setStatusMessage("Can't set clusters per day to zero.");
                setStatusType("error");
                return;
            } else if (clustersPerDay === team.clusters_per_day) {
                setStatusMessage("There's no changes made to settings to save.");
                setStatusType("error");
                return;
            }

            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/teams`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        id: teamId,
                        clusters_per_day: clustersPerDay,
                    }),
                }
            );

            const data = await res.json();

            if (!res.ok || !data.success) {
                throw new Error(data.message || "Failed to update settings");
            }

            setTeam((prev) => ({
                ...prev,
                clusters_per_day: clustersPerDay,
            }));

            setStatusMessage("Settings updated successfully.");
            setStatusType("success");
        } catch (err) {
            console.error(err);
            setStatusMessage("Failed to save settings.");
            setStatusType("error");
        } finally {
            setSavingSettings(false);
        }
    };

    if (loadingTeams) {
        return (
            <main className="flex min-h-screen items-center justify-center">
                <p className="text-white">Loading team...</p>
            </main>
        );
    }

    if (!team) {
        return (
            <main className="flex min-h-screen items-center justify-center">
                <p className="text-white">Team not found: {teamId}</p>
            </main>
        );
    }

    return (
        <main className="flex min-h-screen items-center justify-center">
            <div className="absolute h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />

            <div className="relative z-10 w-full max-w-5xl">
                <div className="rounded-3xl border border-white/10 bg-white/10 p-10 shadow-2xl backdrop-blur-xl">


                    <div className="mt-8 text-center">
                        <div className="mb-4 flex justify-center">
                            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-600 text-4xl shadow-xl">
                                👥
                            </div>
                        </div>

                        <h1 className="text-5xl font-bold text-white">
                            {team.name}
                        </h1>

                        <p className="mt-3 text-lg text-slate-300">
                            Manage users and clusters assigned to this team.
                        </p>

                        <p className="mt-2 text-sm text-amber-300">
                            id: {team.id}
                        </p>
                    </div>

                    {statusMessage && (
                        <div
                            className={`mt-8 rounded-2xl border px-4 py-4 text-sm ${statusType === "error"
                                ? "border-red-500/30 bg-red-500/10 text-red-100"
                                : "border-green-500/30 bg-green-500/10 text-emerald-100"
                                }`}
                        >
                            {statusMessage}
                        </div>
                    )}

                    <div className="mt-10 grid gap-6 lg:grid-cols-2">
                        <div className="rounded-2xl border border-blue-400/20 bg-blue-500/10 p-6">
                            <div className="mb-3 text-4xl">👤</div>

                            <h2 className="mb-2 text-2xl font-bold text-white">
                                Users
                            </h2>

                            <p className="mb-4 text-sm text-slate-300">
                                Add existing users to this team.
                            </p>

                            <div className="mb-6 flex gap-3">

                                <Listbox as="div" value={selectedUserId} onChange={setSelectedUserId} className="w-full">
                                    <div className="relative">
                                        <ListboxButton className="w-full rounded-xl border border-slate-600 bg-slate-800/80 px-3 py-3 text-left cursor-pointer text-white outline-none transition hover:border-white/20 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30">
                                            {users.find((user) => user.id === selectedUserId)?.name || "Select user"}

                                            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                                                ▼
                                            </span>
                                        </ListboxButton>

                                        <ListboxOptions className="absolute z-50 mt-2 max-h-40 w-full overflow-y-auto rounded-xl border border-white/10 bg-slate-900/95 shadow-2xl backdrop-blur-xl">
                                            {users.map((user) => (
                                                <ListboxOption
                                                    key={user.id}
                                                    value={user.id}
                                                    className="cursor-pointer px-4 py-3 text-white transition data-[active]:bg-blue-500/20 data-[selected]:font-semibold"
                                                >
                                                    {user.name}
                                                </ListboxOption>
                                            ))}
                                        </ListboxOptions>
                                    </div>
                                </Listbox>


                                <button
                                    type="button"
                                    onClick={handleAddUser}
                                    className="rounded-xl bg-blue-600 px-5 py-3 cursor-pointer font-semibold text-white transition hover:bg-blue-500"
                                >
                                    Add
                                </button>
                            </div>

                            <div className="border-t border-white/10 pt-4">
                                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-300">
                                    Users in Team
                                </h3>

                                <div className="space-y-2">
                                    {teamUsers.length === 0 ? (
                                        <p className="text-sm text-slate-400">
                                            No users assigned yet.
                                        </p>
                                    ) : (
                                        teamUsers.map((user) => (
                                            <div
                                                key={user.id}
                                                className="flex items-start justify-between rounded-xl border border-slate-600 bg-slate-800/80 px-4 py-3 text-white"
                                            >
                                                <div>
                                                    <p className="font-medium text-white">
                                                        {user.name}
                                                    </p>

                                                    <p className="text-xs text-slate-400">
                                                        {user.id}
                                                    </p>
                                                </div>


                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-6">
                            <div className="mb-3 text-4xl">🗄️</div>

                            <h2 className="mb-2 text-2xl font-bold text-white">
                                Clusters
                            </h2>

                            <p className="mb-4 text-sm text-slate-300">
                                Add existing clusters to this team.
                            </p>

                            <div className="mb-6 flex gap-3">

                                <Listbox as="div" value={selectedClusterId} onChange={setSelectedClusterId} className={"w-full"}>
                                    <div className="relative">
                                        <ListboxButton className="w-full rounded-xl border border-slate-600 bg-slate-800/80 px-3 py-3 text-left cursor-pointer text-white outline-none transition hover:border-white/20 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30">
                                            {clusters.find((cluster) => cluster.id === selectedClusterId)?.name ||
                                                "Select cluster"}

                                            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                                                ▼
                                            </span>
                                        </ListboxButton>

                                        <ListboxOptions className="absolute z-50 mt-2 max-h-40 w-full overflow-auto rounded-xl border border-white/10 bg-slate-900/95 shadow-2xl backdrop-blur-xl">
                                            {clusters.map((cluster) => (
                                                <ListboxOption
                                                    key={cluster.id}
                                                    value={cluster.id}
                                                    className="cursor-pointer px-4 py-3 text-white transition data-[active]:bg-blue-500/20 data-[selected]:font-semibold"
                                                >
                                                    {cluster.name}
                                                </ListboxOption>
                                            ))}
                                        </ListboxOptions>
                                    </div>
                                </Listbox>


                                <button
                                    type="button"
                                    onClick={handleAddCluster}
                                    className="rounded-xl bg-emerald-600 px-5 py-3 cursor-pointer font-semibold text-white transition hover:bg-emerald-500"
                                >
                                    Add
                                </button>
                            </div>

                            <div className="border-t border-white/10 pt-4">
                                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-300">
                                    Clusters in Team
                                </h3>

                                <div className="space-y-2">
                                    {teamClusters.length === 0 ? (
                                        <p className="text-sm text-slate-400">
                                            No clusters assigned yet.
                                        </p>
                                    ) : (
                                        teamClusters.map((cluster) => (
                                            <div
                                                key={cluster.id}
                                                className="flex items-start justify-between rounded-xl border border-slate-600 bg-slate-800/80 px-4 py-3 text-white"
                                            >
                                                <div>
                                                    <p className="font-medium text-white">
                                                        {cluster.name}
                                                    </p>

                                                    <p className="text-xs text-slate-400">
                                                        {cluster.id}
                                                    </p>
                                                </div>

                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SETTINGS SECTION */}
                    <div className="mt-6 rounded-2xl border border-purple-400/20 bg-purple-500/10 p-6">
                        <div className="mb-3 text-4xl">⚙️</div>

                        <h2 className="mb-2 text-2xl font-bold text-white">
                            Settings
                        </h2>

                        <p className="mb-4 text-sm text-slate-300">
                            Team configuration options.
                        </p>

                        <div className="flex flex-col gap-3">
                            <label className="text-sm text-slate-300">
                                Clusters per day
                            </label>

                            <input
                                type="number"
                                value={clustersPerDay}
                                onChange={(e) => setClustersPerDay(Number(e.target.value))}
                                min={1}
                                className="w-full rounded-xl border border-slate-600 bg-slate-800/80 px-3 py-3 text-white outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30"
                            />
                        </div>

                        {/* optional future button hook */}
                        <div className="mt-5 flex justify-end">
                            <button
                                type="button"
                                onClick={handleSaveSettings}
                                disabled={savingSettings}
                                className="rounded-xl bg-purple-600 px-5 py-3 font-semibold text-white transition hover:bg-purple-500 disabled:opacity-50"
                            >
                                {savingSettings ? "Saving..." : "Save"}
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </main>
    );
}