export default function AboutPage() {
  return (
    <main className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
          About this storefront
        </p>
        <h1 className="text-3xl font-bold text-slate-900">Built for a modern headless commerce experience</h1>
        <p className="mt-4 max-w-2xl text-lg text-slate-600">
          This Next.js storefront is designed to work with composable commerce APIs,
          giving you a fast and flexible frontend for browsing products, managing a cart,
          and customizing the shopping experience.
        </p>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8">
          <h2 className="text-xl font-semibold text-slate-900">Composable by design</h2>
          <p className="mt-3 text-slate-600">
            The storefront uses isolated UI components and a simple commerce layer so you can swap
            in different APIs or services without rewriting the whole experience.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8">
          <h2 className="text-xl font-semibold text-slate-900">Responsive and ready</h2>
          <p className="mt-3 text-slate-600">
            Header, product, cart, and footer layouts all adapt smoothly from mobile to desktop,
            keeping the experience polished across screen sizes.
          </p>
        </div>
      </section>
    </main>
  );
}
