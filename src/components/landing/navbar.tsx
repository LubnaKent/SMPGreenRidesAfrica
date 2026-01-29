"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Leaf } from "lucide-react";

const navLinks = [
  { name: "Home", href: "#home" },
  { name: "About", href: "#about" },
  { name: "Services", href: "#services" },
  { name: "Process", href: "#how-it-works" },
  { name: "Contact", href: "#contact" },
];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setMobileMenuOpen(false);
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled
        ? "bg-white/95 backdrop-blur-md shadow-lg shadow-black/5"
        : "bg-transparent"
    }`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className={`flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-300 ${
              scrolled
                ? "bg-gradient-to-br from-emerald-600 to-green-700"
                : "bg-white/10 backdrop-blur-sm border border-white/20"
            }`}>
              <Leaf className={`h-6 w-6 transition-colors ${scrolled ? "text-white" : "text-white"}`} />
            </div>
            <div className="flex flex-col">
              <span className={`text-lg font-black transition-colors ${scrolled ? "text-gray-900" : "text-white"}`}>
                SMP Green Rides
              </span>
              <span className={`text-[10px] font-bold uppercase tracking-widest -mt-0.5 ${
                scrolled ? "text-emerald-600" : "text-emerald-300"
              }`}>
                Africa
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => scrollToSection(e, link.href)}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                  scrolled
                    ? "text-gray-600 hover:text-emerald-600 hover:bg-emerald-50"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                }`}
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Desktop CTA Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/login"
              className={`px-5 py-2.5 text-sm font-bold rounded-xl transition-all ${
                scrolled
                  ? "text-gray-700 hover:text-emerald-600"
                  : "text-white hover:bg-white/10"
              }`}
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className={`px-5 py-2.5 text-sm font-bold rounded-xl transition-all ${
                scrolled
                  ? "bg-gradient-to-r from-emerald-600 to-green-600 text-white hover:shadow-lg hover:shadow-emerald-500/25"
                  : "bg-white text-emerald-900 hover:bg-emerald-50"
              }`}
            >
              Become a Driver
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`lg:hidden p-2.5 rounded-xl transition-colors ${
              scrolled
                ? "bg-gray-100 text-gray-700"
                : "bg-white/10 text-white"
            }`}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`lg:hidden transition-all duration-300 overflow-hidden ${
        mobileMenuOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
      }`}>
        <div className="bg-white border-t border-gray-100 shadow-xl">
          <div className="px-4 py-6 space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => scrollToSection(e, link.href)}
                className="block py-3 px-4 text-base font-semibold text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors"
              >
                {link.name}
              </a>
            ))}
            <hr className="my-4 border-gray-100" />
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Link
                href="/login"
                className="py-3 text-center text-base font-bold text-gray-700 border-2 border-gray-200 rounded-xl hover:border-emerald-500 hover:text-emerald-600 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="py-3 text-center text-base font-bold text-white bg-gradient-to-r from-emerald-600 to-green-600 rounded-xl"
              >
                Join Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
