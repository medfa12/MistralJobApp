import { NextApiRequest, NextApiResponse } from "next";
import { buffer } from "micro";
import Stripe from "stripe";
import { prisma } from "@/lib/db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

function safeTimestampToDate(timestamp: number | null | undefined): Date | null {
  if (!timestamp || typeof timestamp !== 'number' || isNaN(timestamp)) {
    return null;
  }
  const date = new Date(timestamp * 1000);
  return isNaN(date.getTime()) ? null : date;
}

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const buf = await buffer(req);
  const sig = req.headers["stripe-signature"];

  if (!sig) {
    return res.status(400).json({ error: "Missing stripe-signature header" });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  console.log(`Processing webhook event: ${event.type}`);

  try {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const user = await prisma.user.findFirst({
          where: { stripeCustomerId: customerId },
        });

        if (!user) {
          console.error(`User not found for customer: ${customerId}`);
          return res.status(404).json({ error: "User not found" });
        }

        const isActive = ["active", "trialing"].includes(subscription.status);
        const periodEnd = safeTimestampToDate(subscription.current_period_end);

        await prisma.user.update({
          where: { id: user.id },
          data: {
            isStripeActivated: isActive,
            stripeSubscriptionId: subscription.id,
            stripePriceId: subscription.items.data[0]?.price.id,
            stripeCurrentPeriodEnd: periodEnd,
          },
        });

        console.log(
          `Subscription ${subscription.id} ${event.type} for user ${user.id}, status: ${subscription.status}`
        );
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const user = await prisma.user.findFirst({
          where: { stripeCustomerId: customerId },
        });

        if (!user) {
          console.error(`User not found for customer: ${customerId}`);
          return res.status(404).json({ error: "User not found" });
        }

        await prisma.user.update({
          where: { id: user.id },
          data: {
            isStripeActivated: false,
            stripeSubscriptionId: null,
            stripePriceId: null,
            stripeCurrentPeriodEnd: null,
          },
        });

        console.log(`Subscription deleted for user ${user.id}`);
        break;
      }

      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        if (session.mode === "subscription") {
          const customerId = session.customer as string;
          const subscriptionId = session.subscription as string;

          const subscription = await stripe.subscriptions.retrieve(
            subscriptionId
          );

          const user = await prisma.user.findUnique({
            where: { email: session.customer_details?.email! },
          });

          if (!user) {
            console.error(
              `User not found for email: ${session.customer_details?.email}`
            );
            return res.status(404).json({ error: "User not found" });
          }

          const periodEnd = safeTimestampToDate(subscription.current_period_end);

          await prisma.user.update({
            where: { id: user.id },
            data: {
              stripeCustomerId: customerId,
              stripeSubscriptionId: subscriptionId,
              stripePriceId: subscription.items.data[0]?.price.id,
              isStripeActivated: true,
              stripeCurrentPeriodEnd: periodEnd,
            },
          });

          console.log(`Checkout completed for user ${user.id}`);
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            invoice.subscription as string
          );
          const customerId = subscription.customer as string;

          const user = await prisma.user.findFirst({
            where: { stripeCustomerId: customerId },
          });

          if (user) {
            const periodEnd = safeTimestampToDate(subscription.current_period_end);

            await prisma.user.update({
              where: { id: user.id },
              data: {
                isStripeActivated: true,
                stripeCurrentPeriodEnd: periodEnd,
              },
            });
            console.log(`Payment succeeded for user ${user.id}`);
          }
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            invoice.subscription as string
          );
          const customerId = subscription.customer as string;

          const user = await prisma.user.findFirst({
            where: { stripeCustomerId: customerId },
          });

          if (user) {
            await prisma.user.update({
              where: { id: user.id },
              data: {
                isStripeActivated: false,
              },
            });
            console.log(`Payment failed for user ${user.id}`);
          }
        }
        break;
      }

      case "customer.created":
      case "customer.updated": {
        const customer = event.data.object as Stripe.Customer;
        console.log(`Customer ${event.type}: ${customer.id}`);
        break;
      }

      case "payment_intent.created":
      case "payment_intent.succeeded":
      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`Payment intent ${event.type}: ${paymentIntent.id}`);
        break;
      }

      case "charge.failed": {
        const charge = event.data.object as Stripe.Charge;
        console.log(`Charge failed: ${charge.id}`);
        break;
      }

      case "payment_method.attached": {
        const paymentMethod = event.data.object as Stripe.PaymentMethod;
        console.log(`Payment method attached: ${paymentMethod.id}`);
        break;
      }

      case "invoice.updated":
      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        console.log(`Invoice ${event.type}: ${invoice.id}`);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (error: any) {
    console.error(`Error processing webhook: ${error.message}`);
    res.status(500).json({ error: `Webhook handler failed: ${error.message}` });
  }
}
