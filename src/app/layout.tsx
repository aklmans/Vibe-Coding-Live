import type { Metadata } from "next";
import { getAppAppearanceBootScript } from "../lib/design-tokens";
import "./globals.css";

const DEFAULT_SITE_URL = "https://vibe-studio.aklman.com";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? DEFAULT_SITE_URL;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Vibe Studio — AI-prepared broadcast graphics for coding livestreams",
  description:
    "AI-prepared broadcast graphics for a coding livestream studio. Draft, review and apply session config, connect OBS browser sources, and export overlay, cover, poster and wallpaper assets.",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "Vibe Studio — AI-prepared broadcast graphics for coding livestreams",
    description:
      "AI-prepared broadcast graphics for a coding livestream studio. Draft, review and apply session config, connect OBS browser sources, and export overlay, cover, poster and wallpaper assets.",
    images: ["/opengraph.jpg"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vibe Studio — AI-prepared broadcast graphics for coding livestreams",
    description:
      "AI-prepared broadcast graphics for a coding livestream studio. Draft, review and apply session config, connect OBS browser sources, and export overlay, cover, poster and wallpaper assets.",
    images: ["/opengraph.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{ __html: getAppAppearanceBootScript() }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
