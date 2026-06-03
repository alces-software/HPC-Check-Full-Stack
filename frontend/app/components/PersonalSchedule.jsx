"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

export default function PersonalSchedule() {
    const [clusters, setClusters] = useState([]);
    const [name, setName] = useState("User");
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        async function getName() {
            try {
                const userId = Cookies.get("selectedPersonId");

                if (!userId) return;

                const nameRes = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/people/id/${userId}`
                );

                const nameData = await nameRes.json();

                if (nameData) {
                    setName(nameData.body.name);
                }

                const rotaRes = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/rota/person/${userId}`
                );

                const rotaData = await rotaRes.json();

                if (!rotaData.success) return;

                const today = new Date().getDay();
                const dayIndex = today - 1;

                if (dayIndex < 0 || dayIndex > 4) {
                    setClusters([]);
                    return;
                }

                const todaysClusters = rotaData.body.filter(
                    (item) => item.dayIndex === dayIndex
                );

                setClusters(todaysClusters);
            } finally {
                setLoading(false);
            }
        }

        getName();
    }, []);

    const handleClusterClick = (cluster) => {
        Cookies.set("currentCluster", cluster)
        router.push("/form")
    };

    return (
        <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 p-6">
            {/* Background glow */}
            <div className="absolute left-0 top-0 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />
            <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl" />

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
                            {clusters.map((item, index) => (
                                <button
                                    key={`${item.cluster}-${index}`}
                                    onClick={() => handleClusterClick(item.cluster)}
                                    className="
                  group
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
                                    <div className="mb-4 text-4xl">
                                        📂
                                    </div>

                                    <div className="text-xs font-semibold uppercase tracking-widest text-blue-300">
                                        Cluster
                                    </div>

                                    <div className="mt-2 text-xl font-bold text-white">
                                        {item.cluster}
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