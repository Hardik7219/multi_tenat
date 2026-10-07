import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Home from "./provider";
import { Navbar } from "../shared/ui/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MultiTenant Workspace",
  description: "Manage your tickets and tenants efficiently.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased bg-[#050505]`}
    >
      <body className="min-h-full flex flex-col text-white">
        <Home>
          <Navbar />
          <div className="flex-1 flex flex-col">
            {children}
          </div>
        </Home>
      </body>
    </html>
  );
}
