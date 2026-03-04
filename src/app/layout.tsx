import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Container } from "@/components/layout/container";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "QueueSetu",
  description: "QueueSetu homepage",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} min-h-screen bg-background text-slate-800 antialiased`}
      >
        <Container>{children}</Container>
      </body>
    </html>
  );
}
