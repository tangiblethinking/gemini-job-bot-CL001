import type { Metadata } from 'next';
import './globals.css';
import { AppContextProvider } from '@/context/AppContext';

export const metadata: Metadata = {
  title: 'GeminiJobBot',
  description: 'AI-powered ATS resume optimizer',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppContextProvider>{children}</AppContextProvider>
      </body>
    </html>
  );
}
