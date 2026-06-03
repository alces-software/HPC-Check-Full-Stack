import { Suspense } from "react";
import Report from "../components/Report";

export default function ReportPage() {
   return (
      <main>
         <Suspense fallback={<p>Loading report...</p>}>
            <Report />
         </Suspense>
      </main>
   );
}