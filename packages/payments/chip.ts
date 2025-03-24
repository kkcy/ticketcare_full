import 'server-only';
import crypto from 'node:crypto';
import { keys } from './keys';

/**
 * Chip-In Asia payment gateway client
 * Documentation: https://docs.chip-in.asia/chip-collect/overview/introduction
 */
export class ChipClient {
  // private readonly apiKey: string;
  private readonly secretKey: string;
  private readonly baseUrl: string;
  private readonly brand: string;

  constructor() {
    const config = keys();
    // this.apiKey = config.CHIP_API_KEY || '';
    this.secretKey = config.CHIP_SECRET_KEY || '';
    this.baseUrl = config.CHIP_BASE_URL || 'https://gate.chip-in.asia/api/v1';
    this.brand = config.CHIP_BRAND_ID || '';
  }

  /**
   * Create a new payment
   * @param params Payment creation parameters
   * @returns Payment creation response
   */
  async createPayment(
    params: CreatePaymentParams
  ): Promise<ChipPaymentResponse> {
    // Convert amount to cents as per Chip-In API requirements
    const amountInCents = Math.round(params.amount * 100);

    // Convert product prices to cents
    const products = params.products.map((product) => ({
      ...product,
      price: Math.round(product.price * 100), // Convert to cents
    }));

    const response = await fetch(`${this.baseUrl}/purchases`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.secretKey}`,
        'X-Brand-ID': this.brand,
      },
      body: JSON.stringify({
        purchase: {
          amount: amountInCents, // Amount in cents
          currency: params.currency || 'MYR',
          products: products,
        },
        client: {
          email: params.email,
          phone: params.phone,
          full_name: params.fullName,
        },
        success_callback: params.successUrl,
        failure_callback: params.failureUrl,
        success_redirect: params.successRedirectUrl,
        failure_redirect: params.failureRedirectUrl,
        platform: 'web',
        send_receipt: true,
        payment_method_whitelist: params.paymentMethods,
        reference: params.reference, // Order reference for tracking
        due: params.due, // Optional due date
        is_recurring_token: params.isRecurringToken || false,
        metadata: params.metadata, // Optional metadata for tracking premium events
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Chip payment creation failed: ${JSON.stringify(errorData)}`
      );
    }

    return response.json();
  }

  /**
   * Get payment details
   * @param paymentId Payment ID
   * @returns Payment details
   */
  async getPayment(paymentId: string): Promise<ChipPaymentResponse> {
    const response = await fetch(`${this.baseUrl}/purchases/${paymentId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
        'X-Brand-ID': this.brand,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Failed to get payment details: ${JSON.stringify(errorData)}`
      );
    }

    return response.json();
  }

  /**
   * Verify webhook signature
   * @param signature Signature from X-Signature header
   * @param payload Request body as string
   * @returns Whether the signature is valid
   */
  verifyWebhookSignature(signature: string, payload: string): boolean {
    if (!signature || !payload || !this.secretKey) {
      return false;
    }

    try {
      // Create HMAC signature using SHA-256 and the secret key
      const hmac = crypto.createHmac('sha256', this.secretKey);
      const calculatedSignature = hmac.update(payload).digest('hex');

      // Compare the calculated signature with the provided one
      return signature === calculatedSignature;
    } catch (error) {
      console.error('Error verifying webhook signature:', error);
      return false;
    }
  }
}

export interface CreatePaymentParams {
  amount: number; // Amount in your currency (will be converted to cents)
  currency?: string;
  email: string;
  phone: string;
  fullName: string;
  products: Array<{
    name: string;
    quantity: number;
    price: number; // Price in your currency (will be converted to cents)
    description?: string;
  }>;
  successUrl: string;
  failureUrl: string;
  successRedirectUrl: string;
  failureRedirectUrl: string;
  paymentMethods?: string[];
  reference?: string; // Optional reference for the payment (e.g., order ID)
  due?: string; // Optional due date in ISO format
  isRecurringToken?: boolean; // Whether this payment is for a recurring token
  metadata?: Record<string, string>; // Optional metadata for tracking premium events
}

export interface ChipPaymentResponse {
  id: string;
  status: 'created' | 'pending' | 'paid' | 'failed' | 'canceled';
  payment_method: string;
  checkout_url: string;
  success_redirect: string;
  failure_redirect: string;
  created_at: string;
  updated_at: string;
  purchase: {
    amount: number; // Amount in cents
    currency: string;
    products: Array<{
      name: string;
      quantity: number;
      price: number; // Price in cents
      description?: string;
    }>;
  };
  client: {
    email: string;
    phone: string;
    full_name: string;
  };
  reference?: string;
  due?: string;
  is_recurring_token?: boolean;
  metadata?: Record<string, string>; // Metadata for the payment
}

export const chip = new ChipClient();
