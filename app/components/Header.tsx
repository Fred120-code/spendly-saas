"use client";
import Link from "next/link";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-[#151425]/80 border-b border-[#E0FF67]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <h1 className="text-[#E0FF67] font-bold text-xl md:text-2xl">
              Spendly <span className="text-white">AI</span>
            </h1>
          </Link>

          {/* Navigation */}
          <div className="flex items-center gap-4 md:gap-6">
            {/* <div className="hidden sm:block">
              <ThemeToggle />
            </div> */}

            <Link
              href="/sign-in"
              className="px-4 py-2 md:px-6 md:py-2.5 text-sm font-medium text-white hover:text-[#E0FF67] transition-colors duration-200"
            >
              Se connecter
            </Link>

            <Link
              href="/sign-up"
              className="px-4 py-2 md:px-6 md:py-2.5 text-sm md:text-base font-semibold text-[#151425] bg-[#E0FF67] rounded-lg hover:bg-[#d4ff52] transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              S'inscrire
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
