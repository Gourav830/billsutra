import { getServerSession } from "next-auth";
import { authOptions, CustomSession } from "../api/auth/[...nextauth]/options";
import DashNavbar from "@/components/dashboard/DashNav";

const SettingsPage = async () => {
  const session: CustomSession | null = await getServerSession(authOptions);
  const name = session?.user?.name || "Guest";

  return (
    <div className="min-h-screen bg-[#f6f1ea] text-[#1f1b16]">
      <DashNavbar name={name} image={session?.user?.image || undefined} />
      <main className="mx-auto w-full max-w-4xl px-6 py-10">
        <header>
          <p className="text-xs uppercase tracking-[0.2em] text-[#8a6d56]">
            Settings
          </p>
          <h1 className="mt-2 text-3xl font-semibold">Account settings</h1>
        </header>
        <section className="mt-6 rounded-3xl border border-[#eadfd3] bg-white p-6">
          <h2 className="text-sm font-semibold">Invoice preferences</h2>
          <p className="mt-2 text-sm text-[#5c4b3b]">
            Manage invoice defaults and branding preferences from the business
            profile and templates pages.
          </p>
        </section>
      </main>
    </div>
  );
};

export default SettingsPage;
