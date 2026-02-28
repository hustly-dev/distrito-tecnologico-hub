import { EditalPage } from "@/features/edital/EditalPage";

interface EditalRouteProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function Page({ params }: EditalRouteProps) {
  const resolvedParams = await params;
  return <EditalPage editalId={resolvedParams.id} />;
}
