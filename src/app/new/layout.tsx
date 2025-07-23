import type { Metadata } from "next";
import "../globals.css";
import { Suspense } from "react";
import { Loader } from "@/components/ui/loader";

import { Geist } from "next/font/google";
const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "beautiful open-source note taking application — Iki",
  description: "beautiful open-source notes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          defer
          src="https://assets.onedollarstats.com/stonks.js"
        ></script>
      </head>
      <body className={`${geist.className} antialiased font-sans`}>
        <Suspense
          fallback={
            <div className="h-screen w-screen flex items-center justify-center">
              <Loader />
            </div>
          }
        >
          {children}
        </Suspense>
      </body>
    </html>
  );
}
