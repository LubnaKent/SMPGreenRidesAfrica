import Link from "next/link";
import { Bike, Mail, Phone, MapPin } from "lucide-react";

const quickLinks = [
  { name: "About Us", href: "#about" },
  { name: "Services", href: "#services" },
  { name: "How It Works", href: "#how-it-works" },
  { name: "Contact", href: "#contact" },
];

const legalLinks = [
  { name: "Privacy Policy", href: "/privacy" },
  { name: "Terms of Service", href: "/terms" },
];

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-600">
                <Bike className="h-6 w-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-white">SMP Green Rides</span>
                <span className="text-xs text-gray-400 -mt-1">Africa</span>
              </div>
            </Link>
            <p className="mt-4 text-sm text-gray-400 leading-relaxed">
              Empowering sustainable mobility across Africa through strategic driver acquisition and green transportation solutions.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
              Quick Links
            </h3>
            <ul className="mt-4 space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-green-400 transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
              Legal
            </h3>
            <ul className="mt-4 space-y-3">
              {legalLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-green-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
              Contact Us
            </h3>
            <ul className="mt-4 space-y-3">
              <li className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-400">info@smpgreenrides.africa</span>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-400">+256 700 000 000</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-400">Kampala, Uganda</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} SMP Green Rides Africa. All rights reserved.
            </p>
            <p className="text-sm text-gray-500">
              Powered by <span className="text-green-500">Sales Management Partners</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
