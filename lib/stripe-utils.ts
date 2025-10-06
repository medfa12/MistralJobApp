import Stripe from "stripe";

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: "month" | "year";
  features: string[];
}

export interface UserSubscription {
  id: string;
  userId: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  stripePriceId: string;
  status: Stripe.Subscription.Status;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
}

export const SUBSCRIPTION_STATUS = {
  ACTIVE: "active",
  CANCELED: "canceled",
  INCOMPLETE: "incomplete",
  INCOMPLETE_EXPIRED: "incomplete_expired",
  PAST_DUE: "past_due",
  TRIALING: "trialing",
  UNPAID: "unpaid",
} as const;

export function formatPrice(amount: number, currency: string = "usd"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount / 100);
}

export function formatInterval(interval: string): string {
  return interval === "month" ? "Monthly" : interval === "year" ? "Yearly" : interval;
}

export function isSubscriptionActive(
  status: Stripe.Subscription.Status | string
): boolean {
  return status === SUBSCRIPTION_STATUS.ACTIVE || status === SUBSCRIPTION_STATUS.TRIALING;
}

export function getSubscriptionStatusColor(
  status: Stripe.Subscription.Status | string
): string {
  switch (status) {
    case SUBSCRIPTION_STATUS.ACTIVE:
      return "green";
    case SUBSCRIPTION_STATUS.TRIALING:
      return "blue";
    case SUBSCRIPTION_STATUS.PAST_DUE:
      return "orange";
    case SUBSCRIPTION_STATUS.CANCELED:
      return "red";
    default:
      return "gray";
  }
}

export function calculateDaysRemaining(endDate: Date): number {
  const now = new Date();
  const end = new Date(endDate);
  const diffTime = end.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
}

export async function getPriceWithProduct(
  stripe: Stripe,
  priceId: string
): Promise<{
  price: Stripe.Price;
  product: Stripe.Product;
}> {
  const price = await stripe.prices.retrieve(priceId, {
    expand: ["product"],
  });

  return {
    price,
    product: price.product as Stripe.Product,
  };
}

export function validateWebhookSignature(
  stripe: Stripe,
  payload: string | Buffer,
  signature: string,
  secret: string
): Stripe.Event {
  return stripe.webhooks.constructEvent(payload, signature, secret);
}

