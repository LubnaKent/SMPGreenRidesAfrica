import Link from "next/link";
import { Mail, Phone, MapPin, Leaf } from "lucide-react";

const quickLinks = [
  { name: "About Us", href: "#about" },
  { name: "Services", href: "#services" },
  { name: "How It Works", href: "#how-it-works" },
  { name: "Contact", href: "#contact" },
];

const driverLinks = [
  { name: "Become a Driver", href: "/register" },
  { name: "Driver Portal", href: "/portal" },
  { name: "Training Programs", href: "#services" },
  { name: "FAQs", href: "#" },
];

const socialLinks = [
  { name: "Twitter", href: "#", icon: "𝕏" },
  { name: "LinkedIn", href: "#", icon: "in" },
  { name: "Instagram", href: "#", icon: "📷" },
  { name: "Facebook", href: "#", icon: "f" },
];

export function Footer() {
  return (
    <footer className="bg-gray-900 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-teal-500/5 rounded-full blur-3xl" />

      {/* Main Footer */}
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-4 lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 group-hover:scale-105 transition-transform">
                <Leaf className="h-6 w-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black text-white">SMP Green Rides</span>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Africa</span>
              </div>
            </Link>
            <p className="mt-4 text-emerald-400 font-semibold text-sm">
              Power the Green Revolution.
            </p>
            <p className="mt-3 text-gray-400 leading-relaxed max-w-sm">
              We build the workforce that moves Africa forward — sustainably. A greener Africa, powered by empowered drivers.
            </p>

            {/* Social Links */}
            <div className="mt-8 flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-gradient-to-br hover:from-emerald-500 hover:to-teal-600 hover:text-white transition-all text-sm font-bold"
                  aria-label={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Company
            </h3>
            <ul className="mt-6 space-y-4">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-emerald-400 transition-colors text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Driver Links */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              For Drivers
            </h3>
            <ul className="mt-6 space-y-4">
              {driverLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-emerald-400 transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Contact
            </h3>
            <ul className="mt-6 space-y-4">
              <li className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-400 text-sm">info@smpgreenrides.africa</span>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-400 text-sm">+256 700 000 000</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-400 text-sm">Kampala, Uganda</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter - Optional unique element */}
        <div className="mt-16 p-8 rounded-2xl bg-gradient-to-r from-emerald-600/10 to-teal-600/10 border border-emerald-500/20">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h4 className="text-lg font-bold text-white">Stay Updated</h4>
              <p className="mt-1 text-gray-400 text-sm">Get the latest news on green mobility opportunities in Africa.</p>
            </div>
            <form className="flex gap-3 w-full lg:w-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 lg:w-64 h-12 px-4 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none transition-colors"
              />
              <button
                type="submit"
                className="px-6 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-emerald-500/25 transition-all whitespace-nowrap"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} SMP Green Rides Africa. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link
                href="/privacy"
                className="text-sm text-gray-500 hover:text-emerald-400 transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-sm text-gray-500 hover:text-emerald-400 transition-colors"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
