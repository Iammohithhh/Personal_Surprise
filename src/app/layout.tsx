import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Our Love Story | Create Your Romantic Surprise",
  description: "Craft an unforgettable romantic experience for your special someone. Transform your memories into a beautiful love story.",
  keywords: ["valentine", "romantic", "love story", "surprise", "gift", "memories"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
