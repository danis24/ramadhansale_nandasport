"use client";

import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { sendAddToCartEvent } from "./actions";

// Types
type Notification = {
  name: string;
  product: string;
  timeText: string;
};

// Data
const NAMES = ["Budi", "Ahmad", "Siti", "Rina", "Agus", "Dewi", "Rizky", "Fitri", "Eko", "Putri", "Hendra", "Nur", "Arif", "Ayu", "Fajar"];
const CITIES = ["Jakarta", "Surabaya", "Bandung", "Medan", "Semarang", "Makassar", "Palembang", "Depok", "Tangerang", "Bekasi"];
const PRODUCTS = ["Jersey Koko Black Red Edition", "Jersey Koko Grey Blue Edition", "Jersey Koko White Batik Edition", "Jersey Koko Stripe Lengan Pendek", "Jersey Koko Stripe Lengan Panjang", "Jersey Koko Lengan Panjang Red Block", "Jersey Koko Lengan Pendek Red Block", "Jersey Koko Lengan Panjang Blue Block", "Jersey Koko Lengan Pendek Blue Block"];

const WHATSAPP_NUMBER = "6289666158975"; // GANTI DENGAN NOMOR WA ASLI
const DEFAULT_WA_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Halo kak, saya mau order Jersey Koko Ramadhan")}`;

