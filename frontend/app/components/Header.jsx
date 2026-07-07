'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { IoChevronDown, IoClose, IoMenu } from 'react-icons/io5';

export default function Header() {
   const [allClusters, setAllClusters] = useState([]);
   const [teams, setTeams] = useState([]);
   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
   const [mobileClustersOpen, setMobileClustersOpen] = useState(false);
   const [mobileTeamsOpen, setMobileTeamsOpen] = useState(false);
   const pathname = usePathname();

   const loadClusters = useCallback(async () => {
      try {
         const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/hpc`, {
            cache: 'no-store',
         });

         const data = await res.json();

         setAllClusters(data.body ?? []);
      } catch (err) {
         console.error('Failed to fetch clusters:', err);
         setAllClusters([]);
      }
   }, []);

   const loadTeams = useCallback(async () => {
      try {
         const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/teams`, {
            cache: 'no-store',
         });

         const data = await res.json();

         setTeams(data.body ?? []);
      } catch (err) {
         console.error('Failed to fetch teams:', err);
         setTeams([]);
      }
   }, []);

   useEffect(() => {
      loadClusters();
      loadTeams();
   }, [loadClusters, loadTeams]);

   useEffect(() => {
      function handleDataUpdated() {
         loadClusters();
         loadTeams();
      }

      window.addEventListener('header-data-updated', handleDataUpdated);

      return () => {
         window.removeEventListener('header-data-updated', handleDataUpdated);
      };
   }, [loadClusters, loadTeams]);

   const navItems = [
      { href: '/', label: 'Home' },
      { href: '/schedule', label: 'Schedule' },
      { href: '/name', label: 'Submit Report' },
      { href: '/results', label: 'Results' },
      { href: '/overview', label: 'Overview' },
      { href: '/options', label: 'Administration' },
   ];

   const isClustersActive = pathname.startsWith('/clusters');
   const isTeamsActive = pathname.startsWith('/teams');

   function closeMobileMenu() {
      setMobileMenuOpen(false);
   }

   return (
      <header className="sticky top-0 z-50">
         <div className="w-full px-4 sm:px-6">
            <div className="mt-3 flex items-center justify-between rounded-2xl border border-white/10 bg-white/10 px-4 py-3 shadow-xl backdrop-blur-xl">
               <Link
                  href="/"
                  className="transition-opacity hover:opacity-90"
                  onClick={closeMobileMenu}
               >
                  <Image
                     src="/images/alces_logo.png"
                     alt="Alces Logo"
                     width={120}
                     height={40}
                     priority
                     className="h-8 w-auto sm:h-10"
                  />
               </Link>

               <button
                  type="button"
                  aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                  aria-expanded={mobileMenuOpen}
                  onClick={() => setMobileMenuOpen((isOpen) => !isOpen)}
                  className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-white/10 bg-white/10 text-2xl text-slate-100 transition hover:border-blue-300/35 hover:bg-blue-500/15 lg:hidden"
               >
                  {mobileMenuOpen ? <IoClose aria-hidden="true" /> : <IoMenu aria-hidden="true" />}
               </button>

               <nav className="hidden items-center gap-5 lg:flex">
                  {navItems.map((item) => {
                     const isActive =
                        item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);

                     return (
                        <Link
                           key={item.href}
                           href={item.href}
                           className={[
                              'text-md font-medium transition',
                              isActive ? 'text-blue-300' : 'text-slate-200 hover:text-blue-300',
                           ].join(' ')}
                        >
                           {item.label}
                        </Link>
                     );
                  })}

                  {/* CLUSTERS DROPDOWN */}
                  <div className="group relative">
                     <button
                        type="button"
                        className={[
                           'flex cursor-pointer items-center gap-1 text-md font-medium transition',
                           isClustersActive
                              ? 'text-blue-300'
                              : 'text-slate-200 hover:text-blue-300',
                        ].join(' ')}
                     >
                        Clusters
                        <span className="text-xs transition group-hover:rotate-180">▼</span>
                     </button>

                     <div className="pointer-events-none invisible absolute right-0 top-full z-50 w-72 translate-y-2 pt-3 opacity-0 transition-all duration-200 group-hover:pointer-events-auto group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                        <div className="max-h-80 overflow-y-auto rounded-2xl border border-white/10 bg-slate-900/95 p-2 shadow-2xl backdrop-blur-xl">
                           {allClusters.length === 0 ? (
                              <p className="px-4 py-3 text-md text-slate-400">No clusters found</p>
                           ) : (
                              allClusters.map((cluster) => {
                                 const clusterId = cluster.id || cluster._id;

                                 const isClusterItemActive =
                                    pathname === `/clusters?id=${clusterId}`;

                                 return (
                                    <Link
                                       key={clusterId}
                                       href={`/clusters?id=${clusterId}`}
                                       className={[
                                          'block rounded-xl px-4 py-3 text-md transition',
                                          isClusterItemActive
                                             ? 'bg-blue-500/20 text-blue-200'
                                             : 'text-slate-200 hover:bg-blue-500/20 hover:text-white',
                                       ].join(' ')}
                                    >
                                       <span className="block font-medium">{cluster.name}</span>
                                    </Link>
                                 );
                              })
                           )}
                        </div>
                     </div>
                  </div>

                  {/* TEAMS DROPDOWN */}
                  <div className="group relative">
                     <button
                        type="button"
                        className={[
                           'flex cursor-pointer items-center gap-1 text-md font-medium transition',
                           isTeamsActive ? 'text-blue-300' : 'text-slate-200 hover:text-blue-300',
                        ].join(' ')}
                     >
                        Teams
                        <span className="text-xs transition group-hover:rotate-180">▼</span>
                     </button>

                     <div className="pointer-events-none invisible absolute right-0 top-full z-50 w-72 translate-y-2 pt-3 opacity-0 transition-all duration-200 group-hover:pointer-events-auto group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                        <div className="max-h-80 overflow-y-auto rounded-2xl border border-white/10 bg-slate-900/95 p-2 shadow-2xl backdrop-blur-xl">
                           {teams.length === 0 ? (
                              <p className="px-4 py-3 text-md text-slate-400">No teams found</p>
                           ) : (
                              teams.map((team) => {
                                 const teamId = team.id || team._id;

                                 const isTeamItemActive = pathname === `/teams?id=${teamId}`;

                                 return (
                                    <Link
                                       key={teamId}
                                       href={`/teams?id=${teamId}`}
                                       className={[
                                          'block rounded-xl px-4 py-3 text-md transition',
                                          isTeamItemActive
                                             ? 'bg-blue-500/20 text-blue-200'
                                             : 'text-slate-200 hover:bg-blue-500/20 hover:text-white',
                                       ].join(' ')}
                                    >
                                       <span className="block font-medium">{team.name}</span>
                                    </Link>
                                 );
                              })
                           )}
                        </div>
                     </div>
                  </div>
               </nav>
            </div>

            {mobileMenuOpen && (
               <div className="mt-3 rounded-2xl border border-white/10 bg-slate-900/95 p-3 shadow-2xl backdrop-blur-xl lg:hidden">
                  <nav className="space-y-1">
                     {navItems.map((item) => {
                        const isActive =
                           item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);

                        return (
                           <Link
                              key={item.href}
                              href={item.href}
                              onClick={closeMobileMenu}
                              className={[
                                 'block rounded-xl px-4 py-3 text-sm font-medium transition',
                                 isActive
                                    ? 'bg-blue-500/20 text-blue-200'
                                    : 'text-slate-200 hover:bg-blue-500/15 hover:text-white',
                              ].join(' ')}
                           >
                              {item.label}
                           </Link>
                        );
                     })}

                     <div className="pt-2">
                        <button
                           type="button"
                           onClick={() => setMobileClustersOpen((isOpen) => !isOpen)}
                           className={[
                              'flex w-full cursor-pointer items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition',
                              isClustersActive
                                 ? 'bg-blue-500/20 text-blue-200'
                                 : 'text-slate-200 hover:bg-blue-500/15 hover:text-white',
                           ].join(' ')}
                        >
                           Clusters
                           <IoChevronDown
                              className={[
                                 'transition',
                                 mobileClustersOpen ? 'rotate-180' : '',
                              ].join(' ')}
                              aria-hidden="true"
                           />
                        </button>

                        {mobileClustersOpen && (
                           <div className="mt-1 max-h-64 space-y-1 overflow-y-auto rounded-xl border border-white/10 bg-white/[0.03] p-2">
                              {allClusters.length === 0 ? (
                                 <p className="px-3 py-2 text-sm text-slate-400">
                                    No clusters found
                                 </p>
                              ) : (
                                 allClusters.map((cluster) => {
                                    const clusterId = cluster.id || cluster._id;

                                    return (
                                       <Link
                                          key={clusterId}
                                          href={`/clusters?id=${clusterId}`}
                                          onClick={closeMobileMenu}
                                          className="block rounded-lg px-3 py-2 text-sm text-slate-200 transition hover:bg-blue-500/15 hover:text-white"
                                       >
                                          {cluster.name}
                                       </Link>
                                    );
                                 })
                              )}
                           </div>
                        )}
                     </div>

                     <div className="pt-2">
                        <button
                           type="button"
                           onClick={() => setMobileTeamsOpen((isOpen) => !isOpen)}
                           className={[
                              'flex w-full cursor-pointer items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition',
                              isTeamsActive
                                 ? 'bg-blue-500/20 text-blue-200'
                                 : 'text-slate-200 hover:bg-blue-500/15 hover:text-white',
                           ].join(' ')}
                        >
                           Teams
                           <IoChevronDown
                              className={['transition', mobileTeamsOpen ? 'rotate-180' : ''].join(
                                 ' ',
                              )}
                              aria-hidden="true"
                           />
                        </button>

                        {mobileTeamsOpen && (
                           <div className="mt-1 max-h-64 space-y-1 overflow-y-auto rounded-xl border border-white/10 bg-white/[0.03] p-2">
                              {teams.length === 0 ? (
                                 <p className="px-3 py-2 text-sm text-slate-400">No teams found</p>
                              ) : (
                                 teams.map((team) => {
                                    const teamId = team.id || team._id;

                                    return (
                                       <Link
                                          key={teamId}
                                          href={`/teams?id=${teamId}`}
                                          onClick={closeMobileMenu}
                                          className="block rounded-lg px-3 py-2 text-sm text-slate-200 transition hover:bg-blue-500/15 hover:text-white"
                                       >
                                          {team.name}
                                       </Link>
                                    );
                                 })
                              )}
                           </div>
                        )}
                     </div>
                  </nav>
               </div>
            )}
         </div>
      </header>
   );
}
