import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/frontend/components/shared/theme-provider";

export const metadata: Metadata = {
  title: "Eval Studio",
  description: "Local evaluation workspace for AI-backed product actions.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="light dark" />
      </head>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
