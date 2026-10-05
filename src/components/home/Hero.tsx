import Image from 'next/image';
import Link from 'next/link';
import { toOrdinal } from '@/lib/utils';

export interface CurrentEdition {
  year: string;
  edition: number;
  dateDisplay?: string;
}

export function Hero({ current }: { current?: CurrentEdition | null }) {
  return (
    <section className="bg-white">
      <div className="max-w-5xl mx-auto pt-12 pb-0 px-4">
        <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-blue font-normal">
          Founding Fathers Invitational
        </h1>

        <p className="mt-3 text-slate text-base md:text-lg">
          Est. 2018 &middot; Team Philly vs Team DC
        </p>

        {current && (
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={`/events/${current.year}`}
              className="inline-flex items-center gap-2 bg-blue text-white font-serif px-6 py-3 hover:opacity-90 transition-opacity"
            >
              {toOrdinal(current.edition)} Edition{current.dateDisplay ? ` \u00b7 ${current.dateDisplay}` : ''}{' '}&rarr;
            </Link>
          </div>
        )}

        <div className="mt-8 w-full overflow-hidden rounded-lg">
          <Image
            src="/images/hero-silhouette1.jpeg"
            alt="The Founding Fathers Invitational group photo at Applebrook Golf Club"
            width={1366}
            height={1024}
            className="w-full h-auto md:h-[42vh] md:object-cover md:object-[center_40%]"
            priority
            unoptimized
          />
        </div>

        <a
          href="#series"
          aria-label="Scroll to the series record"
          className="hidden md:flex flex-col items-center gap-1 pt-4 text-xs uppercase tracking-widest text-slate hover:text-blue transition-colors"
        >
          Scroll
          <svg className="w-5 h-5 animate-bounce" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </a>
      </div>
    </section>
  );
}
