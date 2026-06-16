"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Cookies from "js-cookie"
import {
    Listbox,
    ListboxButton,
    ListboxOptions,
    ListboxOption,
} from "@headlessui/react";


export default function Name() {
    const [people, setPeople] = useState([]);
    const [selectedId, setSelectedId] = useState("");
    const [mounted, setMounted] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
    }, []);

    console.log(router);

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
        router.push("/personalSchedule");
    };

    return (
        <main className="flex justify-center space-y-8">
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

                            <Listbox value={selectedId} onChange={setSelectedId}>
                                <div className="relative">

                                    <ListboxButton
                                        className="w-full cursor-pointer rounded-xl border border-slate-600 bg-slate-800/80 px-4 py-3 text-left text-white backdrop-blur-md outline-none transition hover:border-white/20 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                                    >
                                        {people.find((p) => p.id === selectedId)?.name || "Select a person..."}

                                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                                            ▼
                                        </span>
                                    </ListboxButton>

                                    <ListboxOptions className="absolute z-50 mt-2 max-h-60 w-full overflow-auto rounded-xl border border-white/10 bg-slate-900/95 backdrop-blur-xl shadow-2xl">

                                        {people.map((person) => (
                                            <ListboxOption
                                                key={person.id}
                                                value={person.id}
                                                className="cursor-pointer px-4 py-3 text-white transition data-[active]:bg-blue-500/20 data-[selected]:font-semibold"
                                            >
                                                {person.name}
                                            </ListboxOption>
                                        ))}

                                    </ListboxOptions>

                                </div>
                            </Listbox>
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