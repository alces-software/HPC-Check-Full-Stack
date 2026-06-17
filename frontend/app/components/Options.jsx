"use client";

import { useState, useEffect } from "react";
import Link from "next/link";



export default function Options() {
  const [userName, setUserName] = useState("");
  const [clusterName, setClusterName] = useState("");

  const [teamName, setTeamName] = useState("");

  const [people, setPeople] = useState([]);
  const [clusters, setClusters] = useState([]);

  const [teams, setTeams] = useState([]);



  const [userError, setUserError] = useState("");
  const [clusterError, setClusterError] = useState("");
  const [teamError, setTeamError] = useState("");

  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState("success");
  const [confirmPrompt, setConfirmPrompt] = useState(null);

  const loadPeople = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/people`
      );
      const data = await res.json();

      setPeople(data.body ?? []);
    } catch (err) {
      console.error("Failed to fetch people:", err);
    }
  };

  const loadClusters = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/hpc`
      );
      const data = await res.json();

      setClusters(data.body ?? []);
    } catch (err) {
      console.error("Failed to fetch clusters:", err);
    }
  };

    const loadTeams = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/teams`)
      const data = await res.json()

      setTeams(data.body ?? []);
    } catch (err) {
      console.error("Failed to fetch teams:", err);
      setTeams([])
    }
  };

  useEffect(() => {
    async function initialize() {
      await loadPeople();
      await loadClusters();
      await loadTeams();
    }

    initialize();
  }, []);

  const deleteItem = async (url, id) => {
    try {
      const res = await fetch(url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: id
        })
      });

      const json = await res.json();

      if (!json.success) {
        throw new Error(json.message ?? "Delete failed");
      }

      return json;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const showStatus = (message, type = "success") => {
    setStatusMessage(message);
    setStatusType(type);
  };

  const clearStatus = () => {
    setStatusMessage("");
  };

  const requestConfirmation = (message, action) => {
    setConfirmPrompt({ message, action });
  };

  const cancelConfirmation = () => {
    setConfirmPrompt(null);
  };

  const confirmPendingAction = async () => {
    if (!confirmPrompt) return;
    const action = confirmPrompt.action;
    setConfirmPrompt(null);

    try {
      await action();
    } catch (err) {
      console.error(err);
    }
  };

  const confirmAddUser = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/people/add`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: userName,
          }),
        }
      );

      const json = await res.json();

      if (!json.success) {
        setUserError(json.message ?? "Could not add this user.");
        return;
      }

      setUserName("");
      await loadPeople();
      showStatus(`Added user "${userName}" successfully.`, "success");
    } catch (err) {
      console.error(err);
      setUserError("Failed to communicate with the server.");
      showStatus("Failed to add user.", "error");
    }
  };

  const handleAddUser = () => {
    setUserError("");
    clearStatus();

    if (!userName.trim()) {
      setUserError("Please enter a username.");
      return;
    }

    requestConfirmation(
      `Are you sure you want to add the user "${userName}"?`,
      confirmAddUser
    );
  };

 const confirmAddTeam = async () => {
  const nameToAdd = teamName.trim();

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/teams`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: nameToAdd,
      }),
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      setTeamError(data.message ?? data.error ?? "Could not add this team.");
      showStatus("Failed to add team.", "error");
      return;
    }

    setTeamName("");
    await loadTeams();
    showStatus(`Added team "${nameToAdd}" successfully.`, "success");
  } catch (err) {
    console.error(err);
    setTeamError("Failed to communicate with the server.");
    showStatus("Failed to add team.", "error");
  }
};


  const confirmAddCluster = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/hpc/add`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: clusterName,
          }),
        }
      );

      const json = await res.json();

      if (!json.success) {
        setClusterError(json.message ?? "Could not add this cluster.");
        return;
      }

      setClusterName("");
      await loadClusters();
      showStatus(`Added cluster "${clusterName}" successfully.`, "success");
    } catch (err) {
      console.error(err);
      setClusterError("Failed to communicate with the server.");
      showStatus("Failed to add cluster.", "error");
    }
  };

  const handleAddCluster = () => {
    setClusterError("");
    clearStatus();

    if (!clusterName.trim()) {
      setClusterError("Please enter a cluster name.");
      return;
    }

    requestConfirmation(
      `Are you sure you want to add the cluster "${clusterName}"?`,
      confirmAddCluster
    );
  };

  const handleDeleteUser = (id, name) => {
    clearStatus();

    requestConfirmation(`Are you sure you want to delete ${name}?`, async () => {
      try {
        await deleteItem(
          `${process.env.NEXT_PUBLIC_API_URL}/people/delete/`,
          id
        );

        await loadPeople();
        showStatus(`Deleted user "${name}" successfully.`, "success");
      } catch {
        showStatus(`Failed to delete user "${name}".`, "error");
      }
    });
  };

  const handleDeleteCluster = (id, name) => {
    clearStatus();

    requestConfirmation(`Are you sure you want to delete ${name}?`, async () => {
      try {
        await deleteItem(
          `${process.env.NEXT_PUBLIC_API_URL}/hpc/delete/`,
          id
        );

        await loadClusters();
        showStatus(`Deleted cluster "${name}" successfully.`, "success");
      } catch {
        showStatus(`Failed to delete cluster "${name}".`, "error");
      }
    });
  };



  const handleDeleteTeam = (id, name) => {
    clearStatus();

    requestConfirmation(`Are you sure you want to delete ${name}?`, async () => {
      try {
        await deleteItem(
          `${process.env.NEXT_PUBLIC_API_URL}/teams`,
          id
        );


        await loadTeams()
      

      showStatus(`Deleted team "${name}" successfully.`, "success");
    } catch {
      showStatus(`Failed to delete team "${name}".`, "error");
      
    }
  })};

  const handleRegenerateSchedule = () => {
    clearStatus();

    requestConfirmation(
      "Are you sure you want to regenerate the schedule?",
      async () => {
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/rota/new`
          );

          const json = await res.json();

          if (json.success) {
            showStatus("Generated new schedule", "success");
          } else {
            throw new Error(json.message || "Failed to regenerate schedule");
          }
        } catch (err) {
          console.error(err);
          showStatus("Failed to regenerate schedule.", "error");
        }
      }
    );
  };

  const handleAddTeam = () => {
    setTeamError("");
    clearStatus();

    if (!teamName.trim()) {
      setTeamError("Please enter a team name.");
      return;
    }

    requestConfirmation(
      `Are you sure you want to add the team "${teamName}"?`,
      confirmAddTeam
    );
  };


  
  return (
    <main className="flex justify-center space-y-8">
      <div className="absolute h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />

      <div className="relative z-10 w-full max-w-6xl">
        <div className="rounded-3xl border border-white/10 bg-white/10 p-10 shadow-2xl backdrop-blur-xl">
          <div className="mb-10 text-center">
            <div className="mb-4 flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-4xl shadow-xl">
                ⚙️
              </div>
            </div>

            <h1 className="text-5xl font-bold text-white">
              Administration
            </h1>

            <p className="mt-3 text-lg text-slate-300">
              Manage users, clusters, and future system
              options.
            </p>
          </div>

          {confirmPrompt && (
            <div className="mb-6 rounded-2xl border border-yellow-400/20 bg-yellow-500/10 p-5 text-slate-100">
              <p className="mb-3 text-sm font-medium">
                {confirmPrompt.message}
              </p>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={confirmPendingAction}
                  className="rounded-xl bg-yellow-500 px-4 py-2 font-semibold text-slate-950 transition hover:bg-yellow-400 cursor-pointer"
                >
                  Confirm
                </button>

                <button
                  type="button"
                  onClick={cancelConfirmation}
                  className="rounded-xl border border-white/10 bg-slate-900/80 px-4 py-2 text-white transition hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {statusMessage && (
            <div
              className={`mb-6 rounded-2xl border px-4 py-4 text-sm ${statusType === "error"
                ? "border-red-500/30 bg-red-500/10 text-red-100"
                : "border-green-500/30 bg-green-500/10 text-emerald-100"
                }`}
            >
              {statusMessage}
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Users */}
            <div className="rounded-2xl border border-blue-400/20 bg-blue-500/10 p-6">
              <div className="mb-3 text-4xl">👤</div>

              <h2 className="mb-2 text-2xl font-bold text-white">
                Add User
              </h2>

              <div className="space-y-3">
                <input
                  type="text"
                  value={userName}
                  onChange={(e) =>
                    setUserName(e.target.value)
                  }
                  placeholder="Username"
                  className="w-full rounded-xl border border-slate-600 bg-slate-800/80 px-4 py-3 text-left text-white backdrop-blur-md outline-none transition hover:border-white/20 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                />

                <button
                  onClick={handleAddUser}
                  className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-500 cursor-pointer"
                >
                  Add User
                </button>

                {userError && (
                  <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                    {userError}
                  </div>
                )}
              </div>

              <div className="mt-6 border-t border-white/10 pt-4">
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-300">
                  Existing Users
                </h3>

                <div className="max-h-64 space-y-2 overflow-y-auto">
                  {people.length === 0 ? (
                    <p className="text-sm text-slate-400">
                      No users found.
                    </p>
                  ) : (
                    people.map((person) => (
                      <div
                        key={person.id}
                        className="flex items-start justify-between rounded-xl border border-slate-600 bg-slate-800/80 px-4 py-3 text-white backdrop-blur-md transition hover:border-white/20"
                      >
                        <div>
                          <p className="font-medium text-white">
                            {person.name}
                          </p>

                          <p className="text-xs text-slate-400">
                            {person.id}
                          </p>
                        </div>

                        <button
                          onClick={() => handleDeleteUser(person.id, person.name)}
                          className="ml-3 cursor-pointer flex h-8 w-8 items-center justify-center rounded-lg border border-red-500/20 bg-red-500/10 text-red-300 transition hover:bg-red-500/20 hover:text-red-200"
                          title="Delete user"
                        >
                          ✕
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Clusters */}
            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-6">
              <div className="mb-3 text-4xl">🗄️</div>

              <h2 className="mb-2 text-2xl font-bold text-white">
                Add Cluster
              </h2>

              <div className="space-y-3">
                <input
                  type="text"
                  value={clusterName}
                  onChange={(e) =>
                    setClusterName(e.target.value)
                  }
                  placeholder="Cluster name"
                  className="w-full rounded-xl border border-slate-600 bg-slate-800/80 px-4 py-3 text-left text-white backdrop-blur-md outline-none transition hover:border-white/20 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                />

                <button
                  onClick={handleAddCluster}
                  className="w-full rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white transition hover:bg-emerald-500 cursor-pointer"
                >
                  Add Cluster
                </button>

                {clusterError && (
                  <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                    {clusterError}
                  </div>
                )}
              </div>

              <div className="mt-6 border-t border-white/10 pt-4">
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-300">
                  Existing Clusters
                </h3>

                <div className="max-h-64 space-y-2 overflow-y-auto">
                  {clusters.length === 0 ? (
                    <p className="text-sm text-slate-400">
                      No clusters found.
                    </p>
                  ) : (
                    clusters.map((cluster) => (
                      <div
                        key={cluster.id}
                        className="flex items-start justify-between rounded-xl border border-slate-600 bg-slate-800/80 px-4 py-3 text-white backdrop-blur-md transition hover:border-white/20"
                      >
                        <div>
                          <Link href={`/clusters/${cluster.id}`} className="flex-1 curso-pointer">
                          <p className="font-medium text-white">
                            {cluster.name}
                          </p>

                          <p className="text-xs text-slate-400">
                            {cluster.id}
                          </p>
                          </Link>
                        </div>

                        <button
                          onClick={() => handleDeleteCluster(cluster.id, cluster.name)}
                          className="ml-3 cursor-pointer flex h-8 w-8 items-center justify-center rounded-lg border border-red-500/20 bg-red-500/10 text-red-300 transition hover:bg-red-500/20 hover:text-red-200"
                          title="Delete cluster"
                        >
                          ✕
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Teams */}
            <div className="rounded-2xl border border-amber-400/20 bg-amber-500/10 p-6">
              <div className="mb-3 text-4xl">👥</div>

              <h2 className="mb-2 text-2xl font-bold text-white">
                Add Team
              </h2>

              <div className="space-y-3">
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="Team name"
                  className="w-full rounded-xl border border-slate-600 bg-slate-800/80 px-4 py-3 text-left text-white backdrop-blur-md outline-none transition hover:border-white/20 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                />

                <button
                  onClick={handleAddTeam}
                  className="w-full rounded-xl bg-amber-600 px-4 py-3 font-semibold text-white transition hover:bg-amber-500 cursor-pointer"
                >
                  Add Team
                </button>

                {teamError && (
                  <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                    {teamError}
                  </div>
                )}
              </div>

              <div className="mt-6 border-t border-white/10 pt-4">
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-300">
                  Existing Teams
                </h3>

                <div className="max-h-64 space-y-2 overflow-y-auto">
                  {teams.length === 0 ? (
                    <p className="text-sm text-slate-400">
                      No teams found.
                    </p>
                  ) : (
                    teams.map((team) => (
                      <div
                        key={team.id}
                        className="flex items-start justify-between rounded-xl border border-slate-600 bg-slate-800/80 px-4 py-3 text-white backdrop-blur-md transition hover:border-white/20"
                      >
                        <Link href={`/teams/${team.id}`} className="flex-1">
                          <p className="font-medium text-white transition hover:text-amber-300">
                            {team.name}
                          </p>

                          <p className="text-xs text-slate-400">
                            {team.id}
                          </p>

                          <p className="mt-1 text-xs text-amber-300">
                            View team settings
                          </p>
                        </Link>

                        <button
                          onClick={() => handleDeleteTeam(team.id, team.name)}
                          className="ml-3 cursor-pointer flex h-8 w-8 items-center justify-center rounded-lg border border-red-500/20 bg-red-500/10 text-red-300 transition hover:bg-red-500/20 hover:text-red-200"
                          title="Delete team"
                        >
                          ✕
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>












          </div>
          <div className="mt-6 rounded-2xl border border-purple-400/20 bg-purple-500/10 p-6">
            <div className="mb-3 text-4xl">📅</div>

            <h2 className="mb-2 text-2xl font-bold text-white">
              Schedule Management
            </h2>

            <p className="mb-6 text-slate-300">
              Rebuild and redistribute the rota using the latest users, clusters, and scheduling rules. If you do not click this, the schedule will be updated next monday with the new fields
            </p>

            <button
              onClick={handleRegenerateSchedule}
              className="rounded-xl bg-gradient-to-r cursor-pointer from-purple-600 to-indigo-600 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl"
            >
              🔄 Regenerate Schedule
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}