import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Orbit 911",
  description: "Training in motion - 911 Training Tracker",
};

import Sidebar from './components/Sidebar';
import { headers } from 'next/headers';
import { verifyLicense } from '@/lib/license';
import LicenseLockScreen from '@/components/LicenseLockScreen';
import GatekeeperProvider from './components/Gatekeeper';
import GracePeriodBanner from './components/GracePeriodBanner';

import { Analytics } from "@vercel/analytics/next";

export const dynamic = 'force-dynamic';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const license = await verifyLicense();
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || '';

  // Allow access to admin validation pages even if license is invalid
  const isAdminPath = pathname.startsWith('/admin') ||
    pathname.startsWith('/setup') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/superuser') ||
    pathname.startsWith('/community');
  const showLockScreen = !license.valid && !isAdminPath;

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex bg-slate-50`}
      >
        {!showLockScreen && <Sidebar />}
        <main className={`flex-1 p-8 w-full ${showLockScreen ? 'flex items-center justify-center' : ''}`}>
          {showLockScreen ? <LicenseLockScreen /> : (
            <div className="flex flex-col w-full h-full">
              {license.status === "GRACE" && <GracePeriodBanner daysRemaining={license.daysRemaining!} />}
              <GatekeeperProvider>
                {children}
              </GatekeeperProvider>
            </div>
          )}
          <Analytics />
        </main>
      </body>
    </html>
  );
}
