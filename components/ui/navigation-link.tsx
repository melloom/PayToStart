"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface NavigationLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  prefetch?: boolean;
}

export function NavigationLink({ 
  href, 
  children, 
  className,
  prefetch = true 
}: NavigationLinkProps) {
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      prefetch={prefetch}
      className={cn(className, isNavigating && "opacity-70")}
      onClick={() => setIsNavigating(true)}
    >
      {children}
    </Link>
  );
}




