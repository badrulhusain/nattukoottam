import './global.css';
import { Plus_Jakarta_Sans } from 'next/font/google';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
  weight: ['400', '500', '600', '700', '800'],
});

export const metadata = {
  title: 'Naatukoottam (നാട്ടുകൂട്ടം) – Kerala Community Social & Civic Pulse',
  description: 'Hyperlocal community social platform and interdepartmental civic coordination for Kerala.',
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={plusJakartaSans.variable}>
      <body className="antialiased selection:bg-[#16A34A] selection:text-white min-h-screen bg-[#F8FAF8] text-[#17231D]">
        {children}
      </body>
    </html>
  );
}
