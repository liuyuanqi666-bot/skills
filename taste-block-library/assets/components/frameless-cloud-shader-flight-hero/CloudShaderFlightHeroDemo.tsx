"use client";

import { useEffect, useId, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

import { CloudShader } from "./components/ui/cloud-shader";
import { destinations, heroContent, navigation, planeWing } from "./travel-data";

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return isMobile;
}

export function CloudShaderFlightHeroDemo() {
  const isMobile = useIsMobile();
  const reduceMotion = useReducedMotion();
  const desktopMenuRef = useRef<HTMLDetailsElement>(null);
  const mobileMenuRef = useRef<HTMLDetailsElement>(null);
  const desktopMenuId = useId();
  const mobileMenuId = useId();

  useEffect(() => {
    const closeOutside = (event: PointerEvent) => {
      if (!desktopMenuRef.current?.contains(event.target as Node) && desktopMenuRef.current) {
        desktopMenuRef.current.open = false;
      }
      if (!mobileMenuRef.current?.contains(event.target as Node) && mobileMenuRef.current) {
        mobileMenuRef.current.open = false;
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      for (const menu of [desktopMenuRef.current, mobileMenuRef.current]) {
        if (menu?.open) {
          menu.open = false;
          menu.querySelector("summary")?.focus();
        }
      }
    };

    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  const closeMenus = () => {
    if (desktopMenuRef.current) desktopMenuRef.current.open = false;
    if (mobileMenuRef.current) mobileMenuRef.current.open = false;
  };

  const menuItems = (id: string) => (
    <div id={id} className="menu-list">
      <p>这一程，从这里开始</p>
      {navigation.map(({ href, label }, index) => (
        <a key={href} href={href} onClick={closeMenus}>
          <span className="menu-number">0{index + 1}</span>
          {label}
          <span aria-hidden="true">↗</span>
        </a>
      ))}
    </div>
  );

  return (
    <>
      <main className="flight-hero relative h-dvh min-h-[40rem] w-full overflow-hidden bg-linear-to-t from-[#8cbfe8] to-[#3876ba]">
        <motion.div
          className="sky-layer absolute inset-0"
          initial={{ opacity: reduceMotion ? 1 : 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.4, ease: "easeOut" }}
        >
          <div className="absolute h-1/2 w-1/2 origin-top-left scale-200">
            <CloudShader
              speed={1}
              count={isMobile ? 3 : 6}
              className="absolute inset-0"
            />
          </div>
        </motion.div>

        <nav aria-label="线路导航" className="travel-nav relative z-30 mx-auto flex w-full max-w-7xl items-center justify-between px-4 pt-6 md:px-8">
          <div className="nav-left flex items-center gap-10">
            <span className="product-name text-lg font-semibold tracking-tight text-white">
              {heroContent.productName}<span className="product-divider"> · </span><span className="product-subtitle">{heroContent.productSubtitle}</span>
            </span>
            <div className="desktop-links hidden items-center gap-8 text-sm font-medium text-white/90 md:flex">
              {navigation.map(({ href, label }) => (
                <a key={href} href={href} className="transition-colors hover:text-white">{label}</a>
              ))}
            </div>
          </div>

          <details className="travel-menu desktop-menu" ref={desktopMenuRef}>
            <summary aria-controls={desktopMenuId} aria-label="展开线路列表" className="menu-toggle rounded-full bg-white text-sm font-semibold text-black">
              <span>目录</span>
              <svg aria-hidden="true" viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 6h14M3 10h14M3 14h14" />
              </svg>
            </summary>
            {menuItems(desktopMenuId)}
          </details>
        </nav>

        <div className="hero-content relative z-20 mx-auto mt-16 w-full max-w-7xl px-4 md:px-8">
          <div className="hero-copy max-w-2xl">
            <h1 className="hero-title text-4xl font-bold tracking-tight text-white [text-shadow:0_2px_12px_rgba(15,42,67,0.35)] md:text-6xl">
              {heroContent.title[0]}<br />{heroContent.title[1]}
            </h1>
            <p className="hero-description mt-4 max-w-xl text-base text-balance text-white/90 md:text-lg">
              {heroContent.description[0]}<br />{heroContent.description[1]}<br className="mobile-break" />{heroContent.description[2]}
            </p>

            <div className="hero-actions mt-8 flex flex-wrap items-center gap-4">
              <a href="#schedule" className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition-colors hover:bg-white/90">
                {heroContent.primaryAction}
              </a>
              <a href="#itinerary" className="explore-button rounded-full px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10">
                {heroContent.secondaryAction} <span aria-hidden="true">↗</span>
              </a>
            </div>

            <div className="destinations-strip mt-8 flex items-center gap-3">
              <div className="destination-images flex -space-x-2.5" aria-label="湖泊、雪山、森林与星空">
                {destinations.map(({ image, name }) => (
                  <img
                    key={name}
                    src={image}
                    alt={name}
                    width={32}
                    height={32}
                    className="h-8 w-8 rounded-full border-2 border-white/80 object-cover"
                  />
                ))}
              </div>
              <p className="destination-copy text-sm text-white/90">
                <span className="font-semibold text-white">{heroContent.destinationTitle}</span>
                <span className="destination-caption"> {heroContent.destinationCaption}</span>
              </p>
            </div>
          </div>
        </div>

        <motion.div
          className="plane-wing pointer-events-none absolute -bottom-6 left-0 z-10 w-[85%] md:w-[70%]"
          animate={{ y: reduceMotion ? 0 : [0, -12, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        >
          <img src={planeWing} alt={heroContent.wingAlt} className="h-auto w-full object-cover" />
        </motion.div>
      </main>

      <details className="travel-menu mobile-menu" ref={mobileMenuRef}>
        <summary aria-controls={mobileMenuId} aria-label="展开线路列表" className="menu-toggle rounded-full bg-white text-sm font-semibold text-black">
          <svg aria-hidden="true" viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 6h14M3 10h14M3 14h14" />
          </svg>
        </summary>
        {menuItems(mobileMenuId)}
      </details>
    </>
  );
}
