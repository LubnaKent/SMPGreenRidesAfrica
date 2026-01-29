"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Play, Star } from "lucide-react";

export function Hero() {
  return (
    <section id="home" className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-white">
      {/* Background Decorations */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-[#00D54B]/10 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-[#00D54B]/10 to-transparent rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Text Content */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#00D54B]/10 rounded-full text-[#00D54B] text-sm font-semibold mb-6">
              <Star className="h-4 w-4 fill-[#00D54B]" />
              <span>#1 Driver Partner Platform in Africa</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 leading-[1.1]">
              Ride with{" "}
              <span className="text-[#00D54B]">Green</span>{" "}
              <br className="hidden sm:block" />
              Rides Africa
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-gray-600 leading-relaxed max-w-xl">
              Join thousands of drivers earning with eco-friendly rides. Quick onboarding, great earnings, and a greener future.
            </p>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#00D54B] text-white font-bold text-lg rounded-full hover:bg-[#00C043] transition-all hover:scale-105 shadow-lg shadow-[#00D54B]/30"
              >
                Become a Driver
                <ArrowRight className="h-5 w-5" />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gray-100 text-gray-800 font-bold text-lg rounded-full hover:bg-gray-200 transition-all"
              >
                <Play className="h-5 w-5 fill-gray-800" />
                How It Works
              </a>
            </div>

            {/* Trust Badges */}
            <div className="mt-10 flex flex-wrap items-center gap-8 justify-center lg:justify-start">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00D54B] to-[#00A038] border-2 border-white flex items-center justify-center text-white text-xs font-bold"
                    >
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <div className="text-sm">
                  <p className="font-bold text-gray-900">2,500+</p>
                  <p className="text-gray-500">Active Drivers</p>
                </div>
              </div>
              <div className="h-10 w-px bg-gray-200 hidden sm:block" />
              <div className="text-sm">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-500 mt-1">4.9 Rating</p>
              </div>
            </div>
          </div>

          {/* Hero Illustration */}
          <div className="relative hidden lg:block">
            {/* Main Rider Illustration */}
            <div className="relative z-10">
              <svg viewBox="0 0 500 500" className="w-full h-auto">
                {/* Background Circle */}
                <circle cx="250" cy="250" r="200" fill="#00D54B" fillOpacity="0.1" />
                <circle cx="250" cy="250" r="150" fill="#00D54B" fillOpacity="0.1" />

                {/* Motorcycle Rider Illustration */}
                <g transform="translate(100, 120)">
                  {/* Wheel Back */}
                  <circle cx="50" cy="200" r="45" fill="#333" />
                  <circle cx="50" cy="200" r="35" fill="#555" />
                  <circle cx="50" cy="200" r="20" fill="#333" />
                  <circle cx="50" cy="200" r="8" fill="#888" />

                  {/* Wheel Front */}
                  <circle cx="250" cy="200" r="45" fill="#333" />
                  <circle cx="250" cy="200" r="35" fill="#555" />
                  <circle cx="250" cy="200" r="20" fill="#333" />
                  <circle cx="250" cy="200" r="8" fill="#888" />

                  {/* Body Frame */}
                  <path d="M50 200 L100 140 L200 130 L250 200" stroke="#00D54B" strokeWidth="8" fill="none" />
                  <path d="M100 140 L120 80 L180 80 L200 130" fill="#00D54B" />

                  {/* Seat */}
                  <ellipse cx="130" cy="90" rx="40" ry="15" fill="#333" />

                  {/* Handlebars */}
                  <path d="M200 130 L220 100 L240 90" stroke="#333" strokeWidth="6" fill="none" />
                  <circle cx="240" cy="90" r="8" fill="#555" />

                  {/* Rider Body */}
                  <ellipse cx="140" cy="50" rx="25" ry="30" fill="#00D54B" /> {/* Torso */}
                  <circle cx="140" cy="10" r="20" fill="#FFD5B5" /> {/* Head */}

                  {/* Helmet */}
                  <path d="M120 10 Q140 -15 160 10 Q165 20 160 25 L120 25 Q115 20 120 10" fill="#00D54B" />
                  <rect x="125" y="5" width="30" height="8" rx="2" fill="#333" opacity="0.5" /> {/* Visor */}

                  {/* Arms */}
                  <path d="M155 40 Q180 60 210 95" stroke="#FFD5B5" strokeWidth="12" fill="none" strokeLinecap="round" />
                  <path d="M125 40 Q110 70 100 120" stroke="#FFD5B5" strokeWidth="12" fill="none" strokeLinecap="round" />

                  {/* Legs */}
                  <path d="M130 75 Q100 120 80 170" stroke="#1a365d" strokeWidth="14" fill="none" strokeLinecap="round" />
                  <path d="M150 75 Q180 120 200 150" stroke="#1a365d" strokeWidth="14" fill="none" strokeLinecap="round" />

                  {/* Delivery Box */}
                  <rect x="60" y="45" width="50" height="40" rx="5" fill="#00D54B" />
                  <text x="85" y="72" fontSize="14" fill="white" textAnchor="middle" fontWeight="bold">SMP</text>
                </g>

                {/* Floating Elements */}
                <circle cx="400" cy="100" r="30" fill="#00D54B" fillOpacity="0.2" />
                <circle cx="80" cy="150" r="20" fill="#00D54B" fillOpacity="0.2" />
                <circle cx="420" cy="350" r="25" fill="#00D54B" fillOpacity="0.2" />
              </svg>
            </div>

            {/* Floating Stats Cards */}
            <div className="absolute top-10 right-0 bg-white rounded-2xl p-4 shadow-xl border border-gray-100 animate-bounce" style={{ animationDuration: '3s' }}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#00D54B] flex items-center justify-center">
                  <span className="text-2xl">🏍️</span>
                </div>
                <div>
                  <p className="text-2xl font-black text-gray-900">5K+</p>
                  <p className="text-sm text-gray-500">Daily Rides</p>
                </div>
              </div>
            </div>

            <div className="absolute bottom-20 left-0 bg-white rounded-2xl p-4 shadow-xl border border-gray-100 animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                  <span className="text-2xl">💰</span>
                </div>
                <div>
                  <p className="text-2xl font-black text-gray-900">UGX 50K+</p>
                  <p className="text-sm text-gray-500">Avg. Daily Earnings</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Stats */}
        <div className="grid grid-cols-3 gap-4 mt-12 lg:hidden">
          <div className="bg-[#00D54B]/10 rounded-2xl p-4 text-center">
            <p className="text-2xl font-black text-[#00D54B]">2,500+</p>
            <p className="text-xs text-gray-600 font-medium">Drivers</p>
          </div>
          <div className="bg-[#00D54B]/10 rounded-2xl p-4 text-center">
            <p className="text-2xl font-black text-[#00D54B]">50+</p>
            <p className="text-xs text-gray-600 font-medium">Partners</p>
          </div>
          <div className="bg-[#00D54B]/10 rounded-2xl p-4 text-center">
            <p className="text-2xl font-black text-[#00D54B]">5</p>
            <p className="text-xs text-gray-600 font-medium">Cities</p>
          </div>
        </div>
      </div>
    </section>
  );
}
