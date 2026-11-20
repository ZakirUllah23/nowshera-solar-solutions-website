/**
 * Centralized Static Images Configuration
 * 
 * All non-database static assets (heroes, banners, branding, and fixed showcases)
 * are mapped here to standard local paths inside /public/images/...
 * 
 * To replace any visual across the site, swap the file in the designated
 * /public/images/ folder or update the path reference below.
 */

export const SITE_IMAGES = {
  logo: "/images/logo/logo.png",
  heroes: {
    home: [
      "/images/heroes/home-hero-1.jpg",
      "/images/heroes/home-hero-2.jpg",
      "/images/heroes/home-hero-3.jpg",
    ],
    products: "/images/heroes/products-hero.jpg",
    packages: "/images/heroes/packages-hero.jpg",
    offers: "/images/heroes/offers-hero.jpg",
    about: "/images/heroes/about-hero.jpg",
    contact: "/images/heroes/contact-hero.jpg",
  },
  divisions: {
    panels: "/images/divisions/panels.jpeg",
    inverters: "/images/divisions/inverters.jpeg",
    batteries: "/images/divisions/batteries.jpeg",
  },
  installations: [
    "/images/installations/install-1.jpg",
    "/images/installations/install-2.jpg",
    "/images/installations/install-3.jpg",
    "/images/installations/install-4.jpg",
    "/images/installations/install-5.jpg",
    "/images/installations/install-6.jpg",
    "/images/installations/install-7.jpg",
  ],
  about: {
    managerHeadshot: "/images/about/rahil-khan.jpg",
    repairShop: "/images/about/repair-shop.jpg",
  },
} as const;

export type SiteImages = typeof SITE_IMAGES;
