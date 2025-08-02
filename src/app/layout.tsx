import type { Metadata } from 'next';

import './globals.css';

import { ClerkProvider } from '@clerk/nextjs';
import { Space_Grotesk } from 'next/font/google';

const space_grotesk = Space_Grotesk({
  variable: '--font-space-grotesk',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'beautiful open-source note taking application — Iki',
  description: 'beautiful open-source notes',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <script defer src="https://assets.onedollarstats.com/stonks.js" />
        </head>
        <body className={`${space_grotesk.className} font-sans antialiased`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
