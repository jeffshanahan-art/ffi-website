import Link from 'next/link';

const links = [
  {
    href: '/history',
    title: 'History & Records',
    description: 'Nine editions of glory, heartbreak, and questionable handicaps.',
  },
  {
    href: '/players',
    title: 'Players',
    description: 'The men who have answered the call. Some more than once.',
  },
  {
    href: '/photos',
    title: 'Photo Gallery',
    description: 'Photographic evidence that this actually happens.',
  },
];

export function QuickLinks() {
  return (
    <section className="py-12 px-4">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="group block"
          >
            <h3 className="font-serif text-xl text-blue group-hover:underline transition-colors">
              {link.title}
            </h3>
            <p className="text-slate text-sm mt-2 leading-relaxed">
              {link.description}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
