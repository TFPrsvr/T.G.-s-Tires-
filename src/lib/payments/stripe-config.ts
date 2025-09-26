import { loadStripe, Stripe } from '@stripe/stripe-js';

// Make sure to replace with your actual Stripe publishable key
let stripePromise: Promise<Stripe | null>;

const getStripe = () => {
  if (!stripePromise) {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

    if (!publishableKey) {
      console.error('Stripe publishable key is not set in environment variables');
      throw new Error('Stripe configuration error');
    }

    stripePromise = loadStripe(publishableKey);
  }
  return stripePromise;
};

export default getStripe;

// Stripe configuration constants
export const STRIPE_CONFIG = {
  // Currency for transactions
  CURRENCY: 'usd',

  // Payment method types to accept
  PAYMENT_METHOD_TYPES: ['card'] as const,

  // Automatic payment methods
  AUTOMATIC_PAYMENT_METHODS: {
    enabled: true,
  },

  // Appearance customization for Stripe Elements
  APPEARANCE: {
    theme: 'stripe' as const,
    variables: {
      colorPrimary: '#2563eb',
      colorBackground: '#ffffff',
      colorText: '#1f2937',
      colorDanger: '#df1b41',
      fontFamily: 'Inter, system-ui, sans-serif',
      spacingUnit: '4px',
      borderRadius: '12px',
    },
    rules: {
      '.Input': {
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      },
      '.Input:focus': {
        border: '1px solid #2563eb',
        boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.1)',
      },
      '.Label': {
        color: '#374151',
        fontWeight: '600',
        marginBottom: '6px',
      },
    },
  },
} as const;

// Helper function to format currency
export const formatCurrency = (amount: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount / 100); // Stripe amounts are in cents
};

// Helper function to convert dollars to cents for Stripe
export const dollarsToStripeAmount = (dollars: number): number => {
  return Math.round(dollars * 100);
};

// Helper function to convert Stripe amount (cents) to dollars
export const stripeAmountToDollars = (amount: number): number => {
  return amount / 100;
};