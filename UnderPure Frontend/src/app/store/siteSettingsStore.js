import { create } from "zustand";
import { persist } from "zustand/middleware";

const DEFAULTS = {
  announcementText:
    "Complimentary Shipping on Orders Over £150 · New Collection Now Available",
  announcementVisible: true,
  heroHeadline: "Dressed in",
  heroHeadlineItalic: "Nothing But Luxury",
  heroSubheadline:
    "Handcrafted lingerie for the woman who understands that true luxury begins with what lies beneath.",
  heroBadgeText: "New Collection · Spring 2026",
  heroCtaText: "Shop The Collection",
  freeShippingThreshold: 150,
  storeName: "Underpure",
  storeEmail: "hello@underpure.com",
  storePhone: "+44 20 7123 4567",
  storeAddress: "12 Mayfair Row, London W1K 6AB, United Kingdom",
  instagramUrl: "#",
  facebookUrl: "#",
  twitterUrl: "#",
  newsletterTitle: "Join Our Inner Circle",
  newsletterSub:
    "Be the first to discover new collections, exclusive offers, and intimate styling notes.",
  footerTagline:
    "Luxury lingerie and intimate apparel, crafted for the discerning woman. Beauty in every thread.",
};

export const useSiteSettingsStore = create(
  persist(
    (set) => ({
      ...DEFAULTS,
      updateSettings: (settings) => set((state) => ({ ...state, ...settings })),
      resetToDefaults: () => set((state) => ({ ...state, ...DEFAULTS })),
    }),
    { name: "underpure-site-settings" },
  ),
);
