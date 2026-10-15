import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex h-dvh print:h-auto overflow-hidden print:overflow-visible bg-zinc-50 dark:bg-zinc-950 print:bg-white text-zinc-900 dark:text-zinc-100 print:text-black transition-colors duration-200">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden print:overflow-visible min-w-0">
        <Header session={session} />
        <main className="flex-1 overflow-y-auto print:overflow-visible p-4 sm:p-6 lg:p-8 print:p-0">
          {children}
        </main>
      </div>
    </div>
  );
}