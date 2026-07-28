import CartClient from "@/components/CartClient";

export default function CartPage() {
  return (
    <main>
      <section className="section">
        <div className="section-header">
          <h1>Your cart</h1>
          <p>Cart state is stored in the browser and can be replaced with a headless cart API.</p>
        </div>
        <CartClient />
      </section>
    </main>
  );
}
