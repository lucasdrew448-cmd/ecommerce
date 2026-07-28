export default function ContactPage() {
  return (
    <main className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
          Contact us
        </p>
        <h1 className="text-3xl font-bold text-slate-900">We’re here to help with your order</h1>
        <p className="mt-4 max-w-2xl text-lg text-slate-600">
          Reach out with questions about products, shipping, returns, or anything else related to
          your shopping experience.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8">
          <h2 className="text-xl font-semibold text-slate-900">Get in touch</h2>
          <div className="mt-6 space-y-4 text-slate-600">
            <div>
              <p className="font-medium text-slate-900">Email</p>
              <p>support@headlessstore.com</p>
            </div>
            <div>
              <p className="font-medium text-slate-900">Phone</p>
              <p>+1 (800) 555-0148</p>
            </div>
            <div>
              <p className="font-medium text-slate-900">Hours</p>
              <p>Monday–Friday, 8am–6pm PT</p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Send us a message</h2>
          <form className="mt-6 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Name</label>
              <input
                className="w-full rounded-2xl border border-slate-300 px-4 py-3"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
              <input
                className="w-full rounded-2xl border border-slate-300 px-4 py-3"
                type="email"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Message</label>
              <textarea
                className="w-full rounded-2xl border border-slate-300 px-4 py-3"
                rows={4}
                placeholder="How can we help?"
              />
            </div>
            <button
              type="submit"
              className="rounded-full bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              Send message
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
