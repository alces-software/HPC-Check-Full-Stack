import { Suspense } from "react";
import Report from "../components/Report";

export const metadata = {
   title: "Report"
};

export default function ReportPage() {

   return (
      <main>
         <Suspense fallback={<p>Loading report...</p>}>
            <Report />
         </Suspense>
      </main>
   );
}