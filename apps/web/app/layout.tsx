import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "./i18n/LanguageProvider";
import { LanguageToggle } from "./components/LanguageToggle";
import { DisclosureFooter } from "./components/DisclosureFooter";

export const metadata: Metadata = {
  title: "Therumunai — தெருமுனை",
  description: "Anonymous civic-issue reporting for Chennai and Coimbatore.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col bg-white text-gray-900">
        <LanguageProvider>
          <header className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
            <span className="text-lg font-bold">Therumunai · தெருமுனை</span>
            <LanguageToggle />
          </header>
          <main className="flex-1">{children}</main>
          <DisclosureFooter />
        </LanguageProvider>
      </body>
    </html>
  );
}
