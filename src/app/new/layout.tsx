import type { Metadata } from "next";
import { Cascadia_Code } from "next/font/google";
import "../globals.css";
import { Suspense } from "react";

const cascadiaMono = Cascadia_Code({
  variable: "--font-cascadia-mono",
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
      <body className={` ${cascadiaMono.className} antialiased`}>
        <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
      </body>
    </html>
  );
}
