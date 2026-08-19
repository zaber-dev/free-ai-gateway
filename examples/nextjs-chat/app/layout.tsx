import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free-AI Gateway Chat Demo',
  description: 'Next.js App Router integration with Free-AI Gateway',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif' }}>{children}</body>
    </html>
  );
}
