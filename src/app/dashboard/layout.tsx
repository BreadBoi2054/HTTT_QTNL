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
    <div className="hr-workbench flex h-dvh print:h-auto overflow-hidden print:overflow-visible bg-[#f4f6f8] dark:bg-[#0c0e10] print:bg-white text-foreground print:text-black">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden print:overflow-visible min-w-0">
        <Header session={session} />
        <main className="flex-1 overflow-y-auto print:overflow-visible p-5 sm:p-6 lg:p-7 print:p-0">
          {children}
        </main>
      </div>
    </div>
  );
}
