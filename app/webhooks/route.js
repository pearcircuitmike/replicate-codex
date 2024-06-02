import Stripe from "stripe";
import {
  upsertProductRecord,
  upsertPriceRecord,
  manageSubscriptionStatusChange,
  deleteProductRecord,
  deletePriceRecord,
} from "@/utils/supabase/admin";

const stripe = new Stripe(process.env.STRIPE_WEBHOOK_SECRET, {
  apiVersion: "2020-08-27",
});

const relevantEvents = new Set([
  "product.created",
  "product.updated",
  "product.deleted",
  "price.created",
  "price.updated",
  "price.deleted",
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
          case "product.created":
          case "product.updated":
            await upsertProductRecord(event.data.object);
            break;
          case "price.created":
          case "price.updated":
            await upsertPriceRecord(event.data.object);
            break;
          case "price.deleted":
            await deletePriceRecord(event.data.object);
            break;
          case "product.deleted":
            await deleteProductRecord(event.data.object);
            break;
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
              await manageSubscriptionStatusChange(
                subscriptionId,
                checkoutSession.customer,
                true
              );
            }
            break;

          case "payment_intent.created": // Add this case
            const paymentIntent = event.data.object;
            // Handle the payment intent created event
            console.log("Payment intent created:", paymentIntent);
            break;
          default:
            throw new Error("Unhandled relevant event!");
        }
      } catch (error) {
        console.log(error);
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
