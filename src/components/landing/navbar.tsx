"use client";

import { useState } from "react";
import Link from "next/link";
import { Bike, Menu, X } from "lucide-react";

const navLinks = [
  { name: "Home", href: "#home" },
  { name: "About", href: "#about" },
  { name: "Services", href: "#services" },
  { name: "How It Works", href: "#how-it-works" },
  { name: "Contact", href: "#contact" },
];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setMobileMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-600">
              <Bike className="h-6 w-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-gray-900">SMP Green Rides</span>
              <span className="text-xs text-gray-500 -mt-1">Africa</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => scrollToSection(e, link.href)}
                className="text-sm font-medium text-gray-600 hover:text-green-600 transition-colors"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Desktop CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-green-600 transition-colors"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
            >
              Sign Up
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-gray-900"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100">
          <div className="px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => scrollToSection(e, link.href)}
                className="block py-2 text-base font-medium text-gray-600 hover:text-green-600"
              >
                {link.name}
              </a>
            ))}
            <hr className="my-4 border-gray-200" />
            <div className="flex flex-col gap-3">
              <Link
                href="/login"
                className="w-full py-2.5 text-center text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="w-full py-2.5 text-center text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
