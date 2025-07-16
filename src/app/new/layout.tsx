import type { Metadata } from "next";
import { Cascadia_Code } from "next/font/google";
import "../globals.css";
import { Suspense } from "react";
import { Loader } from "@/components/ui/loader";

const cascadiaCode = Cascadia_Code({
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
      <body className={` ${cascadiaCode.className} antialiased`}>
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
