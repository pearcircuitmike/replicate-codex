import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_WEBHOOK_SECRET, {
  apiVersion: "2020-08-27",
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const relevantEvents = new Set([
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "payment_intent.created",
]);

export const config = {
  api: {
    bodyParser: false,
  },
};

async function manageSubscriptionStatusChange(
  subscriptionId,
  customerId,
  createAction = false
) {
  try {
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("stripe_customer_id", customerId) // Ensure this field is of type text or varchar
      .single();

    if (profileError) {
      throw profileError;
    }

    // Update the subscription record
    const { error: subscriptionError } = await supabase
      .from("profiles")
      .update({
        stripe_subscription_id: subscriptionId,
        stripe_subscription_status: createAction ? "active" : "inactive",
      })
      .eq("id", profileData.id);

    if (subscriptionError) {
      throw subscriptionError;
    }
  } catch (error) {
    console.log("Error in manageSubscriptionStatusChange:", error);
    throw error;
  }
}

export default async function handler(req, res) {
  if (req.method === "POST") {
    const rawBody = await getRawBody(req);
    const sig = req.headers["stripe-signature"];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    let event;

    try {
      if (!sig || !webhookSecret) {
        return res.status(400).send("Webhook secret not found.");
      }
      event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
      console.log(`🔔  Webhook received: ${event.type}`);
    } catch (error) {
      console.log(`❌ Error message: ${error.message}`);
      return res.status(400).send(`Webhook Error: ${error.message}`);
    }

    if (relevantEvents.has(event.type)) {
      try {
        switch (event.type) {
          case "customer.subscription.created":
          case "customer.subscription.updated":
          case "customer.subscription.deleted":
            const subscription = event.data.object;
            await manageSubscriptionStatusChange(
              subscription.id,
              subscription.customer,
              event.type === "customer.subscription.created"
            );
            break;
          case "checkout.session.completed":
            const checkoutSession = event.data.object;
            if (checkoutSession.mode === "subscription") {
              const subscriptionId = checkoutSession.subscription;
              const customerId = checkoutSession.customer;
              const profileId = checkoutSession.client_reference_id; // Extract the profile ID from metadata

              console.log(
                "Checkout session completed. Customer ID:",
                customerId
              );

              console.lo;

              // Update the user's profile with the actual Stripe customerId
              const { data: updatedProfileData, error: updateError } =
                await supabase
                  .from("profiles")
                  .update({ stripe_customer_id: customerId }) // Ensure this field is of type text or varchar
                  .eq("id", profileId);

              if (updateError) {
                console.log("Error updating stripe_customer_id:", updateError);
              } else {
                console.log(
                  "Profile updated with stripe_customer_id:",
                  updatedProfileData
                );
              }

              await manageSubscriptionStatusChange(
                subscriptionId,
                customerId,
                true
              );
            }
            break;
          case "payment_intent.created":
            const paymentIntent = event.data.object;
            console.log("Payment intent created:", paymentIntent);
            break;
          default:
            throw new Error("Unhandled relevant event!");
        }
      } catch (error) {
        console.log("Error in webhook handler:", error);
        return res
          .status(400)
          .send("Webhook handler failed. View your Next.js function logs.");
      }
    } else {
      return res.status(400).send(`Unsupported event type: ${event.type}`);
    }

    return res.status(200).json({ received: true });
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
}

async function getRawBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks).toString();
}
