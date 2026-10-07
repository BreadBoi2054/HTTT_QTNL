import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

const sans = Plus_Jakarta_Sans({ 
  subsets: ["latin", "vietnamese"], 
  variable: "--font-sans",
  display: "swap" 
});

const mono = JetBrains_Mono({
  subsets: ["latin", "vietnamese"],
  variable: "--font-mono",
  display: "swap"
});

export const metadata: Metadata = {
  title: "Hệ Thống Thông Tin Quản Trị Nguồn Nhân Lực (HRMIS)",
  description: "Hệ thống Quản trị Nguồn nhân lực & Tiền lương Doanh nghiệp theo Bộ Luật Lao Động 2019",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={`${sans.variable} ${mono.variable} font-sans antialiased bg-[#FAFAF9] dark:bg-[#09090B] text-zinc-900 dark:text-zinc-100 transition-colors selection:bg-blue-600 selection:text-white`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
