"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

export default function PersonalSchedule() {
    const [clusters, setClusters] = useState([]);
    const [name, setName] = useState("User");
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const redirected = useRef(false);
    const userId = Cookies.get("selectedPersonId");

    useEffect(() => {
        if (!userId && !redirected.current) {
            redirected.current = true;
            router.replace("/name");
        }
    }, [userId, router]);

    useEffect(() => {
        async function init() {
            try {
                // Get person name
                const nameRes = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/people/id/${userId}`
                );

                const nameData = await nameRes.json();

                if (nameData?.body?.name) {
                    setName(nameData.body.name);
                }

                // Get today's rota (NEW FORMAT: object, not array)
                const rotaRes = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/rota/person/${userId}`
                );

                const rotaData = await rotaRes.json();

                if (!rotaData?.success || !rotaData?.body) {
                    setClusters([]);
                    setLoading(false);
                    return;
                }

                // NEW SHAPE:
                // {
                //   "Oscar": {
                //     id,
                //     clusters: [{ id, name }]
                //   }
                // }

                const personEntry = Object.values(rotaData.body)[0];

                const todaysClusters = personEntry?.clusters || [];

                // Check completion status
                const completedClusterIds = await Promise.all(
                    todaysClusters.map(async (cluster) => {
                        try {
                            const response = await fetch(
                                `${process.env.NEXT_PUBLIC_API_URL}/report/today/cluster/${cluster.id}`
                            );

                            const json = await response.json();

                            return json?.success &&
                                Array.isArray(json.body) &&
                                json.body.length > 0
                                ? cluster.id
                                : null;
                        } catch (error) {
                            console.error(
                                "Failed to load completed report for cluster",
                                cluster.id,
                                error
                            );
                            return null;
                        }
                    })
                );

                const completedIdsSet = new Set(
                    completedClusterIds.filter(Boolean)
                );

                const filteredClusters = todaysClusters.filter(
                    (cluster) => !completedIdsSet.has(cluster.id)
                );

                setClusters(filteredClusters);
            } catch (err) {
                console.error(err);
                setClusters([]);
            } finally {
                setLoading(false);
            }
        }

        if (userId) init();
    }, [router, userId]);

    if (loading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900">
                <div className="rounded-2xl border border-white/10 bg-white/10 px-8 py-6 text-white shadow-2xl backdrop-blur-xl">
                    Loading clusters...
                </div>
            </main>
        );
    }

    const handleClusterClick = (cluster) => {
        Cookies.set("currentCluster", cluster.id);
        router.push("/form");
    };

    return (
        <main className="flex justify-center space-y-8">
            <div className="relative z-10 mx-auto max-w-5xl">
                <div className="rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur-xl">

                    {/* Header */}
                    <div className="mb-10 text-center">
                        <div className="mb-4 flex justify-center">
                            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-4xl shadow-xl">
                                👤
                            </div>
                        </div>

                        <h1 className="text-4xl font-bold text-white">
                            {name}&apos;s Clusters
                        </h1>

                        <p className="mt-2 text-slate-300">
                            Select a cluster to complete your report
                        </p>
                    </div>

                    {/* Clusters */}
                    {clusters.length > 0 ? (
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {clusters.map((cluster) => (
                                <button
                                    key={cluster.id}
                                    onClick={() => handleClusterClick(cluster)}
                                    className="
                                        group
                                        cursor-pointer
                                        rounded-2xl
                                        border
                                        border-blue-400/20
                                        bg-blue-500/10
                                        p-6
                                        text-left
                                        transition-all
                                        duration-300
                                        hover:-translate-y-2
                                        hover:border-blue-400/50
                                        hover:bg-blue-500/20
                                        hover:shadow-2xl
                                    "
                                >
                                    <div className="mb-4 text-4xl">📂</div>

                                    <div className="text-xs font-semibold uppercase tracking-widest text-blue-300">
                                        Cluster
                                    </div>

                                    <div className="mt-2 text-xl font-bold text-white">
                                        {cluster.name}
                                    </div>

                                    <div className="mt-4 font-medium text-blue-300 transition-transform group-hover:translate-x-2">
                                        Open Report →
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center">
                            <div className="mb-4 text-6xl">📭</div>

                            <h2 className="text-xl font-semibold text-white">
                                No Clusters Assigned
                            </h2>

                            <p className="mt-2 text-slate-300">
                                You don&apos;t have any clusters assigned for today.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}