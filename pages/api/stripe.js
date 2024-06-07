import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
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
    console.log("Managing subscription status change");
    console.log("Subscription ID:", subscriptionId);
    console.log("Customer ID:", customerId);
    console.log("Create Action:", createAction);

    // Update the subscription record
    const { error: subscriptionError } = await supabase
      .from("subscriptions")
      .update({
        status: createAction ? "active" : "inactive",
      })
      .eq("id", subscriptionId);

    if (subscriptionError) {
      console.log("Error updating subscription status:", subscriptionError);
      throw subscriptionError;
    }

    console.log("Subscription status updated successfully");
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
        console.log("Webhook secret not found");
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
            const updatedSubscription = event.data.object;
            console.log("Updated subscription data:", updatedSubscription);

            // Update the subscription record in the subscriptions table
            const { data: updatedSubscriptionData, error: updateError } =
              await supabase
                .from("subscriptions")
                .update({
                  status: updatedSubscription.status,
                  metadata: updatedSubscription.metadata,
                  price: updatedSubscription.items.data[0].price.id,
                  quantity: updatedSubscription.items.data[0].quantity,
                  cancel_at_period_end:
                    updatedSubscription.cancel_at_period_end,
                  current_period_start: new Date(
                    updatedSubscription.current_period_start * 1000
                  ).toISOString(),
                  current_period_end: new Date(
                    updatedSubscription.current_period_end * 1000
                  ).toISOString(),
                  ended_at: updatedSubscription.ended_at
                    ? new Date(
                        updatedSubscription.ended_at * 1000
                      ).toISOString()
                    : null,
                  cancel_at: updatedSubscription.cancel_at
                    ? new Date(
                        updatedSubscription.cancel_at * 1000
                      ).toISOString()
                    : null,
                  canceled_at: updatedSubscription.canceled_at
                    ? new Date(
                        updatedSubscription.canceled_at * 1000
                      ).toISOString()
                    : null,
                  trial_start: updatedSubscription.trial_start
                    ? new Date(
                        updatedSubscription.trial_start * 1000
                      ).toISOString()
                    : null,
                  trial_end: updatedSubscription.trial_end
                    ? new Date(
                        updatedSubscription.trial_end * 1000
                      ).toISOString()
                    : null,
                })
                .eq("id", updatedSubscription.id);

            if (updateError) {
              console.log("Error updating subscription:", updateError);
            } else {
              console.log("Subscription updated:", updatedSubscriptionData);
            }
            break;

          case "customer.subscription.deleted":
            const subscription = event.data.object;
            console.log("Subscription data:", subscription);
            await manageSubscriptionStatusChange(
              subscription.id,
              subscription.customer,
              event.type === "customer.subscription.created"
            );
            break;
          case "checkout.session.completed":
            const checkoutSession = event.data.object;
            console.log("Checkout session data:", checkoutSession);
            if (checkoutSession.mode === "subscription") {
              const subscriptionId = checkoutSession.subscription;
              const customerId = checkoutSession.customer;

              console.log(
                "Checkout session completed. Customer ID:",
                customerId
              );

              // Fetch the subscription object from Stripe
              const subscription = await stripe.subscriptions.retrieve(
                subscriptionId
              );
              console.log("Retrieved subscription data:", subscription);

              // Insert the subscription data into the subscriptions table
              const { data: subscriptionData, error: subscriptionError } =
                await supabase.from("subscriptions").insert({
                  id: subscription.id,
                  user_id: checkoutSession.client_reference_id,
                  status: subscription.status,
                  metadata: subscription.metadata,
                  price: subscription.items.data[0].price.id,
                  quantity: subscription.items.data[0].quantity,
                  cancel_at_period_end: subscription.cancel_at_period_end,
                  created: new Date(subscription.created * 1000).toISOString(),
                  current_period_start: new Date(
                    subscription.current_period_start * 1000
                  ).toISOString(),
                  current_period_end: new Date(
                    subscription.current_period_end * 1000
                  ).toISOString(),
                  ended_at: subscription.ended_at
                    ? new Date(subscription.ended_at * 1000).toISOString()
                    : null,
                  cancel_at: subscription.cancel_at
                    ? new Date(subscription.cancel_at * 1000).toISOString()
                    : null,
                  canceled_at: subscription.canceled_at
                    ? new Date(subscription.canceled_at * 1000).toISOString()
                    : null,
                  trial_start: subscription.trial_start
                    ? new Date(subscription.trial_start * 1000).toISOString()
                    : null,
                  trial_end: subscription.trial_end
                    ? new Date(subscription.trial_end * 1000).toISOString()
                    : null,
                });

              if (subscriptionError) {
                console.log("Error inserting subscription:", subscriptionError);
              } else {
                console.log("Subscription inserted:", subscriptionData);
              }
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
      console.log("Unhandled event type:", event.type);
      return res.status(200).json({ received: true });
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
