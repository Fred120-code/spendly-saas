import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full border-t border-[#E0FF67]/10 px-4 sm:px-6 lg:px-8 py-10">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <span className="text-[#E0FF67] font-bold text-lg">
            Spendly <span className="text-white">AI</span>
          </span>
        </div>

        <nav className="flex items-center gap-6 text-sm text-gray-400">
          <a
            href="#fonctionnalites"
            className="hover:text-[#E0FF67] transition-colors"
          >
            Fonctionnalités
          </a>
          <a href="#faq" className="hover:text-[#E0FF67] transition-colors">
            FAQ
          </a>
          <Link
            href="/sign-in"
            className="hover:text-[#E0FF67] transition-colors"
          >
            Se connecter
          </Link>
        </nav>

        <p className="text-gray-600 text-xs">
          © {new Date().getFullYear()} Spendly AI. Tous droits réservés.
        </p>
      </div>
    </footer>
  );
}
