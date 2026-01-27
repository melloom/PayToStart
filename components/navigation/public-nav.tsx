"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileText, ArrowRight, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export function PublicNav() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`border-b border-slate-800 backdrop-blur-md fixed top-0 left-0 right-0 z-[100] shadow-lg w-full transition-all duration-300 ${
      isScrolled 
        ? "bg-slate-900/98 shadow-xl" 
        : "bg-slate-900/95"
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <div className="flex items-center justify-center w-11 h-11 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 shadow-md">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <span className="ml-3 text-xl font-bold text-white">
                Pay2Start
              </span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
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
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-800 py-4 animate-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col gap-2">
              <Link 
                href="/about"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-3 rounded-lg font-semibold transition-all ${
                  pathname === "/about"
                    ? "text-white bg-slate-800"
                    : "text-slate-300 hover:text-white hover:bg-slate-800"
                }`}
              >
                About
              </Link>
              <Link 
                href="/pricing"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-3 rounded-lg font-semibold transition-all ${
                  pathname === "/pricing"
                    ? "text-white bg-slate-800"
                    : "text-slate-300 hover:text-white hover:bg-slate-800"
                }`}
              >
                Pricing
              </Link>
              <Link 
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-3 rounded-lg font-semibold transition-all ${
                  pathname === "/login"
                    ? "text-white bg-slate-800"
                    : "text-slate-300 hover:text-white hover:bg-slate-800"
                }`}
              >
                Sign In
              </Link>
              <Link 
                href="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-center transition-all flex items-center justify-center gap-2"
              >
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}




