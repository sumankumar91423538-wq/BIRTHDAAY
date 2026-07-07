import type { Metadata } from "next";
import { Poppins, Nunito, Caveat, Dancing_Script } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import Watermark from "@/components/Watermark";

const poppins = Poppins({
  variable: "--font-poppins-var",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const nunito = Nunito({
  variable: "--font-nunito-var",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const caveat = Caveat({
  variable: "--font-caveat-var",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const dancingScript = Dancing_Script({
  variable: "--font-dancing-var",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Gundi Ka Happy Wala Birthday 🎂✨",
  description: "A magical birthday surprise for the most special person",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} ${nunito.variable} ${caveat.variable} ${dancingScript.variable} h-full antialiased`}
    >
      <body
        className="min-h-full flex flex-col"
        style={{ fontFamily: "var(--font-nunito-var), sans-serif" }}
      >
        <AppProvider>
          {children}
          <Watermark />
        </AppProvider>
      </body>
    </html>
  );
}
