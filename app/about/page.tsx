export default function AboutPage() {
  return (
    <main className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
          About Used Dirt Bike Store
        </p>
        <h1 className="text-3xl font-bold text-slate-900">Quality used dirt bikes, inspected with care</h1>
        <p className="mt-4 max-w-2xl text-lg text-slate-600">
          We specialize in quality, hand-picked used dirt bikes for riders of every level.
          Our bikes are inspected and serviced by experts to ensure they arrive ready to ride.
        </p>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8">
          <h2 className="text-xl font-semibold text-slate-900">Quality you can trust</h2>
          <p className="mt-3 text-slate-600">
            Every used dirt bike is carefully selected, inspected, and serviced for performance
            before it is offered for sale.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8">
          <h2 className="text-xl font-semibold text-slate-900">Expert support</h2>
          <p className="mt-3 text-slate-600">
            Our team is available to help with bike maintenance, parts, and off-road riding
            so you can enjoy a reliable dirt bike.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8">
          <h2 className="text-xl font-semibold text-slate-900">Safe shipping</h2>
          <p className="mt-3 text-slate-600">
            Bikes are crated with care and shipped using reliable methods to ensure they arrive
            ready to ride at your door.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8">
          <h2 className="text-xl font-semibold text-slate-900">Off-road specialists</h2>
          <p className="mt-3 text-slate-600">
            We focus on used dirt bikes and provide the knowledge you need to hit the trails
            with confidence.
          </p>
        </div>
      </section>
    </main>
  );
}