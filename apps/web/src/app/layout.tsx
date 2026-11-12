import './global.css';
import localFont from 'next/font/local';
import { ClerkProvider } from '@clerk/nextjs';
import { AppShell } from '../components/layout/AppShell';

const meera = localFont({
  src: './fonts/meera-regular.ttf',
  variable: '--font-meera',
  display: 'swap',
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
    <ClerkProvider
      publishableKey={
        process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
        'pk_test_YnJpZ2h0LXNjb3JwaW9uLTY1LmNsZXJrLmFjY291bnRzLmRldiQ'
      }
    >
      <html lang="ml" className={meera.variable}>
        <body className="antialiased selection:bg-[#16A34A] selection:text-white min-h-screen bg-[#F8FAF8] text-[#17231D]">
          <AppShell>{children}</AppShell>
        </body>
      </html>
    </ClerkProvider>
  );
}
