import Link from 'next/link';
import Image from 'next/image';

const footerColumns = [
  {
    links: [
      { href: '/about', label: 'About the FFI' },
      { href: '/about#course-rotation', label: 'The Course Rotation' },
    ],
  },
  {
    links: [
      { href: '/history', label: 'History & Records' },
      { href: '/players', label: 'Players' },
    ],
  },
  {
    links: [
      { href: '/photos', label: 'Photos' },
      { href: '/programs', label: 'Programs' },
    ],
  },
  {
    links: [
      { href: '/contact', label: 'Contact' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-[#0d1728]">
      {/* Top section: logo + tagline */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-16 pb-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <Link href="/">
            <Image
              src="/images/ffi-crest.png"
              alt="FFI"
              width={48}
              height={48}
              className="w-12 h-12"
              unoptimized
            />
          </Link>
          <p className="font-serif italic text-white/70 text-lg">
            &ldquo;Play well gentlemen. Don&rsquo;t forget to enjoy the walk.&rdquo;
          </p>
        </div>
      </div>

      {/* Separator */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="border-t border-white/20" />
      </div>

      {/* Link columns */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {footerColumns.map((col, i) => (
            <div key={i} className="flex flex-col gap-3">
              {col.links.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="font-serif text-white/80 text-sm hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom copyright */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pb-16">
        <div className="border-t border-white/20 pt-6 flex items-center justify-between">
          <p className="text-white/40 text-xs">
            &copy; 2025 Founding Fathers Invitational
          </p>
          <Link href="/admin" className="text-white/20 text-xs hover:text-white/50 transition-colors">
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
