import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "../globals.css";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ikinotes",
  description: "beautiful open-source notes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={` ${jetbrainsMono.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
