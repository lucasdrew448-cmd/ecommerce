import Link from "next/link";

export default function NotFound() {
  return (
    <main>
      <section className="section not-found">
        <h1>Page not found</h1>
        <p>The product you are looking for cannot be found.</p>
        <Link href="/" className="button">
          Back to store
        </Link>
      </section>
    </main>
  );
}
