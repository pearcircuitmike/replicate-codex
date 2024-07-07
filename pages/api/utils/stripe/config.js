import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: null,
  appInfo: {
    name: "Next.js Subscription Starter",
    version: "0.0.0",
    url: "https://github.com/vercel/nextjs-subscription-payments",
  },
});
