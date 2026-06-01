import Image from "next/image";


 export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-violet-950 via-black to-cyan-950 text-white">
      <div className="absolute h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" />
      <div className="absolute right-20 top-20 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl" />

      <div className="relative w-full max-w-lg px-6">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-10 backdrop-blur-xl">
          <span className="rounded-full border border-cyan-400/20 px-3 py-1 text-xs text-cyan-300">
            DAILY STATUS
          </span>

          <h1 className="mt-6 text-5xl font-bold tracking-tight">
            HPC Check-In
          </h1>

          <p className="mt-4 text-white/60">
            Coming soon.
          </p>

          
        </div>
      </div>
    </main>
  );
}
