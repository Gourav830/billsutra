const PricingPlaceholder = () => {
  return (
    <section id="pricing" className="bg-white py-16 dark:bg-slate-950">
      <div className="mx-auto w-full max-w-6xl px-6">
        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#8a6d56] dark:text-slate-400">
            Pricing
          </p>
          <h2 className="text-3xl font-semibold text-[#1f1b16] dark:text-white">
            Simple plans for growing teams
          </h2>
          <p className="text-sm text-[#5c4b3b] dark:text-slate-300">
            Talk to us for the plan that fits your business size.
          </p>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              name: "Starter",
              price: "Free",
              desc: "For early stage businesses",
            },
            { name: "Growth", price: "₹1,499/mo", desc: "For scaling teams" },
            { name: "Pro", price: "Custom", desc: "For multi-location ops" },
          ].map((tier) => (
            <div
              key={tier.name}
              className="rounded-2xl border border-[#f2e6dc] bg-[#fff9f2] px-5 py-6 text-sm text-[#5c4b3b] dark:border-white/10 dark:bg-slate-900 dark:text-slate-300"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8a6d56]">
                {tier.name}
              </p>
              <p className="mt-2 text-2xl font-semibold text-[#1f1b16] dark:text-white">
                {tier.price}
              </p>
              <p className="mt-2">{tier.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingPlaceholder;
