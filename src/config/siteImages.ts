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
    home: "/images/heroes/home-hero.jpg",
    products: "/images/heroes/products-hero.jpg",
    packages: "/images/heroes/packages-hero.jpg",
    offers: "/images/heroes/offers-hero.jpg",
    about: "/images/heroes/about-hero.jpg",
    contact: "/images/heroes/contact-hero.jpg",
  },
  homeShowcase: [
    "/images/home/showcase-1.jpg",
    "/images/home/showcase-2.jpg",
    "/images/home/showcase-3.jpg",
    "/images/home/showcase-4.jpg",
  ],
  about: {
    owner: "/images/about/owner.jpg",
    repairCenter: "/images/about/repair-center.jpg",
  },
} as const;

export type SiteImages = typeof SITE_IMAGES;
