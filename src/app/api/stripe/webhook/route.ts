import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { createServiceClient } from "@/lib/supabase/service";

// Stripe retries payments automatically during `past_due` before ever
// canceling, and `trialing` has legitimate access - only genuinely
// inactive states (canceled, unpaid, incomplete, incomplete_expired,
// paused) should downgrade a freelancer to the free plan.
const ACTIVE_SUBSCRIPTION_STATUSES = new Set(["active", "trialing", "past_due"]);

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature!,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const service = createServiceClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const freelancerId = session.client_reference_id;

      if (!freelancerId) {
        console.error(
          "Stripe webhook: checkout.session.completed missing client_reference_id",
          session.id,
        );
        return NextResponse.json({ error: "Missing client_reference_id" }, { status: 400 });
      }

      const { error } = await service
        .from("freelancers")
        .update({
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: session.subscription as string,
          subscription_status: "active",
        })
        .eq("id", freelancerId);

      if (error) {
        console.error(
          "Stripe webhook: failed to activate freelancer after checkout",
          freelancerId,
          error,
        );
        return NextResponse.json({ error: "Database update failed" }, { status: 500 });
      }
      break;
    }

    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const status = ACTIVE_SUBSCRIPTION_STATUSES.has(subscription.status) ? "active" : "free";

      const { error } = await service
        .from("freelancers")
        .update({ subscription_status: status })
        .eq("stripe_customer_id", subscription.customer as string);

      if (error) {
        console.error(
          "Stripe webhook: failed to sync subscription status",
          subscription.customer,
          error,
        );
        return NextResponse.json({ error: "Database update failed" }, { status: 500 });
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
