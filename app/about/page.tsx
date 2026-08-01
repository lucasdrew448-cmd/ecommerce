export default function AboutPage() {
  return (
    <main className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
          About Discus Fish Store
        </p>
        <h1 className="text-3xl font-bold text-slate-900">Premium discus fish, raised with care</h1>
        <p className="mt-4 max-w-2xl text-lg text-slate-600">
          We specialize in healthy, hand-picked discus fish for aquarists of every level.
          Our fish are quarantined and cared for by experts to ensure they arrive healthy and vibrant.
        </p>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8">
          <h2 className="text-xl font-semibold text-slate-900">Quality you can trust</h2>
          <p className="mt-3 text-slate-600">
            Every discus fish is carefully selected, quarantined, and monitored for health
            before it is offered for sale.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8">
          <h2 className="text-xl font-semibold text-slate-900">Expert support</h2>
          <p className="mt-3 text-slate-600">
            Our team is available to help with fish care, water parameters, and aquarium setup
            so you can raise thriving discus fish.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8">
          <h2 className="text-xl font-semibold text-slate-900">Safe shipping</h2>
          <p className="mt-3 text-slate-600">
            Fish are packed with care and shipped using reliable methods to ensure they arrive
            healthy at your door.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8">
          <h2 className="text-xl font-semibold text-slate-900">Freshwater specialists</h2>
          <p className="mt-3 text-slate-600">
            We focus on freshwater discus fish and provide the knowledge you need to create a
            beautiful aquarium.
          </p>
        </div>
      </section>
    </main>
  );
}