export default function ReportSkeleton() {
   return (
      <main className="flex min-h-screen items-center justify-center">
         <div className="relative z-10 w-full max-w-5xl">
            <div className="rounded-3xl border border-white/10 bg-white/10 p-10 shadow-2xl backdrop-blur-xl">
               <div className="animate-pulse space-y-8">

                  <div className="flex justify-center">
                     <div className="h-20 w-20 rounded-full bg-white/10" />
                  </div>

                  <div className="space-y-3 text-center">
                     <div className="mx-auto h-12 w-72 rounded bg-white/10" />
                     <div className="mx-auto h-5 w-96 rounded bg-white/5" />
                     <div className="mx-auto h-4 w-40 rounded bg-white/5" />
                  </div>

                  <div className="rounded-2xl border border-blue-400/20 bg-blue-500/10 p-6">
                     <div className="flex justify-between">
                        <div className="space-y-3">
                           <div className="h-8 w-40 rounded bg-white/10" />
                           <div className="h-4 w-64 rounded bg-white/5" />
                        </div>

                        <div className="h-12 w-32 rounded-xl bg-white/10" />
                     </div>

                     <div className="mt-8 grid gap-4 sm:grid-cols-2">
                        {[1, 2, 3, 4].map(i => (
                           <div
                              key={i}
                              className="h-32 rounded-2xl border border-white/10 bg-white/5"
                           />
                        ))}
                     </div>
                  </div>

               </div>
            </div>
         </div>
      </main>
   );
}