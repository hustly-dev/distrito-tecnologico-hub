import { redirect } from "next/navigation";
import { ProfilePage } from "@/features/profile/ProfilePage";
import { getHubData } from "@/lib/data/hubRepository";
import { getAuthenticatedUser } from "@/lib/auth/session";

export default async function Page() {
  const user = await getAuthenticatedUser();
  if (!user) {
    redirect("/login");
  }

  const hubData = await getHubData();
  return <ProfilePage agencias={hubData.agencias} />;
}
