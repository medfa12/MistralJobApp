export const formatPrice = (amount: number, currency: string = 'usd'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount / 100);
};

export const formatInterval = (interval: 'month' | 'year'): string => {
  return interval === 'month' ? 'per month' : 'per year';
};

export const formatDate = (timestamp: number): string => {
  return new Date(timestamp * 1000).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

export const formatShortDate = (timestamp: number): string => {
  return new Date(timestamp * 1000).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

export const calculateDaysRemaining = (endTimestamp: number): number => {
  const now = Date.now();
  const end = endTimestamp * 1000;
  const diff = end - now;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

export const getStatusColor = (
  status: string
): 'green' | 'red' | 'yellow' | 'blue' | 'gray' => {
  switch (status) {
    case 'active':
      return 'green';
    case 'trialing':
      return 'blue';
    case 'canceled':
      return 'red';
    case 'past_due':
      return 'yellow';
    default:
      return 'gray';
  }
};

export const getStatusLabel = (status: string, cancelAtPeriodEnd: boolean): string => {
  if (cancelAtPeriodEnd) return 'Canceling';
  switch (status) {
    case 'active':
      return 'Active';
    case 'trialing':
      return 'Trial';
    case 'canceled':
      return 'Canceled';
    case 'past_due':
      return 'Past Due';
    default:
      return status;
  }
};

