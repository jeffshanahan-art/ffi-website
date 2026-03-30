import { getSeriesRecord } from '@/lib/data';
import Image from 'next/image';
import Link from 'next/link';
import { LoginForm } from '@/components/auth/LoginForm';

export const metadata = {
  title: 'Login | Founding Fathers Invitational',
};

const footerColumns: { links: { href?: string; label: string; active: boolean }[] }[] = [
  {
    links: [
      { label: 'About the FFI', active: false },
      { label: 'The Course Rotation', active: false },
    ],
  },
  {
    links: [
      { label: 'History & Records', active: false },
      { label: 'Players', active: false },
    ],
  },
  {
    links: [
      { label: 'Photos', active: false },
      { label: 'Programs', active: false },
    ],
  },
  {
    links: [
      { href: '/contact', label: 'Contact', active: true },
    ],
  },
];

export default async function LoginPage() {
  const seriesRecord = await getSeriesRecord();

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-white">
          <div className="max-w-5xl mx-auto pt-12 pb-0 px-4">
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-blue font-normal">
              Founding Fathers Invitational
            </h1>
            <p className="mt-3 text-slate text-base md:text-lg">
              Est. 2018 &middot; Team Philly vs Team DC
            </p>
            <div className="mt-8 w-full overflow-hidden rounded-lg">
              <Image
                src="/images/hero-sunset.jpeg"
                alt="The Founding Fathers Invitational"
                width={1366}
                height={1024}
                className="w-full h-auto object-cover"
                priority
                unoptimized
              />
            </div>
          </div>
        </section>

        {/* The Series */}
        <section className="pt-2 pb-12 px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="font-serif text-3xl md:text-4xl text-blue font-normal pb-3 border-b border-[#e0e0e0]">
              The Series
            </h2>
            <div className="mt-10 flex items-center justify-center gap-8 md:gap-16">
              <div className="text-right">
                <p className="text-slate text-sm mb-2">Team Philly</p>
                <p className="font-serif text-4xl md:text-5xl text-blue">{seriesRecord.phillyWins}</p>
              </div>
              <div className="text-slate font-serif text-3xl md:text-4xl">&mdash;</div>
              <div className="text-left">
                <p className="text-slate text-sm mb-2">Team DC</p>
                <p className="font-serif text-4xl md:text-5xl text-blue">{seriesRecord.dcWins}</p>
              </div>
            </div>
            {seriesRecord.pending.length > 0 && (
              <p className="mt-6 text-center text-slate text-sm italic">
                {seriesRecord.pending.join(' & ')} Results Pending
              </p>
            )}
          </div>
        </section>

        <div className="max-w-5xl mx-auto px-4">
          <div className="border-t border-[#e0e0e0]" />
        </div>

        {/* Login Form */}
        <section className="py-12 px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="font-serif text-2xl text-blue font-normal text-center mb-8">
              Member Login
            </h2>
            <div className="max-w-sm mx-auto">
              <LoginForm />
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#0d1728]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-16 pb-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <Image
              src="/images/ffi-crest.png"
              alt="FFI"
              width={48}
              height={48}
              className="w-12 h-12"
              unoptimized
            />
            <p className="font-serif italic text-white/70 text-lg">
              &ldquo;Play well gentlemen. Don&rsquo;t forget to enjoy the walk.&rdquo;
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="border-t border-white/20" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {footerColumns.map((col, i) => (
              <div key={i} className="flex flex-col gap-3">
                {col.links.map((link) =>
                  link.active && link.href ? (
                    <Link
                      key={link.label}
                      href={link.href}
                      className="font-serif text-white/80 text-sm hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <span
                      key={link.label}
                      className="font-serif text-white/30 text-sm cursor-default"
                    >
                      {link.label}
                    </span>
                  )
                )}
              </div>
            ))}
          </div>
        </div>

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
    </div>
  );
}
