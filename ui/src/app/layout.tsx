import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Midnight Confidential Procurement & Tender Platform',
  description: 'Level 3 Sealed-Bid Procurement & Auction Platform on Midnight Network with Zero-Knowledge Bid Sealing and Outcome Verification.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-col bg-[#070B14] text-slate-100">
        {children}
      </body>
    </html>
  );
}
