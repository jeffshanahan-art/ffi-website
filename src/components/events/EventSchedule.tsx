import type { ScheduleItem } from '@/types';

export function EventSchedule({ schedule }: { schedule?: ScheduleItem[] }) {
  if (!schedule || schedule.length === 0) {
    return (
      <section className="py-10 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-serif text-2xl text-blue font-normal border-b border-gray pb-3 mb-6">Schedule</h2>
          <p className="text-slate italic">Schedule not available for this edition.</p>
        </div>
      </section>
    );
  }

  // Group by date
  const grouped: Record<string, ScheduleItem[]> = {};
  for (const item of schedule) {
    if (!grouped[item.date]) grouped[item.date] = [];
    grouped[item.date].push(item);
  }

  return (
    <section className="py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <h2 className="font-serif text-2xl text-blue font-normal border-b border-gray pb-3 mb-8">Schedule</h2>
        {Object.entries(grouped).map(([date, items]) => (
          <div key={date} className="mb-8">
            <h3 className="font-serif text-lg text-blue font-normal border-b border-gray pb-2 mb-4">{date}</h3>
            {items.map((item, i) => (
              <div key={i} className="flex items-baseline justify-between py-3 border-b border-gray">
                <div>
                  <p className="text-black text-sm">{item.event}</p>
                  {item.location && <p className="text-slate text-sm mt-0.5">{item.location}</p>}
                </div>
                <span className="text-slate text-sm shrink-0 ml-4">{item.time}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
