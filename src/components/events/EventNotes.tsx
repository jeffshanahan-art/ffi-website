export function EventNotes({ notes }: { notes?: string }) {
  if (!notes) return null;
  return (
    <section className="py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <h2 className="font-serif text-2xl text-blue font-normal border-b border-gray pb-3 mb-6">The Story</h2>
        <p className="text-black leading-loose text-base">{notes}</p>
      </div>
    </section>
  );
}
