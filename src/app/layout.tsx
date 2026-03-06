import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";
import { ChatDrawer } from "@/components/chat-drawer";

export const metadata: Metadata = {
  title: "Foresee — AI Financial Autopilot",
  description:
    "Connect your bank accounts and let AI predict your spending, detect hidden subscriptions, and forecast your financial future.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {/* Sidebar */}
        <Sidebar />

        {/* Main content */}
        <main className="ml-[260px] min-h-screen relative z-10">
          <div className="max-w-7xl mx-auto px-6 py-8">{children}</div>
        </main>

        {/* Floating chat drawer */}
        <ChatDrawer />
      </body>
    </html>
  );
}
