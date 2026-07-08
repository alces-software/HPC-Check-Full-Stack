import PoolClustersPage from '../components/PoolSettingsPage';
import { Suspense } from 'react';
import ReportSkeleton from '../components/PoolSkeleton'

export const metadata = {
    title: 'Report',
};

export default function Page () {
    return (
        <Suspense fallback={<ReportSkeleton />}>
            <PoolClustersPage />
        </Suspense>
    );
}

