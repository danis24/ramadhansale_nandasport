import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "🔥 FLASH SALE Ramadhan - Jersey Koko NSP Factory | Diskon Hingga 70%",
  description: "Promo Spesial Ramadhan! Jersey Koko Premium NSP Factory diskon hingga 70%. Harga normal Rp275.000 jadi CUMA Rp99.000. Stok terbatas!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body
        className={`${plusJakartaSans.variable} antialiased overflow-x-hidden relative`}
      >
        {children}
      </body>
    </html>
  );
}
