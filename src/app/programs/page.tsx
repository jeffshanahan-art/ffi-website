import type { Metadata } from 'next';
import { SectionHeading } from '@/components/ui/SectionHeading';

export const metadata: Metadata = {
  title: 'Programs — FFI',
  description:
    'Welcome letters and tournament programs from every edition of the Founding Fathers Invitational.',
};

const programs = [
  {
    year: '2025',
    edition: '9th Edition',
    displayYear: '2025',
    items: [
      { label: 'Welcome Letter', href: '/programs/welcome-letter-2025.pdf' },
    ],
  },
  {
    year: '2024',
    edition: '8th Edition',
    displayYear: '2024',
    items: [
      { label: 'Tournament Program', href: '/programs/program-2024.pdf' },
    ],
  },
  {
    year: '2023',
    edition: '7th Edition',
    displayYear: '2023',
    items: [
      { label: 'Welcome Letter', href: '/programs/welcome-letter-2023.pdf' },
    ],
  },
  {
    year: '2022',
    edition: '6th Edition',
    displayYear: '2022',
    items: [
      { label: 'Tournament Program', href: '/programs/program-2022.pdf' },
    ],
  },
  {
    year: '2021',
    edition: '5th Edition',
    displayYear: '2021',
    items: [
      { label: 'Welcome Letter', href: '/programs/welcome-letter-2021.pdf' },
    ],
  },
  {
    year: '2020',
    edition: '4th Edition',
    displayYear: '2020',
    items: [
      { label: 'Welcome Letter', href: '/programs/welcome-letter-2020.pdf' },
    ],
  },
  {
    year: '2019',
    edition: '3rd Edition',
    displayYear: '2019',
    items: [
      { label: 'Welcome Letter', href: '/programs/welcome-letter-2019.pdf' },
    ],
  },
];

export default function ProgramsPage() {
  return (
    <main className="min-h-screen">
      <div className="max-w-3xl mx-auto px-4 pt-12 pb-8">
        <SectionHeading
          title="Programs"
          subtitle="Welcome letters and tournament programs from across the series."
        />
        <div className="border-b border-gray mt-6" />
      </div>

      <div className="max-w-3xl mx-auto px-4 pb-16">
        <div className="space-y-8 mt-6">
          {programs.map((edition) => (
            <div key={edition.year} className="border-b border-gray pb-6">
              <div className="flex items-baseline justify-between">
                <h3 className="font-serif text-xl text-blue font-normal">
                  {edition.displayYear}
                </h3>
                <span className="text-slate text-sm">{edition.edition}</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-4">
                {edition.items.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-blue hover:text-blue/70 transition-colors"
                  >
                    <svg
                      className="w-4 h-4 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                      />
                    </svg>
                    {item.label}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
