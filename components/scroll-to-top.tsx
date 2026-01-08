"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    // Scroll to top on route change
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  useEffect(() => {
    // Scroll to top on initial page load/refresh
    if (typeof window !== "undefined") {
      // Immediate scroll on load
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      
      // Also handle browser back/forward navigation
      const handlePopState = () => {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      };
      
      // Handle page visibility change (when user comes back to tab)
      const handleVisibilityChange = () => {
        if (!document.hidden) {
          window.scrollTo({ top: 0, left: 0, behavior: "instant" });
        }
      };
      
      window.addEventListener("popstate", handlePopState);
      document.addEventListener("visibilitychange", handleVisibilityChange);
      
      return () => {
        window.removeEventListener("popstate", handlePopState);
        document.removeEventListener("visibilitychange", handleVisibilityChange);
      };
    }
  }, []);

  return null;
}

