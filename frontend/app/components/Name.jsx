"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Cookies from "js-cookie"


export default function Name() {
    const [people, setPeople] = useState([]);
    const [selectedId, setSelectedId] = useState("");
    const [mounted, setMounted] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
    }, []);


    useEffect(() => {
        async function getName() {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/people`
            );
            const data = await res.json();

            setPeople(data.body);
        }

        getName();
    }, []);

    if (!mounted) {
        return null;
    }

    const handleSubmit = (e) => {
        e.preventDefault();

        Cookies.set("selectedPersonId", selectedId);

        console.log("Saved:", selectedId);

        router.push("/personalSchedule");
    };

    return (
        <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 p-6">
            <div className="w-full max-w-md">
                <div className="rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur-xl">
                    <div className="mb-8 text-center">
                        <h1 className="text-4xl font-bold text-white">
                            Welcome 👋
                        </h1>
                        <p className="mt-2 text-slate-300">
                            Select your name to continue
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label
                                htmlFor="person"
                                className="mb-2 block text-sm font-medium text-slate-200"
                            >
                                Person
                            </label>

                            <select
                                id="person"
                                value={selectedId}
                                onChange={(e) => setSelectedId(e.target.value)}
                                className="w-full rounded-xl border border-slate-600 bg-slate-800/80 px-4 py-3 text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                            >
                                <option value="" className="text-slate-500">
                                    Select a person...
                                </option>

                                {people.map((person) => (
                                    <option
                                        key={person.id}
                                        value={person.id}
                                        className="bg-slate-800"
                                    >
                                        {person.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <button
                            type="submit"
                            disabled={!selectedId}
                            className="w-full cursor-pointer rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-3 font-semibold text-white shadow-lg transition hover:scale-[1.02] hover:from-blue-600 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Continue →
                        </button>
                    </form>
                </div>
            </div>
        </main>
    );
}