import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Header from './components/Header';
import type { Metadata } from 'next';

const geistSans = Geist({
   variable: '--font-geist-sans',
   subsets: ['latin']
});

const geistMono = Geist_Mono({
   variable: '--font-geist-mono',
   subsets: ['latin']
});

export const metadata: Metadata = {
   icons: {
      icon: [{ url: '/favicon.ico' }, { url: '/images/alces_logo.png', type: 'image/png' }],
      shortcut: '/favicon.ico',
      apple: '/images/alces_logo.png'
   }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
   return (
      <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
         <body className="h-full text-white flex flex-col">
            <div className="fixed inset-0 -z-10 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900" />

            <Header />

            <main className="flex-1 flex justify-center px-4 sm:px-6 py-10">
               <div className="w-full max-w-6xl">{children}</div>
            </main>
         </body>
      </html>
   );
}
