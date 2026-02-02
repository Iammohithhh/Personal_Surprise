import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";

export const metadata: Metadata = {
  title: "Surprise Story | Create Special Moments",
  description: "Create beautiful, personalized stories for your loved ones. Perfect for birthdays, anniversaries, Valentine's Day, and any special occasion.",
  keywords: ["surprise", "gift", "memories", "birthday", "anniversary", "valentine", "story", "family", "friends"],
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
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
