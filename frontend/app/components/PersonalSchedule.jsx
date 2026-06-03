"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

export default function PersonalSchedule() {
    const [clusters, setClusters] = useState([]);
    const [name, setName] = useState("User");
    const router = useRouter();

    useEffect(() => {
        async function getName() {
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

            const reportRes = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/report/today`
            );

            const reportData = await reportRes.json();
            console.log(reportData)

            const today = new Date().getDay();

            const dayIndex = today - 1;

            if (dayIndex < 0 || dayIndex > 4) {
                setClusters([]);
                return;
            }

            // Get cluster ids for the clusters

            // log if a report exists with both the cluster id and person ID

            const todaysClusters = rotaData.body.filter(
                (item) => item.dayIndex === dayIndex
            );


            setClusters(todaysClusters);
        }

        getName();
    }, []);

    const handleClusterClick = (cluster) => {
        Cookies.set("currentCluster", cluster)
        router.push("/")
    };

    return (
    <main className="min-h-screen bg-slate-100 p-8">
        <div className="mx-auto max-w-4xl rounded-xl bg-white p-6 shadow">
        <h1 className="mb-6 text-2xl font-bold text-black">
            {name}&apos;s Clusters
        </h1>

        <div className="flex flex-wrap gap-4">
            {clusters.length > 0 ? (
            clusters.map((item, index) => (
                <button
                key={`${item.cluster}-${index}`}
                onClick={() => handleClusterClick(item.cluster)}
                className="
                    group
                    min-w-[200px]
                    rounded-xl
                    border
                    border-slate-200
                    bg-gradient-to-br
                    from-blue-500
                    to-blue-700
                    px-6
                    py-4
                    text-left
                    text-white
                    shadow-md
                    transition-all
                    duration-200
                    hover:-translate-y-1
                    hover:shadow-xl
                    active:translate-y-0
                "
                >
                <div className="text-xs font-semibold uppercase tracking-wider text-blue-100">
                    Cluster
                </div>

                <div className="mt-1 text-lg font-bold">
                    {item.cluster}
                </div>

                <div className="mt-2 text-sm text-blue-100 opacity-80 group-hover:opacity-100">
                    Click to select →
                </div>
                </button>
            ))
            ) : (
            <p className="text-slate-600">
                No clusters assigned for today.
            </p>
            )}
        </div>
        </div>
    </main>
    );
}