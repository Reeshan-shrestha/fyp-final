import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Navbar from './components/Navbar';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ChainBazzar - Decentralized E-commerce Platform',
  description: 'A Web3-enabled e-commerce platform with blockchain features',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-grow container mx-auto px-4 py-8">
            {children}
          </main>
          <footer className="bg-gray-100 py-6">
            <div className="container mx-auto px-4 text-center text-gray-600">
              <p>© 2024 ChainBazzar. All rights reserved.</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
} 