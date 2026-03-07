const benefits = [
  "Save Time",
  "Improve Cash Flow",
  "Reduce Manual Work",
  "Grow Your Business",
];

const Benefits = () => {
  return (
    <section className="bg-[#f7f2ea] py-16 text-[#1f1b16] dark:bg-slate-950 dark:text-white">
      <div className="mx-auto w-full max-w-6xl px-6">
        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#8a6d56] dark:text-slate-400">
            Benefits
          </p>
          <h2 className="text-3xl font-semibold">Built for modern teams</h2>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit) => (
            <div
              key={benefit}
              className="rounded-2xl border border-[#f2e6dc] bg-white/80 px-4 py-6 text-center text-sm font-semibold shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg dark:border-white/10 dark:bg-slate-900"
            >
              {benefit}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Benefits;
