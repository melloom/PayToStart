"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileText, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

export function PublicNav() {
  const pathname = usePathname();

  return (
    <nav className="relative border-b border-slate-800 bg-slate-900/95 backdrop-blur-md sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <motion.div 
            className="flex items-center"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link href="/" className="flex items-center">
              <div className="flex items-center justify-center w-11 h-11 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 shadow-md">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <span className="ml-3 text-xl font-bold text-white">
                Pay2Start
              </span>
            </Link>
          </motion.div>
          <motion.div 
            className="flex items-center gap-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link href="/about">
              <Button 
                variant="ghost" 
                className={`font-semibold px-4 py-2 transition-all ${
                  pathname === "/about"
                    ? "text-white bg-slate-800"
                    : "text-slate-300 hover:text-white hover:bg-slate-800"
                }`}
              >
                About
              </Button>
            </Link>
            <Link href="/pricing">
              <Button 
                variant="ghost" 
                className={`font-semibold px-4 py-2 transition-all ${
                  pathname === "/pricing"
                    ? "text-white bg-slate-800"
                    : "text-slate-300 hover:text-white hover:bg-slate-800"
                }`}
              >
                Pricing
              </Button>
            </Link>
            <Link href="/login">
              <Button 
                variant="ghost" 
                className={`font-semibold px-4 py-2 transition-all ${
                  pathname === "/login"
                    ? "text-white bg-slate-800"
                    : "text-slate-300 hover:text-white hover:bg-slate-800"
                }`}
              >
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg hover:shadow-xl transition-all font-semibold px-6 py-2">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </nav>
  );
}

