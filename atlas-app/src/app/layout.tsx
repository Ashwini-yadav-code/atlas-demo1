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
