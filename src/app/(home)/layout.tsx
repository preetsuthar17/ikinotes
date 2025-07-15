import type { Metadata } from "next";
import { Cascadia_Code } from "next/font/google";
import "../globals.css";

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
      <body className={` ${cascadiaMono.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
