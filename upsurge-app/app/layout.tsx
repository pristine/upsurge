// app/layout.tsx
import { ClientLayout } from './layout.client';
import './globals.css';
import 'frosted-ui/styles.css';
import 'react-placeholder/lib/reactPlaceholder.css';
import Script from 'next/script';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-3">
        <Script
          src="/_whop/analytics/analytics-v1.js"
          strategy="afterInteractive"
        />
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
