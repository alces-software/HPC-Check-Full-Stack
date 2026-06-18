// app/clusters/[clusterId]/page.tsx

import ClusterSettings from "@/app/components/ClusterSettings";

type Cluster = {
  id: string;
  name: string;
  // add the rest of your cluster fields here
};

type ClusterPageProps = {
  params: Promise<{
    clusterId: string;
  }>;
};

export default async function ClusterPage({ params }: ClusterPageProps) {
  const resolvedParams = await params;
  const clusterId = resolvedParams.clusterId;

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/hpc`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch clusters");
  }

  const data = await res.json();

  const clusters: Cluster[] = data.body ?? [];

  const cluster = clusters.find((cluster) => cluster.id === clusterId);

  if (!cluster) {
    throw new Error(`No cluster exists with ID: ${clusterId}`);
  }

  return (
    <ClusterSettings
      cluster={cluster}
      clusterId={clusterId}
    />
  );
}