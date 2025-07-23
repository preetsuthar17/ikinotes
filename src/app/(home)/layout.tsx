import type { Metadata } from "next";
import "../globals.css";

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
        {children}
      </body>
    </html>
  );
}
