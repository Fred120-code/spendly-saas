"use client";
import { UserButton, useUser } from "@clerk/nextjs";
import { ArrowLeftRight, Bot, ChartLine, Wallet } from "lucide-react";
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
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: ChartLine,
    },
    {
      href: "/budgets",
      label: "Budgets",
      icon: Wallet,
    },
    {
      href: "/transactions",
      label: "Transactions",
      icon: ArrowLeftRight,
    },
  ];

  //permet de recuperer le chemin de la page courante
  const pathname = usePathname();

  //affiche dynamiquement les liens de navigation
  const renderLinks = () => {
    return (
      <div className="flex justify-center items-center gap-10 mr-10">
        {navLinks.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          const activeClass = isActive
            ? " bg-[#c4e933] text-white"
            : " text-white";

          return (
            <Link
              href={href}
              key={href}
              className={` outline-none p-2 flex gap-2  items-center rounded-sm ${activeClass} font-semibold text-xs`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          );
        })}
      </div>
    );
  };
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mt-5">
        <div className="">
          <h1 className="text-white hidden md:block font-bold text-[0.75rem] leading-[1.25rem] sm:text-[0.5rem] sm:leading-[1.5rem] md:text-[0.75rem] md:leading-[1.75rem] lg:text-[1rem] lg:leading-[2rem]">
            Spendly <span className="text-[#c4e933]">AI</span>
          </h1>
        </div>
        <div className="flex items-center sm:gap-6 ">
          {renderLinks()}
          <div className="flex flex-col items-center ">
            <UserButton />
            <h2 className="text-white text-xs">Vous</h2>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
