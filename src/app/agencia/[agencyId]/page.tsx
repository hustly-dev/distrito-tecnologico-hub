import { AgencyPage } from "@/features/agencia/AgencyPage";

interface AgencyRouteProps {
  params: {
    agencyId: string;
  };
}

export default function Page({ params }: AgencyRouteProps) {
  return <AgencyPage agencyId={params.agencyId} />;
}
