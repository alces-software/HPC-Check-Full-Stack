'use client';

import { FaMicrochip } from 'react-icons/fa6';

export default function Loading() {
   return (
      <main className="flex items-center h-screen pb-30 justify-center">
         <div className="flex flex-col items-center justify-center text-center">
            <FaMicrochip className="h-25 w-25 text-slate-500 animate-spin-quarter-pause" />
            <p className="p-2 text-lg text-slate-500">Loading ...</p>
         </div>
      </main>
   );
}
