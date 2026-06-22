"use client";
import { UserButton, useUser } from "@clerk/nextjs";
import { ArrowLeftRight, ChartLine, Wallet } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect } from "react";
import { syncCurrentUserAction } from "@/modules/users/user.actions";

const Navbar = () => {
  const { user } = useUser();

  useEffect(() => {
    if (user) {
      // L'email n'est plus envoyé au serveur : syncCurrentUserAction lit
      // la session Clerk côté serveur elle-même.
      syncCurrentUserAction();
    }
  }, [user]);

  const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: ChartLine },
    { href: "/budgets", label: "Budgets", icon: Wallet },
    { href: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  ];

  const pathname = usePathname();

  return (
    <div className="sticky top-4 z-50 w-full mt-5">
      <div className="flex items-center justify-between gap-4 rounded-2xl border border-[#E0FF67]/15 bg-gradient-to-br from-white/[0.06] to-white/[0.02] backdrop-blur-xl px-4 py-2.5 shadow-lg shadow-black/20">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 shrink-0">
          <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-[#E0FF67] text-[#151425]">
            <Wallet className="w-4 h-4" />
          </div>
          <h1 className="hidden sm:block text-white font-bold text-sm leading-none">
            Spendly <span className="text-[#E0FF67]">AI</span>
          </h1>
        </Link>

        {/* Nav links */}
        <nav className="flex items-center gap-1 rounded-full bg-black/20 p-1 border border-white/5">
          {navLinks.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                href={href}
                key={href}
                className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-[#E0FF67] text-[#151425] shadow-[0_0_12px_rgba(224,255,103,0.35)]"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden md:inline">{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="flex items-center gap-2 shrink-0 pl-2 border-l border-white/10">
          <div className="hidden sm:flex flex-col items-end leading-tight">
            <span className="text-white text-xs font-medium">
              {user?.firstName ?? "Bonjour"}
            </span>
            <span className="text-white/40 text-[10px]">En ligne</span>
          </div>
          <div className="rounded-full ring-2 ring-[#E0FF67]/40 ring-offset-2 ring-offset-[#151425]">
            <UserButton />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
