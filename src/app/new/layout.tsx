import type { Metadata } from "next";
import "../globals.css";
import { Suspense } from "react";

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
      <body className={`antialiased`}>
        <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
      </body>
    </html>
  );
}
