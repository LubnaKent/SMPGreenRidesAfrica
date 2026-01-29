import Link from "next/link";
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

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

const partnerLinks = [
  { name: "Partner with Us", href: "#contact" },
  { name: "Fleet Solutions", href: "#services" },
  { name: "Case Studies", href: "#" },
];

const socialLinks = [
  { name: "Facebook", icon: Facebook, href: "#" },
  { name: "Twitter", icon: Twitter, href: "#" },
  { name: "Instagram", icon: Instagram, href: "#" },
  { name: "LinkedIn", icon: Linkedin, href: "#" },
];

export function Footer() {
  return (
    <footer className="bg-gray-900">
      {/* Main Footer */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-3 lg:col-span-2">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#00D54B]">
                <svg viewBox="0 0 24 24" className="h-8 w-8 text-white" fill="currentColor">
                  <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9H15V22H13V16H11V22H9V9H3V7H21V9Z" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black text-white">SMP Green Rides</span>
                <span className="text-sm font-semibold text-[#00D54B]">AFRICA</span>
              </div>
            </Link>
            <p className="mt-6 text-gray-400 leading-relaxed max-w-sm">
              Empowering sustainable mobility across Africa through strategic driver acquisition and green transportation solutions.
            </p>

            {/* Social Links */}
            <div className="mt-8 flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-[#00D54B] hover:text-white transition-all"
                  aria-label={social.name}
                >
                  <social.icon className="h-5 w-5" />
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
                    className="text-gray-400 hover:text-[#00D54B] transition-colors"
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
                    className="text-gray-400 hover:text-[#00D54B] transition-colors"
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
                <Mail className="h-5 w-5 text-[#00D54B] flex-shrink-0 mt-0.5" />
                <span className="text-gray-400 text-sm">info@smpgreenrides.africa</span>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-[#00D54B] flex-shrink-0 mt-0.5" />
                <span className="text-gray-400 text-sm">+256 700 000 000</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-[#00D54B] flex-shrink-0 mt-0.5" />
                <span className="text-gray-400 text-sm">Kampala, Uganda</span>
              </li>
            </ul>
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
                className="text-sm text-gray-500 hover:text-[#00D54B] transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-sm text-gray-500 hover:text-[#00D54B] transition-colors"
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
