import ClusterSettings from '@/app/components/ClusterSettings';
import { Suspense } from 'react';

export const metadata = {
   title: 'Cluster Options',
};

export default async function ClusterPage() {
   return (
      <main>
         <Suspense>
            <ClusterSettings />
         </Suspense>
      </main>
   );
}
