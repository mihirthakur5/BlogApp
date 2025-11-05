"use client";

import Link from "next/link";
import { useState } from "react";
import { useProfileQuery } from "../../src/services/api";
import { TbMenu2, TbX } from "react-icons/tb";
import MobileNav from "./MobileNav";

export default function Header() {
  const { data: profile, isLoading } = useProfileQuery();

  const [open, setOpen] = useState(false);

  const profileId =
    (profile as any)?.id ?? (profile as any)?.userId ?? (profile as any)?.sub;

  const NavComp = MobileNav(profile, profileId, isLoading, setOpen);

  return (
    <header className="bg-white sticky top-0 shadow-sm min-h-18 p-2">
      <div className="max-w-5xl mx-auto py-2 flex items-center justify-between">
        <Link href="/" className="text-2xl font-semibold text-black">
          My Blog
        </Link>
        {/* Desktop nav */}
        <nav className="hidden md:block">{NavComp}</nav>
        {/* Mobile hamburger */}
        <button
          className="md:hidden inline-flex items-center justify-center p-2 rounded hover:bg-gray-100"
          aria-label="Open menu"
          onClick={() => setOpen(true)}
        >
          <TbMenu2 size={22} />
        </button>
      </div>

      {/* Mobile sidebar drawer */}
      {open && (
        <div className="relative">
          <div className="md:hidden fixed inset-0 z-50">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setOpen(false)}
            />
            {/* Drawer */}
            <aside className="absolute right-0 top-0 h-full w-72 bg-white shadow-xl p-4 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <span className="text-base font-semibold">Menu</span>
                <button
                  aria-label="Close menu"
                  onClick={() => setOpen(false)}
                  className="p-2 rounded hover:bg-gray-100"
                >
                  <TbX size={22} />
                </button>
              </div>
              <nav className="mt-2 flex flex-col items-center">{NavComp}</nav>
            </aside>
          </div>
        </div>
      )}
    </header>
  );
}
