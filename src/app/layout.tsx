import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import Script from "next/script";
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
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '2083660338863687');
            fbq('track', 'PageView');
            fbq('track', 'ViewContent');
          `}
        </Script>
      </body>
    </html>
  );
}
