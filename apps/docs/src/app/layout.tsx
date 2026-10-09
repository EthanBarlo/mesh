import { RootProvider } from 'fumadocs-ui/provider/next';
import type { Metadata, Viewport } from 'next';
import { IBM_Plex_Mono, Inter_Tight } from 'next/font/google';
import { frameworkScript } from '@/lib/framework';
import { siteDescription, siteUrl } from '@/lib/shared';
import './global.css';
import './drafting.css';

const interTight = Inter_Tight({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter-tight',
});

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-plex-mono',
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Mesh · React, Vue and Svelte islands for Livewire',
    template: '%s · Mesh',
  },
  description: siteDescription,
  icons: {
    icon: '/icon.svg',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ece9e2' },
    { media: '(prefers-color-scheme: dark)', color: '#161513' },
  ],
};

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="en"
      className={`${interTight.variable} ${plexMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Sets <html data-framework> from the stored framework choice before
            first paint, so the home page shows a returning reader's choice
            from the first frame. suppressHydrationWarning above covers it. */}
        <script dangerouslySetInnerHTML={{ __html: frameworkScript }} />
      </head>
      <body className="flex flex-col min-h-screen font-sans">
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
