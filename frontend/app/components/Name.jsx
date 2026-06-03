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
        <main className="min-h-screen bg-slate-100 p-8">
        <div className="mx-auto max-w-4xl rounded-xl bg-white p-6 shadow">
            <h1 className="mb-6 text-2xl font-bold text-black">
                Who are you?
            </h1>

            <form
            onSubmit={handleSubmit}
            className="rounded-lg border border-slate-500 bg-gray-300 p-6"
            >
            <div className="mb-6">
                <label
                htmlFor="person"
                className="mb-2 block font-semibold text-black"
                >
                Person
                </label>

                <select
                id="person"
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="w-full rounded border border-slate-400 bg-white px-3 py-2 text-black"
                >
                <option value="">Select a person...</option>

                {people.map((person) => (
                    <option key={person.id} value={person.id}>
                    {person.name}
                    </option>
                ))}
                </select>
            </div>

            <button
                type="submit"
                disabled={!selectedId}
                className="rounded bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
                Submit
            </button>
            </form>
        </div>
        </main>
    );
}