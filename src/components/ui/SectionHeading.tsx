export function SectionHeading({
  title,
  subtitle,
  className = ''
}: {
  title: string;
  subtitle?: string;
  className?: string;
}) {
  return (
    <div className={`text-left ${className}`}>
      <h2 className="font-serif text-3xl md:text-4xl text-blue font-normal">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-1 text-slate text-sm">
          {subtitle}
        </p>
      )}
    </div>
  );
}
