import { getServerSession } from "next-auth";
import { authOptions, CustomSession } from "../api/auth/[...nextauth]/options";
import DashboardClient from "@/components/dashboard/dashboard-client";

const Page = async () => {
  const session: CustomSession | null = await getServerSession(authOptions);
  const name = session?.user?.name || "Guest";

  return (
    <DashboardClient name={name} image={session?.user?.image || undefined} />
  );
};

export default Page;
