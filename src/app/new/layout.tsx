import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "beautiful open-source note taking application — Ikinotes",
  description: "beautiful open-source notes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased`}>{children}</body>
    </html>
  );
}