export default function Home() {
  // === State for Countdown ===
  const [timeLeft, setTimeLeft] = useState({
    days: "00",
    hours: "00",
    minutes: "00",
    seconds: "00"
  });

  // === State for Push Notifications ===
  const [notification, setNotification] = useState<Notification | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  
  // === State for Buyer Count ===
  const [buyerCount, setBuyerCount] = useState(347);

  // === State for Floating WA ===
  const [showFloatingWa, setShowFloatingWa] = useState(false);

  // === Refs for Scroll Reveal ===
  const containerRef = useRef<HTMLDivElement>(null);

  // === Add To Cart Helper (Pixel + CAPI) ===
  const handleAddToCart = (productName: string, price: number) => {
    const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', 'AddToCart', {
        content_name: productName,
        value: price,
        currency: 'IDR'
      });
    }
    sendAddToCartEvent(productName, price, ua).catch(console.error);
  };

  // === Countdown Logic (3 Hours from first visit) ===
  useEffect(() => {
    // Check if we already have an expiration time saved
    let endDateRaw = localStorage.getItem('ramadhanSaleEndDate');
    let endDate: number;

    if (!endDateRaw) {
      // Set to 3 hours from now
      endDate = new Date().getTime() + (3 * 60 * 60 * 1000);
      localStorage.setItem('ramadhanSaleEndDate', endDate.toString());
    } else {
      endDate = parseInt(endDateRaw, 10);
      // If it already expired, reset it to another 3 hours to keep the "urgency"
      if (endDate < new Date().getTime()) {
        endDate = new Date().getTime() + (3 * 60 * 60 * 1000);
        localStorage.setItem('ramadhanSaleEndDate', endDate.toString());
      }
    }

    const updateTimer = () => {
      const now = new Date().getTime();
      const distance = endDate - now;

      if (distance < 0) {
        setTimeLeft({ days: "00", hours: "00", minutes: "00", seconds: "00" });
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft({
        days: days.toString().padStart(2, '0'),
        hours: hours.toString().padStart(2, '0'),
        minutes: minutes.toString().padStart(2, '0'),
        seconds: seconds.toString().padStart(2, '0')
      });
    };

    updateTimer(); // Initial call
    const timerInterval = setInterval(updateTimer, 1000);
    return () => clearInterval(timerInterval);
  }, []);

  // === Push Notification Logic ===
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const triggerRandomNotification = () => {
      const name = NAMES[Math.floor(Math.random() * NAMES.length)];
      const city = CITIES[Math.floor(Math.random() * CITIES.length)];
      const product = PRODUCTS[Math.floor(Math.random() * PRODUCTS.length)];
      const time = Math.floor(Math.random() * 15) + 1;

      setNotification({
        name: `${name} dari ${city}`,
        product,
        timeText: `${time} menit yang lalu`
      });
      
      setShowNotification(true);

      // Hide after 5 seconds
      setTimeout(() => {
        setShowNotification(false);
      }, 5000);

      // Schedule next notification between 10-25 seconds
      const nextTime = Math.floor(Math.random() * 15000) + 10000;
      timeoutId = setTimeout(triggerRandomNotification, nextTime);
    };

    // Start first notification after 3 seconds
    timeoutId = setTimeout(triggerRandomNotification, 3000);

    return () => clearTimeout(timeoutId);
  }, []);

  // === Scroll Elements (Reveal & Floating WA) ===
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowFloatingWa(true);
      } else {
        setShowFloatingWa(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    // Initial check
    handleScroll();

    // Scroll Reveal Intersection Observer
    if (containerRef.current) {
        const reveals = containerRef.current.querySelectorAll('.reveal');
        
        // Initial setup for reveals
        reveals.forEach(el => {
            (el as HTMLElement).style.opacity = '0';
            (el as HTMLElement).style.transform = 'translateY(30px)';
            (el as HTMLElement).style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        });

        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    (entry.target as HTMLElement).style.opacity = '1';
                    (entry.target as HTMLElement).style.transform = 'translateY(0)';
                    revealObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        reveals.forEach(el => revealObserver.observe(el));
        
        return () => {
             reveals.forEach(el => revealObserver.unobserve(el));
             window.removeEventListener("scroll", handleScroll);
        }
    }
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // === Buyer Count Interval Logic ===
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        setBuyerCount(prev => prev + 1);
      }
    }, 8000);
    return () => clearInterval(interval);
  }, []);


  return (
    <div ref={containerRef}>
      
      {/* Push Notification */}
      <div 
        className={`fixed bottom-24 left-4 sm:left-6 bg-white border border-brand-200 shadow-xl rounded-2xl p-3 sm:p-4 flex items-center gap-3 z-50 transform transition-transform duration-500 max-w-[320px] ${showNotification ? 'translate-x-0' : '-translate-x-[150%]'}`}
      >
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center text-xl sm:text-2xl flex-shrink-0">
          🛒
        </div>
        <div className="flex flex-col">
          <strong className="text-xs sm:text-sm font-bold text-brand-600">
            {notification?.name || "Memuat..."}
          </strong>
          <span className="text-[11px] sm:text-xs text-gray-600">
            baru saja membeli {notification?.product?.replace("Jersey Koko ", "")}
          </span>
          <small className="text-[10px] text-gray-400 mt-0.5">
            {notification?.timeText || "1 menit yang lalu"}
          </small>
        </div>
        <button 
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" 
          onClick={() => setShowNotification(false)}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Floating WhatsApp CTA */}
      <a 
        href={DEFAULT_WA_URL} 
        className={`fixed bottom-6 right-6 bg-[#25D366] text-white w-14 h-14 rounded-full flex items-center justify-center z-50 shadow-lg hover:scale-110 transition-all duration-300 group ${showFloatingWa ? 'opacity-100 scale-100' : 'opacity-0 scale-0 pointer-events-none'}`}
        target="_blank" 
        rel="noreferrer"
      >
        <div className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-75"></div>
        <svg viewBox="0 0 32 32" width="30" height="30" fill="currentColor" className="relative z-10">
          <path d="M16.004 0h-.008C7.174 0 0 7.176 0 16c0 3.5 1.132 6.742 3.054 9.378L1.054 31.29l6.166-1.964C9.79 30.996 12.788 32 16.004 32 24.826 32 32 24.822 32 16S24.826 0 16.004 0zm9.342 22.616c-.39 1.1-1.932 2.014-3.148 2.28-.832.178-1.918.32-5.574-1.198-4.678-1.94-7.69-6.684-7.926-6.994-.226-.31-1.898-2.53-1.898-4.826s1.2-3.424 1.628-3.892c.39-.428 1.036-.642 1.654-.642.2 0 .38.01.54.018.468.02.704.048 1.012.786.39.924 1.34 3.268 1.458 3.506.12.238.238.546.088.856-.14.32-.262.462-.5.73-.238.268-.464.472-.702.76-.22.254-.468.526-.196.994.272.46 1.21 1.996 2.6 3.232 1.786 1.588 3.288 2.082 3.756 2.31.468.228.742.19 1.014-.116.28-.316 1.202-1.398 1.522-1.878.312-.48.632-.396 1.062-.238.436.158 2.762 1.302 3.236 1.54.468.238.782.354.898.55.116.196.116 1.136-.274 2.236z"/>
        </svg>
      </a>

      {/* ===== HERO SECTION ===== */}
      <section className="relative min-h-[100svh] flex flex-col items-center justify-center pt-20 pb-16 px-4 bg-white overflow-hidden">
        {/* Islamic Ornament Background */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\\'60\\' height=\\'60\\' viewBox=\\'0 0 60 60\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cpath d=\\'M30 0L60 30L30 60L0 30L30 0Z\\' fill=\\'%23ea580c\\' fill-rule=\\'evenodd\\'/%3E%3C/svg%3E')", backgroundSize: "60px 60px" }}></div>
        
        {/* Lantern Ornaments */}
        <Image src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23fb923c' opacity='0.2'%3E%3Cpath d='M12 2L10 6H14L12 2ZM8 8C8 5.79 9.79 4 12 4C14.21 4 16 5.79 16 8V11H18V13H17V19C17 20.1 16.1 21 15 21H9C7.9 21 7 20.1 7 19V13H6V11H8V8ZM10 8V11H14V8C14 6.9 13.1 6 12 6C10.9 6 10 6.9 10 8ZM9 13V19H15V13H9ZM12 22C12.55 22 13 22.45 13 23V24H11V23C11 22.45 11.45 22 12 22Z'/%3E%3C/svg%3E" 
               className="absolute top-10 left-10 w-24 h-24 sm:w-32 sm:h-32 animate-[float_3s_ease-in-out_infinite] pointer-events-none" 
               alt="" 
               width={128} height={128} unoptimized />
        
        <Image src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23fb923c' opacity='0.2'%3E%3Cpath d='M12 2L10 6H14L12 2ZM8 8C8 5.79 9.79 4 12 4C14.21 4 16 5.79 16 8V11H18V13H17V19C17 20.1 16.1 21 15 21H9C7.9 21 7 20.1 7 19V13H6V11H8V8ZM10 8V11H14V8C14 6.9 13.1 6 12 6C10.9 6 10 6.9 10 8ZM9 13V19H15V13H9ZM12 22C12.55 22 13 22.45 13 23V24H11V23C11 22.45 11.45 22 12 22Z'/%3E%3C/svg%3E" 
               className="absolute top-16 right-12 w-16 h-16 sm:w-24 sm:h-24 animate-[float_3s_ease-in-out_infinite] pointer-events-none" 
               style={{ animationDelay: '1.5s' }} 
               alt="" 
               width={96} height={96} unoptimized />

        {/* Flash Sale Header */}
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-brand-600 to-brand-500 text-white text-center py-2 text-xs sm:text-sm font-bold tracking-widest uppercase shadow-md flex items-center justify-center gap-2">
          <span className="animate-[bounce_2s_infinite]">⚡</span> FLASH SALE RAMADHAN <span className="animate-[bounce_2s_infinite]">⚡</span>
        </div>

        <div className="relative z-10 text-center max-w-3xl mx-auto flex flex-col items-center">
            
          <div className="inline-flex items-center gap-2 bg-brand-50 border border-brand-200 text-brand-700 px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold tracking-wide mb-6 sm:mb-8 shadow-sm">
            <span>🌙</span> PROMO SPESIAL RAMADHAN 1447H
          </div>
          
          <h1 className="flex flex-col gap-1 sm:gap-2 mb-8">
            <span className="text-sm sm:text-lg md:text-xl font-bold text-gray-500 tracking-[0.2em] uppercase">Jersey Koko Premium</span>
            <span className="text-5xl sm:text-7xl md:text-[80px] font-black leading-none text-brand-900 tracking-tight">
              DISKON <span className="text-brand-500 relative inline-block">70%
                <svg className="absolute -bottom-2 sm:-bottom-4 left-0 w-full h-3 sm:h-4 text-brand-300 -z-10" viewBox="0 0 100 20" preserveAspectRatio="none"><path d="M0 10 Q 50 20 100 10" stroke="currentColor" strokeWidth="8" fill="none" strokeLinecap="round"/></svg>
              </span>
            </span>
            <span className="text-base sm:text-xl md:text-2xl font-medium text-gray-600 mt-2 sm:mt-4">Tampil Stylish & Nyaman Saat Ibadah!</span>
          </h1>

          {/* Price Box */}
          <div className="bg-white border-2 border-brand-100 shadow-xl rounded-2xl sm:rounded-3xl p-5 sm:p-8 mb-8 sm:mb-10 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 w-full max-w-2xl relative z-10 group">
            {/* Highlight effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-brand-50 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 rounded-2xl sm:rounded-3xl"></div>
            
            <div className="absolute -top-4 sm:-top-5 left-1/2 transform -translate-x-1/2 sm:translate-x-0 sm:left-auto sm:right-8 bg-black text-white px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-bold shadow-md border border-gray-700 animate-[pulse_3s_cubic-bezier(0.4,0,0.6,1)_infinite] z-20 whitespace-nowrap">
              DISKON TERBESAR TAHUN INI!
            </div>

            <div className="flex flex-col items-center text-center">
              <span className="text-[10px] sm:text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Harga Normal</span>
              <span className="text-xl sm:text-3xl font-bold text-gray-400 line-through decoration-brand-500 decoration-2 sm:decoration-4">Rp275.000</span>
            </div>
            
            <div className="text-brand-300 text-2xl sm:text-3xl rotate-90 sm:rotate-0">
              <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <span className="text-[10px] sm:text-xs text-brand-500 font-bold uppercase tracking-wider mb-1">Promo Mulai Dari</span>
              <div className="text-brand-600 font-black flex items-baseline leading-none">
                <span className="text-4xl sm:text-6xl">Rp99</span>
                <span className="text-xl sm:text-3xl">.000</span>
              </div>
            </div>
          </div>

          {/* Countdown Timer */}
          <div className="mb-10 w-full max-w-2xl text-center">
            <h2 className="flex items-center justify-center gap-2 text-2xl sm:text-3xl md:text-4xl font-black text-red-600 mb-6 uppercase tracking-wider">
              <span className="animate-bounce">⚡</span> FLASH SALE BERAKHIR DALAM
            </h2>
            <div className="flex justify-center items-center gap-2 sm:gap-3 lg:gap-5 flex-wrap">
              <div className="bg-red-50 border border-red-200 rounded-2xl p-3 sm:p-4 min-w-[70px] sm:min-w-[90px] flex flex-col items-center shadow-lg relative overflow-hidden group">
                <div className="absolute inset-0 bg-red-100 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <span className="text-3xl sm:text-4xl md:text-5xl font-black text-red-700 relative z-10" id="hours">{timeLeft.hours}</span>
                <span className="text-[10px] sm:text-xs font-bold text-red-500 uppercase tracking-widest mt-1 relative z-10">Jam</span>
              </div>
              <span className="text-2xl sm:text-4xl font-black text-red-400 animate-pulse hidden sm:block">:</span>
              <div className="bg-red-50 border border-red-200 rounded-2xl p-3 sm:p-4 min-w-[70px] sm:min-w-[90px] flex flex-col items-center shadow-lg relative overflow-hidden group">
                <div className="absolute inset-0 bg-red-100 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <span className="text-3xl sm:text-4xl md:text-5xl font-black text-red-700 relative z-10" id="minutes">{timeLeft.minutes}</span>
                <span className="text-[10px] sm:text-xs font-bold text-red-500 uppercase tracking-widest mt-1 relative z-10">Menit</span>
              </div>
              <span className="text-2xl sm:text-4xl font-black text-red-400 animate-pulse hidden sm:block">:</span>
              <div className="bg-red-600 border border-red-700 rounded-2xl p-3 sm:p-4 min-w-[70px] sm:min-w-[90px] flex flex-col items-center shadow-lg relative overflow-hidden group">
                <div className="absolute inset-0 bg-red-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <span className="text-3xl sm:text-4xl md:text-5xl font-black text-white relative z-10" id="seconds">{timeLeft.seconds}</span>
                <span className="text-[10px] sm:text-xs font-bold text-red-100 uppercase tracking-widest mt-1 relative z-10">Detik</span>
              </div>
            </div>
          </div>

          {/* CTA */}
          <a href={DEFAULT_WA_URL}
             onClick={() => handleAddToCart("Jersey Koko Ramadhan", 99000)}
             className="inline-flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#128C7E] text-white px-6 sm:px-10 py-4 sm:py-5 rounded-full text-base sm:text-lg font-extrabold tracking-wide transition-all shadow-[0_10px_25px_-5px_rgba(37,211,102,0.4)] hover:shadow-[0_15px_35px_-5px_rgba(37,211,102,0.5)] hover:-translate-y-1 w-full sm:w-auto" target="_blank" rel="noreferrer">
            <svg viewBox="0 0 32 32" width="24" height="24" fill="currentColor">
              <path d="M16.004 0h-.008C7.174 0 0 7.176 0 16c0 3.5 1.132 6.742 3.054 9.378L1.054 31.29l6.166-1.964C9.79 30.996 12.788 32 16.004 32 24.826 32 32 24.822 32 16S24.826 0 16.004 0zm9.342 22.616c-.39 1.1-1.932 2.014-3.148 2.28-.832.178-1.918.32-5.574-1.198-4.678-1.94-7.69-6.684-7.926-6.994-.226-.31-1.898-2.53-1.898-4.826s1.2-3.424 1.628-3.892c.39-.428 1.036-.642 1.654-.642.2 0 .38.01.54.018.468.02.704.048 1.012.786.39.924 1.34 3.268 1.458 3.506.12.238.238.546.088.856-.14.32-.262.462-.5.73-.238.268-.464.472-.702.76-.22.254-.468.526-.196.994.272.46 1.21 1.996 2.6 3.232 1.786 1.588 3.288 2.082 3.756 2.31.468.228.742.19 1.014-.116.28-.316 1.202-1.398 1.522-1.878.312-.48.632-.396 1.062-.238.436.158 2.762 1.302 3.236 1.54.468.238.782.354.898.55.116.196.116 1.136-.274 2.236z"/>
            </svg>
            ORDER VIA WHATSAPP
          </a>
          <div className="mt-4 flex items-center justify-center gap-2 text-xs sm:text-sm text-gray-500 bg-gray-100 rounded-full px-4 py-1.5 border border-gray-200">
            <span className="text-brand-500">🔥</span> <span className="font-bold text-brand-900">{buyerCount}</span> orang order hari ini!
          </div>
        </div>
      </section>

      {/* ===== PRODUCT SECTION ===== */}
      <section className="py-20 px-4 bg-gray-50 relative" id="produk">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16 reveal">
            <span className="text-brand-500 font-bold text-sm tracking-widest uppercase mb-2 block">Koleksi Terbaru</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-brand-900 mb-4">Pilihan Jersey Koko <span className="text-brand-500">Eksklusif</span></h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-sm sm:text-base">Material premium, desain modern, nyaman untuk ibadah & aktivitas sehari-hari</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-sm md:max-w-none mx-auto">
            {/* Product 1 */}
            <div className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 border border-gray-100 reveal delay-100 relative group">
              <div className="absolute top-4 left-4 bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-full z-10 shadow-md">BEST SELLER 🔥</div>
              <div className="aspect-[4/5] bg-gray-200 overflow-hidden relative">
                <Image src="/images/jersey-1.jpg" fill alt="Black Red Edition" className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-brand-900 mb-2">Black Red Edition</h3>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">Kombinasi hitam & merah yang bold, cocok untuk tampil maskulin dan percaya diri.</p>
                
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-sm text-gray-400 line-through">Rp275.000</span>
                  <span className="text-2xl font-black text-brand-600">Rp99.000</span>
                </div>
                
                <div className="mb-6">
                  <div className="w-full bg-gray-100 rounded-full h-1.5 mb-2 overflow-hidden">
                    <div className="bg-brand-500 h-1.5 rounded-full w-1/4"></div>
                  </div>
                  <span className="text-[11px] font-bold text-red-500">⚠️ Sisa 12 pcs!</span>
                </div>
                
                <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Halo kak, saya mau order Jersey Koko Black Red Edition promo Rp99.000")}`}
                   onClick={() => handleAddToCart("Jersey Koko Black Red Edition", 99000)}
                   className="block w-full text-center bg-[#1e293b] hover:bg-black text-white py-3 sm:py-3.5 rounded-xl font-bold text-sm transition-colors" target="_blank" rel="noreferrer">
                  BELI SEKARANG
                </a>
              </div>
            </div>

            {/* Product 2 */}
            <div className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 border border-gray-100 reveal delay-200 relative group">
              <div className="absolute top-4 left-4 bg-brand-500 text-white text-[10px] font-bold px-3 py-1 rounded-full z-10 shadow-md">NEW ARRIVAL ✨</div>
              <div className="aspect-[4/5] bg-gray-200 overflow-hidden relative">
                <Image src="/images/jersey-2.jpg" fill alt="Grey Blue Edition" className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-brand-900 mb-2">Grey Blue Edition</h3>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">Nuansa abu-abu elegan dengan aksen biru, tampil kalem tapi tetap keren.</p>
                
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-sm text-gray-400 line-through">Rp275.000</span>
                  <span className="text-2xl font-black text-brand-600">Rp99.000</span>
                </div>
                
                <div className="mb-6">
                  <div className="w-full bg-gray-100 rounded-full h-1.5 mb-2 overflow-hidden">
                    <div className="bg-brand-500 h-1.5 rounded-full w-[45%]"></div>
                  </div>
                  <span className="text-[11px] font-bold text-brand-500">⚠️ Sisa 23 pcs!</span>
                </div>
                
                <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Halo kak, saya mau order Jersey Koko Grey Blue Edition promo Rp99.000")}`}
                   onClick={() => handleAddToCart("Jersey Koko Grey Blue Edition", 99000)}
                   className="block w-full text-center bg-[#1e293b] hover:bg-black text-white py-3 sm:py-3.5 rounded-xl font-bold text-sm transition-colors" target="_blank" rel="noreferrer">
                  BELI SEKARANG
                </a>
              </div>
            </div>

            {/* Product 3 */}
            <div className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 border border-gray-100 reveal delay-300 relative group">
              <div className="absolute top-4 left-4 bg-gray-800 text-white text-[10px] font-bold px-3 py-1 rounded-full z-10 shadow-md">LIMITED 🌙</div>
              <div className="aspect-[4/5] bg-gray-200 overflow-hidden relative">
                <Image src="/images/jersey-3.jpg" fill alt="White Batik Edition" className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-brand-900 mb-2">White Batik Edition</h3>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">Desain putih bersih dengan motif batik modern, sempurna untuk hari raya.</p>
                
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-sm text-gray-400 line-through">Rp275.000</span>
                  <span className="text-2xl font-black text-brand-600">Rp99.000</span>
                </div>
                
                <div className="mb-6">
                  <div className="w-full bg-gray-100 rounded-full h-1.5 mb-2 overflow-hidden">
                    <div className="bg-brand-500 h-1.5 rounded-full w-[12%]"></div>
                  </div>
                  <span className="text-[11px] font-bold text-red-500">⚠️ Sisa 7 pcs!</span>
                </div>
                
                <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Halo kak, saya mau order Jersey Koko White Batik Edition promo Rp99.000")}`}
                   onClick={() => handleAddToCart("Jersey Koko White Batik Edition", 99000)}
                   className="block w-full text-center bg-[#1e293b] hover:bg-black text-white py-3 sm:py-3.5 rounded-xl font-bold text-sm transition-colors" target="_blank" rel="noreferrer">
                  BELI SEKARANG
                </a>
              </div>
            </div>

            {/* Product 4 */}
            <div className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 border border-gray-100 reveal delay-100 relative group">
              <div className="absolute top-4 left-4 bg-purple-500 text-white text-[10px] font-bold px-3 py-1 rounded-full z-10 shadow-md">TREN 2026 ✨</div>
              <div className="aspect-[4/5] bg-gray-200 overflow-hidden relative">
                <Image src="/images/jersey-4.jpg" fill alt="Stripe Pendek Edition" className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-brand-900 mb-2">Stripe Lengan Pendek</h3>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">Desain tribal stripe warna-warni melintang di dada, anti mainstream & berkarakter.</p>
                
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-sm text-gray-400 line-through">Rp275.000</span>
                  <span className="text-2xl font-black text-brand-600">Rp99.000</span>
                </div>
                
                <div className="mb-6">
                  <div className="w-full bg-gray-100 rounded-full h-1.5 mb-2 overflow-hidden">
                    <div className="bg-brand-500 h-1.5 rounded-full w-[35%]"></div>
                  </div>
                  <span className="text-[11px] font-bold text-brand-500">⚠️ Sisa 19 pcs!</span>
                </div>
                
                <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Halo kak, saya mau order Jersey Koko Stripe Lengan Pendek promo Rp99.000")}`}
                   onClick={() => handleAddToCart("Jersey Koko Stripe Lengan Pendek", 99000)}
                   className="block w-full text-center bg-[#1e293b] hover:bg-black text-white py-3 sm:py-3.5 rounded-xl font-bold text-sm transition-colors" target="_blank" rel="noreferrer">
                  BELI SEKARANG
                </a>
              </div>
            </div>

            {/* Product 5 */}
            <div className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 border border-gray-100 reveal delay-200 relative group">
              <div className="absolute top-4 left-4 bg-teal-600 text-white text-[10px] font-bold px-3 py-1 rounded-full z-10 shadow-md">EXCLUSIVE 👑</div>
              <div className="aspect-[4/5] bg-gray-200 overflow-hidden relative">
                <Image src="/images/jersey-5.jpg" fill alt="Stripe Panjang Edition" className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-brand-900 mb-2">Stripe Lengan Panjang</h3>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">Versi lengan panjang eksklusif berani beda dengan tribal stripe untuk tampilan maskulin.</p>
                
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-sm text-gray-400 line-through">Rp275.000</span>
                  <span className="text-2xl font-black text-brand-600">Rp110.000</span>
                </div>
                
                <div className="mb-6">
                  <div className="w-full bg-gray-100 rounded-full h-1.5 mb-2 overflow-hidden">
                    <div className="bg-brand-500 h-1.5 rounded-full w-[20%]"></div>
                  </div>
                  <span className="text-[11px] font-bold text-red-500">⚠️ Sisa 10 pcs!</span>
                </div>
                
                <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Halo kak, saya mau order Jersey Koko Stripe Lengan Panjang promo Rp110.000")}`}
                   onClick={() => handleAddToCart("Jersey Koko Stripe Lengan Panjang", 110000)}
                   className="block w-full text-center bg-[#1e293b] hover:bg-black text-white py-3 sm:py-3.5 rounded-xl font-bold text-sm transition-colors" target="_blank" rel="noreferrer">
                  BELI SEKARANG
                </a>
              </div>
            </div>

            {/* Product 6 */}
            <div className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 border border-gray-100 reveal delay-100 relative group">
              <div className="absolute top-4 left-4 bg-red-600 text-white text-[10px] font-bold px-3 py-1 rounded-full z-10 shadow-md">NEW 🔥</div>
              <div className="aspect-[4/5] bg-gray-200 overflow-hidden relative">
                <Image src="/images/jersey-6.jpg" fill alt="Lengan Panjang Red Block" className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-brand-900 mb-2">Long Sleeve Red Block</h3>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">Desain asimetris elegan berpadu merah maroon & motif premium untuk acara formal maupun santai.</p>
                
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-sm text-gray-400 line-through">Rp275.000</span>
                  <span className="text-2xl font-black text-brand-600">Rp110.000</span>
                </div>
                
                <div className="mb-6">
                  <div className="w-full bg-gray-100 rounded-full h-1.5 mb-2 overflow-hidden">
                    <div className="bg-brand-500 h-1.5 rounded-full w-[15%]"></div>
                  </div>
                  <span className="text-[11px] font-bold text-red-500">⚠️ Sisa 8 pcs!</span>
                </div>
                
                <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Halo kak, saya mau order Jersey Koko Lengan Panjang Red Block promo Rp110.000")}`}
                   onClick={() => handleAddToCart("Jersey Koko Lengan Panjang Red Block", 110000)}
                   className="block w-full text-center bg-[#1e293b] hover:bg-black text-white py-3 sm:py-3.5 rounded-xl font-bold text-sm transition-colors" target="_blank" rel="noreferrer">
                  BELI SEKARANG
                </a>
              </div>
            </div>

            {/* Product 7 */}
            <div className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 border border-gray-100 reveal delay-200 relative group">
              <div className="absolute top-4 left-4 bg-red-600 text-white text-[10px] font-bold px-3 py-1 rounded-full z-10 shadow-md">NEW 🔥</div>
              <div className="aspect-[4/5] bg-gray-200 overflow-hidden relative">
                <Image src="/images/jersey-7.jpg" fill alt="Lengan Pendek Red Block" className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-brand-900 mb-2">Short Sleeve Red Block</h3>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">Versi lengan pendek dari seri blok merah asimetris, lebih kasual tetap on point.</p>
                
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-sm text-gray-400 line-through">Rp275.000</span>
                  <span className="text-2xl font-black text-brand-600">Rp99.000</span>
                </div>
                
                <div className="mb-6">
                  <div className="w-full bg-gray-100 rounded-full h-1.5 mb-2 overflow-hidden">
                    <div className="bg-brand-500 h-1.5 rounded-full w-[25%]"></div>
                  </div>
                  <span className="text-[11px] font-bold text-brand-500">⚠️ Sisa 15 pcs!</span>
                </div>
                
                <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Halo kak, saya mau order Jersey Koko Lengan Pendek Red Block promo Rp99.000")}`}
                   onClick={() => handleAddToCart("Jersey Koko Lengan Pendek Red Block", 99000)}
                   className="block w-full text-center bg-[#1e293b] hover:bg-black text-white py-3 sm:py-3.5 rounded-xl font-bold text-sm transition-colors" target="_blank" rel="noreferrer">
                  BELI SEKARANG
                </a>
              </div>
            </div>

            {/* Product 8 */}
            <div className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 border border-gray-100 reveal delay-300 relative group">
              <div className="absolute top-4 left-4 bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-full z-10 shadow-md">LIMITED 🌊</div>
              <div className="aspect-[4/5] bg-gray-200 overflow-hidden relative">
                <Image src="/images/jersey-8.jpg" fill alt="Lengan Panjang Blue Block" className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-brand-900 mb-2">Long Sleeve Blue Block</h3>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">Aksen ocean blue dipadukan pattern geometris, adem dilihat dan nyaman dipakai.</p>
                
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-sm text-gray-400 line-through">Rp275.000</span>
                  <span className="text-2xl font-black text-brand-600">Rp110.000</span>
                </div>
                
                <div className="mb-6">
                  <div className="w-full bg-gray-100 rounded-full h-1.5 mb-2 overflow-hidden">
                    <div className="bg-brand-500 h-1.5 rounded-full w-[10%]"></div>
                  </div>
                  <span className="text-[11px] font-bold text-red-500">⚠️ Sisa 5 pcs!</span>
                </div>
                
                <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Halo kak, saya mau order Jersey Koko Lengan Panjang Blue Block promo Rp110.000")}`}
                   onClick={() => handleAddToCart("Jersey Koko Lengan Panjang Blue Block", 110000)}
                   className="block w-full text-center bg-[#1e293b] hover:bg-black text-white py-3 sm:py-3.5 rounded-xl font-bold text-sm transition-colors" target="_blank" rel="noreferrer">
                  BELI SEKARANG
                </a>
              </div>
            </div>

            {/* Product 9 */}
            <div className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 border border-gray-100 reveal delay-100 lg:col-start-2 relative group">
              <div className="absolute top-4 left-4 bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-full z-10 shadow-md">LIMITED 🌊</div>
              <div className="aspect-[4/5] bg-gray-200 overflow-hidden relative">
                <Image src="/images/jersey-9.jpg" fill alt="Lengan Pendek Blue Block" className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-brand-900 mb-2">Short Sleeve Blue Block</h3>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">Tampil maskulin dengan paduan grafis navy dan cyan yang fresh untuk sehari-hari.</p>
                
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-sm text-gray-400 line-through">Rp275.000</span>
                  <span className="text-2xl font-black text-brand-600">Rp99.000</span>
                </div>
                
                <div className="mb-6">
                  <div className="w-full bg-gray-100 rounded-full h-1.5 mb-2 overflow-hidden">
                    <div className="bg-brand-500 h-1.5 rounded-full w-[40%]"></div>
                  </div>
                  <span className="text-[11px] font-bold text-brand-500">⚠️ Sisa 22 pcs!</span>
                </div>
                
                <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Halo kak, saya mau order Jersey Koko Lengan Pendek Blue Block promo Rp99.000")}`}
                   onClick={() => handleAddToCart("Jersey Koko Lengan Pendek Blue Block", 99000)}
                   className="block w-full text-center bg-[#1e293b] hover:bg-black text-white py-3 sm:py-3.5 rounded-xl font-bold text-sm transition-colors" target="_blank" rel="noreferrer">
                  BELI SEKARANG
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FEATURES SECTION ===== */}
      <section className="py-20 px-4 bg-white border-y border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16 reveal">
            <h2 className="text-3xl sm:text-4xl font-black text-brand-900 mb-4">Kenapa Memilih <span className="text-brand-500">NSP Factory?</span></h2>
            <p className="text-gray-500 text-sm sm:text-base">Kualitas sultan harga teman, dirancang khusus untuk kenyamanan maksimal.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="p-6 rounded-2xl bg-brand-50 border border-brand-100 hover:-translate-y-1 transition-transform reveal">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl shadow-sm mb-4">🧵</div>
              <h3 className="font-bold text-lg text-brand-900 mb-2">Material Premium</h3>
              <p className="text-gray-600 text-sm">Bahan micro polyester tebal, adem, tidak mudah kusut & sangat halus di kulit.</p>
            </div>
            <div className="p-6 rounded-2xl bg-brand-50 border border-brand-100 hover:-translate-y-1 transition-transform reveal delay-100">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl shadow-sm mb-4">✨</div>
              <h3 className="font-bold text-lg text-brand-900 mb-2">Printing Sublimasi</h3>
              <p className="text-gray-600 text-sm">Warna tajam, full color, dan dijamin tidak akan luntur meski sering dicuci.</p>
            </div>
            <div className="p-6 rounded-2xl bg-brand-50 border border-brand-100 hover:-translate-y-1 transition-transform reveal delay-200">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl shadow-sm mb-4">📐</div>
              <h3 className="font-bold text-lg text-brand-900 mb-2">Pola Presisi</h3>
              <p className="text-gray-600 text-sm">Size chart akurat (M-XXL), fitting pas di badan tidak kebesaran / kekecilan.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS & SIZE CHART ===== */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          
          <div className="reveal">
            <span className="text-brand-500 font-bold text-sm tracking-widest uppercase mb-2 block">Testimoni</span>
            <h2 className="text-3xl font-black text-brand-900 mb-8">Kata Pelanggan <span className="text-brand-500">Kami</span></h2>
            
            <div className="space-y-4">
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex gap-4">
                <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center font-bold flex-shrink-0">R</div>
                <div>
                  <div className="text-brand-400 text-sm mb-1">★★★★★</div>
                  <p className="text-gray-600 text-sm italic mb-2">&quot;Bahan adem banget, desain modern. Dipakai tarawih ga bikin gerah sama sekali. Recommended!&quot;</p>
                  <span className="text-xs font-bold text-brand-900">Rizky Setiawan - Bandung</span>
                </div>
              </div>
              
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex gap-4">
                <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center font-bold flex-shrink-0">D</div>
                <div>
                  <div className="text-brand-400 text-sm mb-1">★★★★★</div>
                  <p className="text-gray-600 text-sm italic mb-2">&quot;Pengiriman cepat, admin ramah. Jersey kokonya pas banget ukurannya. Nyesel cuma beli satu.&quot;</p>
                  <span className="text-xs font-bold text-brand-900">Dimas Pratama - Surabaya</span>
                </div>
              </div>
            </div>
          </div>

          <div className="reveal delay-200">
            <span className="text-brand-500 font-bold text-sm tracking-widest uppercase mb-2 block">Panduan Ukuran</span>
            <h2 className="text-3xl font-black text-brand-900 mb-8">Size <span className="text-brand-500">Chart</span></h2>
            
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-brand-50 text-brand-700 font-bold">
                  <tr>
                    <th className="px-4 py-3 border-b border-brand-100 uppercase text-xs">Size</th>
                    <th className="px-4 py-3 border-b border-brand-100 uppercase text-xs">L. Dada</th>
                    <th className="px-4 py-3 border-b border-brand-100 uppercase text-xs">Panjang</th>
                    <th className="px-4 py-3 border-b border-brand-100 uppercase text-xs">BB Estimasi</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600">
                  <tr className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3 font-bold text-brand-900"><span className="bg-gray-100 px-2 py-1 rounded">M</span></td>
                    <td className="px-4 py-3">52 cm</td>
                    <td className="px-4 py-3">70 cm</td>
                    <td className="px-4 py-3">50-60 kg</td>
                  </tr>
                  <tr className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3 font-bold text-brand-900"><span className="bg-gray-100 px-2 py-1 rounded">L</span></td>
                    <td className="px-4 py-3">54 cm</td>
                    <td className="px-4 py-3">72 cm</td>
                    <td className="px-4 py-3">60-70 kg</td>
                  </tr>
                  <tr className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3 font-bold text-brand-900"><span className="bg-gray-100 px-2 py-1 rounded">XL</span></td>
                    <td className="px-4 py-3">57 cm</td>
                    <td className="px-4 py-3">75 cm</td>
                    <td className="px-4 py-3">70-80 kg</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-bold text-brand-900"><span className="bg-gray-100 px-2 py-1 rounded">XXL</span></td>
                    <td className="px-4 py-3">60 cm</td>
                    <td className="px-4 py-3">78 cm</td>
                    <td className="px-4 py-3">80-90 kg</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="py-20 px-4 bg-brand-500 relative overflow-hidden" id="order">
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\\'60\\' height=\\'60\\' viewBox=\\'0 0 60\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cpath d=\\'M30 0L60 30L30 60L0 30L30 0Z\\' fill=\\'%23000000\\' fill-rule=\\'evenodd\\'/%3E%3C/svg%3E')", backgroundSize: "60px 60px" }}></div>
        
        <div className="max-w-3xl mx-auto bg-white rounded-3xl p-8 sm:p-12 text-center relative z-10 shadow-2xl reveal">
          <div className="inline-block bg-red-100 text-red-600 px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold tracking-wide mb-6 animate-pulse">
            ⚡ STOK TERBATAS — JANGAN KEHABISAN!
          </div>
          
          <h2 className="text-3xl sm:text-5xl font-black text-brand-900 mb-4">Pesan Sekarang!</h2>
          <p className="text-gray-500 mb-8 sm:text-lg">Harga akan kembali normal <span className="font-bold text-gray-800 line-through">Rp275.000</span> setelah kuota promo habis.</p>

          <div className="flex flex-col items-center justify-center gap-1 mb-8">
            <span className="text-sm font-bold text-brand-500 uppercase">Promo Flash Sale</span>
            <span className="text-5xl sm:text-6xl font-black text-brand-900">Rp99.000</span>
          </div>

          <a href={DEFAULT_WA_URL}
             onClick={() => handleAddToCart("Jersey Koko Ramadhan", 99000)}
             className="inline-flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#128C7E] text-white px-8 sm:px-12 py-4 sm:py-5 rounded-full text-base sm:text-xl font-extrabold tracking-wide transition-all shadow-[0_10px_25px_-5px_rgba(37,211,102,0.4)] hover:-translate-y-1 w-full sm:w-auto mb-6" target="_blank" rel="noreferrer">
            <svg viewBox="0 0 32 32" width="28" height="28" fill="currentColor">
              <path d="M16.004 0h-.008C7.174 0 0 7.176 0 16c0 3.5 1.132 6.742 3.054 9.378L1.054 31.29l6.166-1.964C9.79 30.996 12.788 32 16.004 32 24.826 32 32 24.822 32 16S24.826 0 16.004 0zm9.342 22.616c-.39 1.1-1.932 2.014-3.148 2.28-.832.178-1.918.32-5.574-1.198-4.678-1.94-7.69-6.684-7.926-6.994-.226-.31-1.898-2.53-1.898-4.826s1.2-3.424 1.628-3.892c.39-.428 1.036-.642 1.654-.642.2 0 .38.01.54.018.468.02.704.048 1.012.786.39.924 1.34 3.268 1.458 3.506.12.238.238.546.088.856-.14.32-.262.462-.5.73-.238.268-.464.472-.702.76-.22.254-.468.526-.196.994.272.46 1.21 1.996 2.6 3.232 1.786 1.588 3.288 2.082 3.756 2.31.468.228.742.19 1.014-.116.28-.316 1.202-1.398 1.522-1.878.312-.48.632-.396 1.062-.238.436.158 2.762 1.302 3.236 1.54.468.238.782.354.898.55.116.196.116 1.136-.274 2.236z"/>
            </svg>
            KLIK ORDER VIA WHATSAPP
          </a>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-gray-500">
            <span className="flex items-center gap-1"><svg className="w-4 h-4 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg> 100% Original</span>
            <span className="flex items-center gap-1"><svg className="w-4 h-4 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg> Garansi Tukar Size</span>
            <span className="flex items-center gap-1"><svg className="w-4 h-4 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg> Fast Response</span>
          </div>
        </div>
      </section>

      <footer className="bg-[#1f2937] text-white py-8 text-center border-t border-gray-800">
        <p className="font-black tracking-widest text-brand-500 mb-2">NSP FACTORY</p>
        <p className="text-xs text-gray-400">&copy; 2026 Jersey Koko Premium. All rights reserved.</p>
      </footer>
    </div>
  );
}
