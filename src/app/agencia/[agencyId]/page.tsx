import { AgencyPage } from "@/features/agencia/AgencyPage";

interface AgencyRouteProps {
  params: Promise<{
    agencyId: string;
  }>;
}

export default async function Page({ params }: AgencyRouteProps) {
  const resolvedParams = await params;
  return <AgencyPage agencyId={resolvedParams.agencyId} />;
}
