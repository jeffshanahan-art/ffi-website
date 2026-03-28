import Image from 'next/image';

export function Hero() {
  return (
    <section className="bg-white">
      <div className="max-w-5xl mx-auto pt-12 pb-8 px-4">
        <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-blue font-normal">
          Founding Fathers Invitational
        </h1>

        <p className="mt-3 text-slate text-base md:text-lg">
          Est. 2018 &middot; Team Philly vs Team DC
        </p>

        <div className="mt-8 w-full overflow-hidden rounded-lg">
          <Image
            src="/images/hero.jpeg"
            alt="The Founding Fathers Invitational group photo at Applebrook Golf Club"
            width={1366}
            height={1024}
            className="w-full h-auto object-cover"
            priority
            unoptimized
          />
        </div>
      </div>
    </section>
  );
}
