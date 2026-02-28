import { EditalPage } from "@/features/edital/EditalPage";

interface EditalRouteProps {
  params: {
    id: string;
  };
}

export default function Page({ params }: EditalRouteProps) {
  return <EditalPage editalId={params.id} />;
}
