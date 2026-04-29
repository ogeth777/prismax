import type { Metadata } from "next";
import { CustomCursor } from "@/components/CustomCursor";
import "./globals.css";

export const metadata: Metadata = {
  title: "PRISMAX | AI-Driven Community Robotics",
  description: "Experience the future of decentralized robotics and AI collaboration.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased dark">
      <body className="min-h-full flex flex-col bg-bg-dark text-white selection:bg-primary/30">
        <CustomCursor />
        {children}
      </body>
    </html>
  );
}
