import './global.css';

export const metadata = {
  title: 'Naatukoottam (നാട്ടുകൂട്ടം) – നമ്മുടെ നാട്, നമ്മുടെ ശബ്ദം',
  description: 'Kerala Community Social Networking & Interdepartmental Infrastructure Coordination Platform',
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
    <html lang="en">
      <body className="antialiased selection:bg-[#087A45] selection:text-white min-h-screen">
        {children}
      </body>
    </html>
  );
}
