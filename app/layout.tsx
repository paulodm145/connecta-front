import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import React from "react";
import { AuthProvider } from "@/app/context/AuthContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Connecta Skills - Sistema de Avaliação",
  description: "Connecta Skills - Sistema de Avaliação",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
      <html lang="en">
        <AuthProvider><body>{children}</body></AuthProvider>
      </html>
  );
}