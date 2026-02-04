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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const license = await verifyLicense();
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || '';

  // Allow access to admin validation pages even if license is invalid
  const isAdminPath = pathname.startsWith('/admin');
  const showLockScreen = !license.valid && !isAdminPath;

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-screen flex bg-slate-50`}
      >
        {!showLockScreen && <Sidebar />}
        <main className={`flex-1 p-8 overflow-y-auto w-full ${showLockScreen ? 'flex items-center justify-center' : ''}`}>
          {showLockScreen ? <LicenseLockScreen /> : children}
        </main>
      </body>
    </html>
  );
}
