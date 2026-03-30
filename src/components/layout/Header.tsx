'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const leftLinks = [
  { href: '/history', label: 'History' },
  { href: '/players', label: 'Players' },
];

const rightLinks = [
  { href: '/photos', label: 'Photos' },
  { href: '/about', label: 'About' },
];

const allLinks = [...leftLinks, ...rightLinks];

export function Header({ disableLinks = false }: { disableLinks?: boolean }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#e0e0e0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Desktop Header */}
        <div className="relative flex items-center justify-between h-[68px]">
          {/* Left: Menu toggle (mobile) + nav links (desktop) */}
          <div className="flex items-center gap-8">
            {/* Mobile menu toggle */}
            {!disableLinks && (
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden font-sans text-[#3172b6] text-base hover:opacity-70 transition-opacity"
                aria-label="Toggle menu"
              >
                {mobileOpen ? 'Close' : 'Menu'}
              </button>
            )}
            {disableLinks && <div className="w-12 md:hidden" />}

            {/* Desktop left nav */}
            <nav className="hidden md:flex items-center gap-8">
              {leftLinks.map((link) =>
                disableLinks ? (
                  <span
                    key={link.href}
                    className="font-sans text-[#3172b6]/40 text-base cursor-default"
                  >
                    {link.label}
                  </span>
                ) : (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="font-sans text-[#3172b6] text-base hover:opacity-70 transition-opacity"
                  >
                    {link.label}
                  </Link>
                )
              )}
            </nav>
          </div>

          {/* Center: FFI Crest Logo */}
          {disableLinks ? (
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <Image
                src="/images/ffi-crest.png"
                alt="FFI"
                width={44}
                height={44}
                className="w-11 h-11"
                unoptimized
              />
            </div>
          ) : (
            <Link
              href="/"
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            >
              <Image
                src="/images/ffi-crest.png"
                alt="FFI"
                width={44}
                height={44}
                className="w-11 h-11"
                unoptimized
              />
            </Link>
          )}

          {/* Right: nav links (desktop only) */}
          <nav className="hidden md:flex items-center gap-8">
            {rightLinks.map((link) =>
              disableLinks ? (
                <span
                  key={link.href}
                  className="font-sans text-[#3172b6]/40 text-base cursor-default"
                >
                  {link.label}
                </span>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className="font-sans text-[#3172b6] text-base hover:opacity-70 transition-opacity"
                >
                  {link.label}
                </Link>
              )
            )}
          </nav>

          {/* Empty spacer for mobile right side */}
          <div className="w-12 md:hidden" />
        </div>

        {/* Mobile Nav Dropdown */}
        {mobileOpen && !disableLinks && (
          <nav className="md:hidden pb-6 border-t border-[#e0e0e0] pt-4">
            {allLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block py-3 font-sans text-[#3172b6] text-base hover:opacity-70 transition-opacity"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
