
"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function Header() {
  const [allClusters, setAllClusters] = useState([]);
  const pathname = usePathname();
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    async function getAllClusters() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/hpc`);
        const data = await res.json();

        setAllClusters(data.body ?? []);
      } catch (err) {
        console.error(err);
        setAllClusters([]);
      }
    }

    getAllClusters();
  }, []);

    const loadTeams = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/teams`)
      const data = await res.json()

      setTeams(data.body ?? []);
    } catch (err) {
      console.error("Failed to fetch teams:", err);
      setTeams([])
    }
  };

  useEffect(() =>{
    loadTeams()
  })

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/schedule", label: "Schedule" },
    { href: "/name", label: "Submit Report" },
    { href: "/results", label: "Results" },
    { href: "/options", label: "Administration" },
  ];

  const isClustersActive = pathname.startsWith("/clusters");

  return (
    <header className="sticky top-0 z-50">
      <div className="w-full px-4 sm:px-6">
        <div className="mt-3 flex items-center justify-between rounded-2xl border border-white/10 bg-white/10 px-4 py-3 shadow-xl backdrop-blur-xl">
          <Link href="/" className="transition-opacity hover:opacity-90">
            <Image
              src="/images/alces_logo.png"
              alt="Alces Logo"
              width={120}
              height={40}
              priority
              className="h-8 w-auto sm:h-10"
            />
          </Link>

          <nav className="flex items-center gap-5">
            {navItems.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    "text-md font-medium transition",
                    isActive
                      ? "text-blue-300"
                      : "text-slate-200 hover:text-blue-300",
                  ].join(" ")}
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
                  "flex cursor-pointer items-center gap-1 text-md font-medium transition",
                  isClustersActive
                    ? "text-blue-300"
                    : "text-slate-200 hover:text-blue-300",
                ].join(" ")}
              >
                Clusters
                <span className="text-xs transition group-hover:rotate-180">
                  ▼
                </span>
              </button>

              <div className="pointer-events-none invisible absolute right-0 top-full z-50 w-72 translate-y-2 pt-3 opacity-0 transition-all duration-200 group-hover:pointer-events-auto group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                <div className="max-h-80 overflow-y-auto rounded-2xl border border-white/10 bg-slate-900/95 p-2 shadow-2xl backdrop-blur-xl">
                  {allClusters.length === 0 ? (
                    <p className="px-4 py-3 text-md text-slate-400">
                      No clusters found
                    </p>
                  ) : (
                    allClusters.map((cluster) => {
                      const clusterId = cluster.id || cluster._id;
                      const isClusterItemActive =
                        pathname === `/clusters/${clusterId}`;

                      return (
                        <Link
                          key={clusterId}
                          href={`/clusters/${clusterId}`}
                          className={[
                            "block rounded-xl px-4 py-3 text-md transition",
                            isClusterItemActive
                              ? "bg-blue-500/20 text-blue-200"
                              : "text-slate-200 hover:bg-blue-500/20 hover:text-white",
                          ].join(" ")}
                        >
                          <span className="block font-medium">
                            {cluster.name}
                          </span>
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
                  "flex cursor-pointer items-center gap-1 text-md font-medium transition",
                  isClustersActive
                    ? "text-blue-300"
                    : "text-slate-200 hover:text-blue-300",
                ].join(" ")}
              >
                Teams
                <span className="text-xs transition group-hover:rotate-180">
                  ▼
                </span>
              </button>

              <div className="pointer-events-none invisible absolute right-0 top-full z-50 w-72 translate-y-2 pt-3 opacity-0 transition-all duration-200 group-hover:pointer-events-auto group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                <div className="max-h-80 overflow-y-auto rounded-2xl border border-white/10 bg-slate-900/95 p-2 shadow-2xl backdrop-blur-xl">
                  {teams.length === 0 ? (
                    <p className="px-4 py-3 text-md text-slate-400">
                      No teams found
                    </p>
                  ) : (
                    teams.map((team) => {
                      const teamId = team.id || team._id;
                      const isClusterItemActive =
                        pathname === `/teams/${teamId}`;

                      return (
                        <Link
                          key={teamId}
                          href={`/teams/${teamId}`}
                          className={[
                            "block rounded-xl px-4 py-3 text-md transition",
                            isClusterItemActive
                              ? "bg-blue-500/20 text-blue-200"
                              : "text-slate-200 hover:bg-blue-500/20 hover:text-white",
                          ].join(" ")}
                        >
                          <span className="block font-medium">
                            {team.name}
                          </span>
                        </Link>
                      );
                    })
                  )}
                </div>
              </div>
            </div>









          </nav>
        </div>
      </div>
    </header>
  );
}