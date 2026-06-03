"use client";

import { useEffect, useState } from "react";


export default function Schedule() {
    const today = new Date();
    const weekBeginning = new Date(today);
    const day = weekBeginning.getDay();

    const diff = day === 0 ? -6 : 1 - day;
    weekBeginning.setDate(weekBeginning.getDate() + diff);

    const dayOfWeek = today.toLocaleDateString("en-GB", {
        weekday: "long"
    });

    const formattedWeekBeginning = weekBeginning.toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
    });

    const [schedule, setSchedule] = useState(null);

    useEffect(() => {
        async function getRota() {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/rota`);
                const data = await res.json();

                console.log(process.env.API_URL);

                setSchedule(data.body);
            } catch (error) {
                console.error("Failed to fetch rota:", error);
            }
        }

        getRota();
    }, []);

    useEffect(() => {
        console.log(schedule);
    }, [schedule]);

    if (!schedule) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900">
                <div className="rounded-2xl bg-white/10 px-8 py-6 text-white backdrop-blur-xl">
                    Loading schedule...
                </div>
            </main>
        );
    }

    const days = [
        ["mon", "Monday"],
        ["tue", "Tuesday"],
        ["wed", "Wednesday"],
        ["thu", "Thursday"],
        ["fri", "Friday"],
    ];

    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 p-6">
            <div className="mx-auto max-w-5xl">
                <div className="rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur-xl">
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold text-white">
                            Weekly Schedule
                        </h1>

                        <p className="mt-2 text-slate-300">
                            Week beginning {formattedWeekBeginning}
                        </p>
                    </div>

                    <div className="space-y-4">
                        {days.map(([dayKey, dayLabel]) => {
                            const isToday = dayLabel === dayOfWeek;

                            return (
                                <div
                                    key={dayKey}
                                    className={`overflow-hidden rounded-2xl border transition-all ${isToday
                                            ? "border-green-400/40 bg-green-500/10"
                                            : "border-white/10 bg-white/5"
                                        }`}
                                >
                                    <div
                                        className={`flex items-center justify-between px-6 py-4 ${isToday
                                                ? "bg-green-500/20"
                                                : "bg-slate-800/50"
                                            }`}
                                    >
                                        <h2
                                            className={`text-lg font-semibold ${isToday ? "text-green-300" : "text-white"
                                                }`}
                                        >
                                            {dayLabel}
                                        </h2>

                                        {isToday && (
                                            <span className="rounded-full bg-green-500 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
                                                Today
                                            </span>
                                        )}
                                    </div>

                                    <div>
                                        {Object.entries(schedule[dayKey]).map(
                                            ([name, clusters], index) => (
                                                <div
                                                    key={name}
                                                    className={`grid gap-4 px-6 py-4 md:grid-cols-[200px_1fr] ${index !==
                                                            Object.entries(schedule[dayKey]).length - 1
                                                            ? "border-b border-white/10"
                                                            : ""
                                                        }`}
                                                >
                                                    <div className="font-semibold text-white">
                                                        {name}
                                                    </div>

                                                    <div className="flex flex-wrap gap-2">
                                                        {clusters.map((cluster) => (
                                                            <span
                                                                key={cluster}
                                                                className={`rounded-full px-3 py-1 text-sm font-medium ${isToday
                                                                        ? "bg-green-500/20 text-green-200"
                                                                        : "bg-blue-500/20 text-blue-200"
                                                                    }`}
                                                            >
                                                                {cluster}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </main>
    );
}


