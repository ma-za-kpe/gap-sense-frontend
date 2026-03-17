import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GapSense - Live Demo | AI Learning Gap Diagnostics",
  description: "Try GapSense live! Upload a student exercise book photo and see AI analyze math gaps in 8 seconds. Built for UNICEF StartUp Lab Cohort 6.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
