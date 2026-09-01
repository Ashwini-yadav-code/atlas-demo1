import type { Metadata } from "next";
import "./globals.css";
import { ThemeInitScript } from "@/components/shell/ThemeToggle";

export const metadata: Metadata = {
  title: "Atlas",
  description: "The free operating system for Indian students studying in the UK.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" data-theme="light">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font --
            no-page-custom-font assumes the Pages Router, where a font link
            has to live in pages/_document.js to apply site-wide instead of
            to one page. This file *is* the single root layout for the App
            Router — every route already renders inside it — so this link
            already applies everywhere. Switching to next/font/google would
            mean rewriting every literal font-family:'Montserrat'/'Open Sans'
            declaration across atlas-design-system.css to match its scoped
            class names; not worth the regression risk for a false positive. */}
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@700;800;900&family=Open+Sans:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <ThemeInitScript />
      </head>
      <body>{children}</body>
    </html>
  );
}
