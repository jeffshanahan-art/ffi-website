export function EventCourses({ courses, hostCity }: { courses: string[]; hostCity: string }) {
  const areaLabel = hostCity === 'philly' ? 'Philadelphia Area' : hostCity === 'dc' ? 'Washington, DC Area' : hostCity;

  return (
    <section className="py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <h2 className="font-serif text-2xl text-blue font-normal border-b border-gray pb-3 mb-6">
          {courses.length === 1 ? 'Course' : 'Courses'}
        </h2>
        {courses.map((course) => (
          <div
            key={course}
            className="flex items-center justify-between py-3 border-b border-gray"
          >
            <span className="text-black">{course}</span>
            <span className="text-slate text-sm">{areaLabel}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
