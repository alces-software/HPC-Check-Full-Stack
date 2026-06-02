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
<<<<<<< HEAD
      const res = await fetch("http://localhost:3001/rota");
=======
      const res = await fetch(`${process.env.API_URL}/rota`);
>>>>>>> working
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
        <h1 className="mb-6 text-2xl font-bold">{`Weekly Schedule for ${formattedWeekBeginning}.`}</h1>

        <div className="overflow-hidden rounded-lg border bg-gray-300 border-slate-500">
          {days.map(([dayKey, dayLabel]) => (
            <div
              key={dayKey}
              className="grid grid-cols-[150px_1fr] border-b border-slate-400 last:border-b-0"
            >
              <div className={`flex items-center bg-[grey] px-4 py-0 font-semibold text-white ${dayLabel === dayOfWeek ? "bg-green-600" : "bg-[gray]"}`}>
                {dayLabel}
              </div>

              <div>
                {/* Turns object into array to allow loop */}
                {Object.entries(schedule[dayKey]).map(
                  ([name, clusters], index) => (
                    <div
                      key={name}
                      className={`grid grid-cols-[180px_1fr]  px-4 py-3 text-black ${
                        index !==
                        Object.entries(schedule[dayKey]).length - 1
                          ? "border-b border-slate-400"
                          : ""
                      } ${dayLabel === dayOfWeek ? "bg-green-100" : ""} `}
                    >
                      <div className="font-medium">{name}</div>

                      <div className="flex flex-wrap gap-2">
                        {clusters.map((cluster) => (
                          <span
                            key={cluster}
                            className={`rounded ${dayLabel === dayOfWeek ? "bg-green-300 text-green-900 font-semibold" : "bg-blue-100 text-blue-800"} px-2 py-1 text-sm `}
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


