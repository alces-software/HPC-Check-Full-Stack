import Report from "../components/Report";
import { Suspense } from "react";

export const metadata = {
   title: "Report"
};

export default function Page() {
   return (
      <Suspense fallback={<ReportSkeleton />}>
         <Report />
      </Suspense>
   );
}

function ReportSkeleton() {
   return (
      <main className="flex justify-center py-10">
         <div className="w-full max-w-6xl">
            <div className="rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur-xl">
               <div className="animate-pulse space-y-6">
                  <div className="h-10 w-72 rounded bg-white/10" />
                  <div className="h-5 w-96 rounded bg-white/5" />
                  <div className="h-12 rounded bg-white/5" />
               </div>
            </div>
         </div>
      </main>
   );
}