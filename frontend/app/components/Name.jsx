'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from '@headlessui/react';
import { FaUser } from 'react-icons/fa';
import { IoIosArrowForward } from 'react-icons/io';

export default function Name() {
   const [people, setPeople] = useState([]);
   const [selectedId, setSelectedId] = useState('');
   const [teams, setTeams] = useState([]);
   const router = useRouter();

   const [selectedTeamId, setSelectedTeamId] = useState('');
   const [peopleInTeam, setPeopleInTeam] = useState([]);

   const colours = [
      'from-blue-300 via-blue-500 to-blue-900',
      'from-emerald-300 via-emerald-500 to-emerald-900',
      'from-purple-300 via-purple-500 to-purple-900',
      'from-pink-300 via-pink-500 to-pink-900',
      'from-amber-300 via-amber-500 to-amber-900'
   ];

   useEffect(() => {
      async function getName() {
         const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/people`);
         const data = await res.json();
         setPeople(data.body);
      }
      getName();
   }, []);

   useEffect(() => {
      async function getTeams() {
         const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/teams`);
         const data = await res.json();
         setTeams(data.body);
      }
      getTeams();
   }, []);

   const handleTeamSelect = (e) => {
      e.preventDefault();

      const teamId = e.currentTarget.value;
      const matches = people.filter((p) => p.teamId === teamId);

      setSelectedTeamId(teamId);
      setPeopleInTeam(matches);

      console.log(matches);
   };

   const handleBackToTeams = () => {
      setSelectedTeamId('');
      setPeopleInTeam([]);
   };

   const handleSubmit = (e) => {
      e.preventDefault();
      const personId = e.currentTarget.value;

      Cookies.set('selectedPersonId', personId);
      router.push('/personalSchedule');
   };

   return (
      <main className="flex justify-center space-y-8">
         <div className="relative z-10 w-full max-w-6xl">
            <div className="p-10">
               {/* Header */}

               {/* <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                     <label
                        htmlFor="person"
                        className="mb-2 block text-sm font-medium text-slate-200"
                     >
                        Person
                     </label>

                     <Listbox value={selectedId} onChange={setSelectedId}>
                        <div className="relative">
                           <ListboxButton className="w-full cursor-pointer rounded-xl border border-slate-600 bg-slate-800/80 px-4 py-3 text-left text-white backdrop-blur-md outline-none transition hover:border-white/20 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30">
                              {people.find((p) => p.id === selectedId)?.name ||
                                 'Select a person...'}

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
                     className="flex w-full cursor-pointer items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-3 font-semibold text-white shadow-lg transition hover:scale-[1.02] hover:from-blue-600 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                     <div className="flex items-center gap-1">
                        Continue
                        <IoIosArrowForward aria-hidden="true" />
                     </div>
                  </button>
               </form> */}

               {!selectedTeamId ? (
                  <div key="select-team" className="animate-fade-up">
                     <div className="text-center">
                        <h1 className="text-4xl sm:text-5xl font-bold text-white">
                           Select your team.
                        </h1>

                        <p className="mt-3 text-lg text-slate-300">Select your team to continue.</p>
                     </div>

                     <div className="flex flex-wrap justify-center mt-14 gap-6">
                        {teams.map((t) => {
                           const colour = colours[Math.floor(Math.random() * colours.length)];

                           return (
                              <button
                                 key={t.id}
                                 type="button"
                                 className="group cursor-pointer flex flex-col items-center gap-3"
                                 onClick={handleTeamSelect}
                                 value={t.id}
                              >
                                 <span
                                    className={`flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br ${colour} text-3xl font-bold text-white shadow-xl`}
                                 >
                                    {t.name?.charAt(0)}
                                 </span>

                                 <span className="text-sm font-semibold text-slate-200">
                                    {t.name}
                                 </span>
                              </button>
                           );
                        })}
                     </div>
                  </div>
               ) : (
                  <div key="select-name" className="relative min-h-[420px] animate-fade-up pb-16">
                     <div className="text-center">
                        <h1 className="text-4xl sm:text-5xl font-bold text-white">
                           Select your name.
                        </h1>

                        <p className="mt-3 text-lg text-slate-300">Select your name to continue.</p>
                     </div>

                     <div className="flex flex-wrap justify-center mt-14 gap-6">
                        {peopleInTeam.map((p) => {
                           const colour = colours[Math.floor(Math.random() * colours.length)];

                           return (
                              <button
                                 key={p.id}
                                 type="button"
                                 className="group cursor-pointer flex flex-col items-center gap-3"
                                 onClick={handleSubmit}
                                 value={p.id}
                              >
                                 <span
                                    className={`flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br ${colour} text-3xl font-bold text-white shadow-xl`}
                                 >
                                    {p.name?.charAt(0)}
                                 </span>

                                 <span className="text-sm font-semibold text-slate-200">
                                    {p.name}
                                 </span>
                              </button>
                           );
                        })}
                     </div>
                     <button
                        type="button"
                        onClick={handleBackToTeams}
                        className="absolute cursor-pointer flex items-center gap-1 bottom-0 left-25 rounded-3xl border border-white/10 bg-white/10 px-2 py-2 text-sm font-semibold text-slate-200 shadow-2xl backdrop-blur-xl transition hover:bg-white/20"
                     >
                        <IoIosArrowForward className="rotate-180"></IoIosArrowForward>
                        Back
                     </button>
                  </div>
               )}
            </div>
         </div>
      </main>
   );
}
