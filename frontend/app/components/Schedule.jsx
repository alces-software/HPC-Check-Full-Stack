"use client";

import { useEffect, useState } from "react";

export default function Schedule() {
  const weekBeginning = "01/06/2026";

//   const schedule = {
//     "mon":{
//         "Calum": ["Cognition", "Mars"],
//         "Oscar": ["Apollo", "Minerva"]
//     },
//     "tue":{
//         "Oscar": ["Athena", "Artemis"],
//         "Alex": ["Jupiter", "Ares"]
//     },
//     "wed":{
//         "Oscar": ["Eros", "Prometheus"],
//         "Alex": ["Perseus", "Heracles"]
//     },
//     "thu":{
//         "Alex": ["Neptune", "Poseidon"],
//         "Oscar": ["Pluto", "Hades"]
//     },
//     "fri":{
//         "Calum": ["Persephone", "Demeter"],
//         "Oscar": ["Mercury", "Hermes"]
//     }
// }

const [schedule, setSchedule] = useState(null);

useEffect(() => {
  async function getRota() {
    try {
      console.log(process.env.API_URL)
      const res = await fetch(`${process.env.API_URL}/rota`);
      const data = await res.json();

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
  return <p>Loading...</p>;
}

const days = [
  ["mon", "Monday"],
  ["tue", "Tuesday"],
  ["wed", "Wednesday"],
  ["thu", "Thursday"],
  ["fri", "Friday"],
];

  return (
   <main className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-4xl rounded-xl bg-white p-6 shadow">
        <h1 className="mb-6 text-2xl font-bold">Weekly Schedule</h1>

        <div className="overflow-hidden rounded-lg border border-slate-300">
          {days.map(([dayKey, dayLabel]) => (
            <div
              key={dayKey}
              className="grid grid-cols-[150px_1fr] border-b border-slate-300 last:border-b-0"
            >
              <div className="flex items-center bg-[blue] px-4 py-4 font-semibold text-white">
                {dayLabel}
              </div>

              <div>
                {/* Turns object into array to allow loop */}
                {Object.entries(schedule[dayKey]).map(
                  ([name, clusters], index) => (
                    <div
                      key={name}
                      className={`grid grid-cols-[180px_1fr] px-4 py-3 ${
                        index !==
                        Object.entries(schedule[dayKey]).length - 1
                          ? "border-b border-slate-200"
                          : ""
                      }`}
                    >
                      <div className="font-medium">{name}</div>

                      <div className="flex flex-wrap gap-2">
                        {clusters.map((cluster) => (
                          <span
                            key={cluster}
                            className="rounded bg-blue-100 px-2 py-1 text-sm text-blue-800"
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
          ))}
        </div>
      </div>
    </main>


  );
}


