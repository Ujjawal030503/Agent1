import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Social Content Generator',
  description: 'AI-powered social media content generation platform',
  keywords: 'social media, content generation, ai, marketing',
  authors: [{ name: 'Social Content Team' }],
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex min-h-screen flex-col">
          <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center">
              <div className="mr-4 hidden md:flex">
                <a className="mr-6 flex items-center space-x-2" href="/">
                  <span className="hidden font-bold sm:inline-block">
                    Social Content Generator
                  </span>
                </a>
                <nav className="flex items-center space-x-6 text-sm font-medium">
                  <a href="/dashboard">Dashboard</a>
                  <a href="/content">Content</a>
                  <a href="/analytics">Analytics</a>
                  <a href="/settings">Settings</a>
                </nav>
              </div>
            </div>
          </header>
          <main className="flex-1">{children}</main>
          <footer className="border-t py-6 md:py-0">
            <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
              <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
                © 2024 Social Content Generator. All rights reserved.
              </p>
              <div className="flex items-center space-x-4 text-sm">
                <a href="/privacy">Privacy</a>
                <a href="/terms">Terms</a>
                <a href="/api">API</a>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}