import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from 'next/link';
import { Home, Upload, PieChart, Settings } from 'lucide-react';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NutriAI | AI Nutrition Tracker",
  description: "Track your nutritional intake using AI.",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-50 text-slate-900 antialiased`}>
        <div className="flex h-screen overflow-hidden">
          {/* Desktop Sidebar */}
          <aside className="hidden md:flex flex-col w-64 border-r bg-white/50 backdrop-blur-xl">
            <div className="p-6">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-500 to-teal-400 bg-clip-text text-transparent">
                NutriAI
              </h1>
            </div>
            <nav className="flex-1 px-4 space-y-2">
              <NavItem href="/dashboard" icon={<Home size={20} />} label="Dashboard" />
              <NavItem href="/upload" icon={<Upload size={20} />} label="Upload" />
              <NavItem href="/reports" icon={<PieChart size={20} />} label="Reports" />
            </nav>
            <div className="p-4 border-t">
              <NavItem href="/settings" icon={<Settings size={20} />} label="Settings" />
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto pb-16 md:pb-0 relative">
            {children}
          </main>

          {/* Mobile Bottom Navigation */}
          <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t bg-white/80 backdrop-blur-xl flex justify-around p-3 z-50">
            <MobileNavItem href="/dashboard" icon={<Home size={24} />} label="Home" />
            <MobileNavItem href="/upload" icon={<Upload size={24} />} label="Upload" />
            <MobileNavItem href="/reports" icon={<PieChart size={24} />} label="Reports" />
          </nav>
        </div>
      </body>
    </html>
  );
}

function NavItem({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 transition-all font-medium">
      {icon}
      <span>{label}</span>
    </Link>
  );
}

function MobileNavItem({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link href={href} className="flex flex-col items-center gap-1 text-slate-500 hover:text-emerald-600 transition-colors">
      {icon}
      <span className="text-[10px] font-medium">{label}</span>
    </Link>
  );
}
