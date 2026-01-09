"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export function ScrollToTop() {
  const pathname = usePathname();
  const lastPathname = useRef<string>("");
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Only scroll if pathname actually changed
    if (pathname !== lastPathname.current) {
      lastPathname.current = pathname;
      
      // Clear any pending scroll
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      
      // Debounce scroll to prevent excessive calls
      scrollTimeoutRef.current = setTimeout(() => {
        if (typeof window !== "undefined" && window.scrollY > 0) {
          window.scrollTo({ top: 0, left: 0, behavior: "instant" });
        }
      }, 50);
    }

    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [pathname]);

  return null;
}

