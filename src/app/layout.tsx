import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono, Noto_Serif } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { ToastProvider } from "@/components/providers/ToastProvider";

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

const editorial = Noto_Serif({
  subsets: ["latin", "vietnamese"],
  variable: "--font-editorial",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Hệ Thống Thông Tin Quản Trị Nguồn Nhân Lực (HRMIS)",
  description: "Hệ thống Quản trị Nguồn nhân lực & Tiền lương Doanh nghiệp theo Bộ Luật Lao Động 2019",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
} >) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={`${sans.variable} ${mono.variable} ${editorial.variable} font-sans antialiased bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 selection:bg-blue-600 selection:text-white`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
