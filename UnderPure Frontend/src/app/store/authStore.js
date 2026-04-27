import { create } from "zustand";
import { persist } from "zustand/middleware";

const DEMO_ADMIN = {
  id: "demo-admin",
  email: "admin@underpure.com",
  name: "Admin",
  isAdmin: true,
  createdAt: new Date().toISOString(),
};

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isDemoAdmin: false,

      login: (user, token) =>
        set({ user, token, isAuthenticated: true, isDemoAdmin: false }),

      loginDemo: () =>
        set({
          user: DEMO_ADMIN,
          token: "demo-token",
          isAuthenticated: true,
          isDemoAdmin: true,
        }),

      logout: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isDemoAdmin: false,
        }),

      updateUser: (user) => set({ user }),
    }),
    { name: "underpure-auth" },
  ),
);
