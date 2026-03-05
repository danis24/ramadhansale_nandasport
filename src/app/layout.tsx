import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "🔥 FLASH SALE Ramadhan - Jersey Koko NSP Factory | Diskon Hingga 70%",
  description: "Promo Spesial Ramadhan! Jersey Koko Premium NSP Factory diskon hingga 70%. Harga Promo Spesial mulai dari Rp99.000. Terbatas, Pesan Sekarang!",
  openGraph: {
    title: "🔥 FLASH SALE Ramadhan - Jersey Koko NSP Factory",
    description: "Promo Spesial Ramadhan! Jersey Koko Premium NSP Factory mulai dari Rp99.000. Diskon Hingga 70%!",
    images: [
      {
        url: "/images/jersey-1.jpg",
        width: 800,
        height: 1000,
        alt: "Jersey Koko NSP Factory",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "🔥 FLASH SALE Ramadhan - Jersey Koko NSP Factory",
    description: "Promo Spesial Ramadhan! Jersey Koko Premium NSP Factory mulai dari Rp99.000.",
    images: ["/images/jersey-1.jpg"],
  },
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
