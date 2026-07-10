import PoolClustersPage from '../components/PoolSettingsPage';
import { Suspense } from 'react';
import Loading from '../components/Loading';
export const metadata = {
   title: 'Pool Options'
};

export default function Page() {
   return (
      <Suspense fallback={<Loading />}>
         <PoolClustersPage />
      </Suspense>
   );
}
