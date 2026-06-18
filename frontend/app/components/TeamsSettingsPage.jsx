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

    const [teams, setTeams] = useState([]);
    const [loadingTeams, setLoadingTeams] = useState(true);

    const loadTeams = useCallback(async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/teams`);
            const data = await res.json();

            setTeams(data.body ?? []);
        } catch (err) {
            console.error("Failed to fetch teams:", err);
            setTeams([]);
        } finally {
            setLoadingTeams(false);
        }
    }, []);


    const [allClusters, setAllClusters] = useState([])

 const loadAllClusters = useCallback(async () => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/hpc`);
    const data = await res.json();

    setAllClusters(data.body ?? []);
  } catch (err) {
    console.error("Failed to fetch clusters:", err);
    setAllClusters([]);
  }
}, []);

    useEffect(() => {
        loadTeams();
        loadAllClusters();
    }, [loadTeams, loadAllClusters]);

    const team = teams.find((team) => team.id === teamId);

    const [selectedUserId, setSelectedUserId] = useState("");
    const [selectedClusterId, setSelectedClusterId] = useState("");

    const [teamUsers, setTeamUsers] = useState([])
    const [users, setUsers] = useState([])

    const [clusters, setClusters] = useState([])
    const [teamClusters, setTeamClusters] = useState([])

    const [statusMessage, setStatusMessage] = useState("");
    const [statusType, setStatusType] = useState("success");



    const getTeamUsers = useCallback(async () => {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/people/team/${teamId}`);
        const data = await res.json();
        setTeamUsers(data.body);
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


    const getClusters = useCallback(async () => {
        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/hpc/team/not/${teamId}`
            );
            const data = await res.json();

            setClusters(data.body ?? []);
        } catch (err) {
            console.error("Failed to fetch available clusters:", err);
            setClusters([]);
        }
    }, [teamId]);

    useEffect(() => {

        getClusters();
    }, [getClusters]);

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


        const userToAdd = users.find(user => user.id === selectedUserId)
        const userTeamId = userToAdd.teamId
        const userTeamName = teams.find(t => t.id === userTeamId)?.name
        console.log(teams)

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/people/team/${userTeamId}`);
        const data = await res.json();

        console.log("User to add: ", userToAdd)

        console.log(data.body)

        if (data.body.length === 1) {
            alert(`You cannot add ${userToAdd.name} as they are the only remaining member in ${userTeamName}.`)
            return
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
            

            // showStatus("User added to team.", "success");
        } catch (err) {
            console.error(err);
            // showStatus("Failed to add user to team.", "error");
        }
    };

    const handleAddCluster = async () => {
        if (!selectedClusterId) {
            showStatus("Please select a user.", "error");
            return;
        }

        const clusterToAdd = allClusters.find(cluster => cluster.id === selectedClusterId)
        const clusterTeamId = clusterToAdd.teamId
        const clusterTeamName = teams.find(t => t.id === clusterTeamId)?.name
        console.log(teams)

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/hpc/team/${clusterTeamId}`);
        const data = await res.json();

        if (data.body.length === 1) {
            alert(`You cannot add ${clusterToAdd.name} as it is the only remaining cluster in ${clusterTeamName}.`)
            return
        }

        console.log(selectedClusterId);
        console.log("TEAMS ", data.body);
        console.log("Cluster to add is ", clusterToAdd)



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

            await Promise.all([
                getTeamClusters(),
                getClusters(),
                loadAllClusters(),
            ]);
            // showStatus("User added to team.", "success");
        } catch (err) {
            console.error(err);
            // showStatus("Failed to add user to team.", "error");
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

                </div>
            </div>
        </main>
    );
}