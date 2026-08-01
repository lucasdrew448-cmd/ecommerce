import { NextResponse } from "next/server";
import { placeOrder } from "@/lib/commerce";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const { items, customer_email, customer_name, shipping_address, shipping_destination, shipping_method, shipping_cost, total_price, card_number, card_name, card_expiry, card_cvv, billing_address, billing_city, billing_state, billing_zip, billing_country } = payload ?? {};

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Order must include at least one item." }, { status: 400 });
    }

    if (typeof customer_email !== "string" || !customer_email.trim()) {
      return NextResponse.json({ error: "Customer email is required." }, { status: 400 });
    }

    if (typeof customer_name !== "string" || !customer_name.trim()) {
      return NextResponse.json({ error: "Customer name is required." }, { status: 400 });
    }

    if (typeof shipping_address !== "string" || !shipping_address.trim()) {
      return NextResponse.json({ error: "Shipping address is required." }, { status: 400 });
    }

    const order = await placeOrder({
      items,
      customer_email,
      customer_name,
      shipping_address,
      shipping_destination: shipping_destination || "domestic",
      shipping_method: shipping_method || "standard",
      shipping_cost: Number(shipping_cost) || 0,
      total_price: Number(total_price) || 0,
      card_number: String(card_number || ""),
      card_name: String(card_name || customer_name),
      card_expiry: String(card_expiry || ""),
      card_cvv: String(card_cvv || ""),
      billing_address: String(billing_address || shipping_address),
      billing_city: String(billing_city || ""),
      billing_state: String(billing_state || ""),
      billing_zip: String(billing_zip || ""),
      billing_country: String(billing_country || ""),
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to place order." },
      { status: 500 }
    );
  }
}