export function EventWeather({ weather }: { weather?: string }) {
  if (!weather) return null;
  return (
    <section className="py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <h2 className="font-serif text-2xl text-blue font-normal border-b border-gray pb-3 mb-6">Weather</h2>
        <p className="text-slate leading-relaxed">{weather}</p>
      </div>
    </section>
  );
}
