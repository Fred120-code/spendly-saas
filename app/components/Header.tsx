"use client";
import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const navLinks = [
  { href: "#fonctionnalites", label: "Fonctionnalités" },
  { href: "#comment-ca-marche", label: "Comment ça marche" },
  { href: "#faq", label: "FAQ" },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-[#151425]/80 border-b border-[#E0FF67]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-20">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <h1 className="text-[#E0FF67] font-bold text-xl md:text-2xl">
              Spendly <span className="text-white">AI</span>
            </h1>
          </Link>

          {/* Navigation desktop */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-gray-300 hover:text-[#E0FF67] transition-colors duration-200"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/sign-in"
              className="hidden sm:inline-block px-4 py-2 md:px-6 md:py-2.5 text-sm font-medium text-white hover:text-[#E0FF67] transition-colors duration-200"
            >
              Se connecter
            </Link>

            <Link
              href="/sign-up"
              className="px-4 py-2 md:px-6 md:py-2.5 text-sm md:text-base font-semibold text-[#151425] bg-[#E0FF67] rounded-lg hover:bg-[#d4ff52] transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              S&apos;inscrire
            </Link>

            {/* Bouton menu mobile */}
            <button
              onClick={() => setOpen(!open)}
              className="md:hidden p-2 text-white"
              aria-label="Ouvrir le menu"
            >
              {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Menu mobile déroulant */}
        {open && (
          <nav className="md:hidden flex flex-col gap-1 pb-4">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="px-2 py-3 text-sm font-medium text-gray-300 hover:text-[#E0FF67] border-b border-white/5"
              >
                {link.label}
              </a>
            ))}
            <Link
              href="/sign-in"
              onClick={() => setOpen(false)}
              className="px-2 py-3 text-sm font-medium text-white"
            >
              Se connecter
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
