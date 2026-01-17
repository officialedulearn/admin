import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "sonner";
import { Providers } from "@/components/Providers";

const satoshi = localFont({
  src: "../../public/assets/fonts/Satoshi-Regular.otf",
  variable: "--font-satoshi",
});

export const metadata: Metadata = {
  title: "EduLearn Admin - Comprehensive Management Platform",
  description:
    "Admin panel for managing EduLearn users, rewards, activities, notifications, and analytics",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${satoshi.className} antialiased bg-background text-foreground`}
      >
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#1a1a1a",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.1)",
            },
          }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
