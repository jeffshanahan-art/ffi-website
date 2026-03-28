export function GoldDivider({ className = '' }: { className?: string }) {
  return (
    <div className={`max-w-5xl mx-auto px-4 my-2 ${className}`}>
      <div className="h-px bg-[#e0e0e0]" />
    </div>
  );
}
