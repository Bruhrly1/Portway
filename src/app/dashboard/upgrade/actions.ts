"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { stripe } from "@/lib/stripe";

export async function startCheckout() {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login");
  }

  const supabase = await createClient();
  const { data: freelancer } = await supabase
    .from("freelancers")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .single();

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
    customer: freelancer?.stripe_customer_id ?? undefined,
    customer_email: freelancer?.stripe_customer_id ? undefined : user.email || undefined,
    client_reference_id: user.id,
    success_url: `${process.env.SITE_URL}/dashboard?upgraded=1`,
    cancel_url: `${process.env.SITE_URL}/dashboard/upgrade`,
  });

  redirect(session.url!);
}

export async function openBillingPortal() {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login");
  }

  const supabase = await createClient();

  const { data: freelancer } = await supabase
    .from("freelancers")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .single();

  if (!freelancer?.stripe_customer_id) {
    redirect("/dashboard/settings");
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: freelancer.stripe_customer_id,
    return_url: `${process.env.SITE_URL}/dashboard/settings`,
  });

  redirect(session.url);
}
