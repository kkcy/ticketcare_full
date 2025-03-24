import 'server-only';
import crypto from 'node:crypto';
import { log } from '@repo/observability/log';
import { keys } from './keys';

interface DeliveryMethod {
  method: string;
  options: {
    custom_message?: string;
    [key: string]: unknown; // Allow for other potential options
  };
}

interface Customer {
  cc: string[];
  bcc: string[];
  city: string;
  email: string;
  phone: string;
  state: string;
  country: string;
  zip_code: string;
  bank_code: string;
  full_name: string;
  brand_name: string;
  legal_name: string;
  tax_number: string;
  client_type: null;
  bank_account: string;
  personal_code: string;
  shipping_city: string;
  shipping_state: string;
  street_address: string;
  delivery_methods: DeliveryMethod[];
  shipping_country: string;
  shipping_zip_code: string;
  registration_number: string;
  shipping_street_address: string;
}

interface Product {
  name: string;
  price: number;
  category: string;
  discount?: number;
  quantity?: string;
  tax_percent?: string;
  total_price_override?: number;
}

interface Purchase {
  debt: number;
  notes: string;
  total: number;
  currency: string;
  language: string;
  products: Product[];
  timezone: string;
  due_strict: boolean;
  email_message: string;
  total_override: null;
  shipping_options: string[];
  subtotal_override: null;
  total_tax_override: null;
  has_upsell_products: boolean;
  payment_method_details: Record<string, unknown>;
  request_client_details: string[];
  total_discount_override: null;
}

interface StatusHistory {
  status: string;
  timestamp: number;
}

interface BankAccount {
  bank_code: string;
  bank_account: string;
}

interface IssuerDetails {
  website: string;
  brand_name: string;
  legal_city: string;
  legal_name: string;
  tax_number: string;
  bank_accounts: BankAccount[];
  legal_country: string;
  legal_zip_code: string;
  registration_number: string;
  legal_street_address: string;
}

interface Attempt {
  flow: string;
  type: string;
  error: {
    code: string;
    message: string;
  };
  extra: Record<string, unknown>;
  country: string;
  client_ip: string;
  fee_amount: number;
  successful: boolean;
  payment_method: string;
  processing_time: number;
  processing_tx_id: string;
}

interface TransactionData {
  flow: string;
  extra: Record<string, unknown>;
  country: string;
  attempts: Attempt[];
  payment_method: string;
  processing_tx_id: string;
}

export interface CreatePaymentParams {
  amount: number; // Amount in your currency (will be converted to cents)
  currency?: string;
  email: string;
  phone: string;
  fullName: string;
  products: Product[];
  successUrl: string;
  failureUrl: string;
  successRedirectUrl: string;
  failureRedirectUrl: string;
  cancelRedirectUrl: string;
  paymentMethods?: string[];
  reference?: string; // Optional reference for the payment (e.g., order ID)
  due?: string; // Optional due date in ISO format
  isRecurringToken?: boolean; // Whether this payment is for a recurring token
  notes?: string; // Optional notes for the payment
}

export interface ChipPaymentResponse {
  id: string;
  due: number;
  type: string;
  client: Customer;
  issued: string;
  status: string;
  is_test: boolean;
  payment: null;
  product: string;
  user_id: null;
  brand_id: string;
  order_id: null;
  platform: string;
  purchase: Purchase;
  client_id: string;
  reference: string;
  viewed_on: number;
  company_id: string;
  created_on: number;
  event_type: string;
  updated_on: number;
  invoice_url: null;
  can_retrieve: boolean;
  checkout_url: string;
  send_receipt: boolean;
  skip_capture: boolean;
  creator_agent: string;
  referral_code: null;
  can_chargeback: boolean;
  issuer_details: IssuerDetails;
  marked_as_paid: boolean;
  status_history: StatusHistory[];
  cancel_redirect: string;
  created_from_ip: string;
  direct_post_url: string;
  force_recurring: boolean;
  recurring_token: null;
  failure_redirect: string;
  success_callback: string;
  success_redirect: string;
  transaction_data: TransactionData;
  upsell_campaigns: Record<string, unknown>[];
  refundable_amount: number;
  is_recurring_token: boolean;
  billing_template_id: null;
  currency_conversion: null;
  reference_generated: string;
  refund_availability: string;
  referral_campaign_id: null;
  retain_level_details: null;
  referral_code_details: null;
  referral_code_generated: null;
  payment_method_whitelist: null;
}

/**
 * Chip-In Asia payment gateway client
 * Documentation: https://docs.chip-in.asia/chip-collect/overview/introduction
 */
export class ChipClient {
  // private readonly apiKey: string;
  private readonly secretKey: string;
  private readonly baseUrl: string;
  private readonly brand: string;
  private readonly publicKey: string;

  constructor() {
    const config = keys();
    // this.apiKey = config.CHIP_API_KEY || '';
    this.secretKey = config.CHIP_SECRET_KEY || '';
    this.baseUrl = config.CHIP_BASE_URL || 'https://gate.chip-in.asia/api/v1';
    this.brand = config.CHIP_BRAND_ID || '';
    this.publicKey = config.CHIP_WEBHOOK_SECRET || '';
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

    const response = await fetch(`${this.baseUrl}/purchases/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.secretKey}`,
        'X-Brand-ID': this.brand,
      },
      body: JSON.stringify({
        brand_id: this.brand,
        purchase: {
          amount: amountInCents, // Amount in cents
          currency: params.currency || 'MYR',
          products: products,
          notes: params.notes,
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
        cancel_redirect: params.cancelRedirectUrl,
        platform: 'web',
        // send_receipt: true,
        payment_method_whitelist: params.paymentMethods,
        reference: params.reference, // Order reference for tracking
        due: params.due, // Optional due date
        is_recurring_token: params.isRecurringToken || false,
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
   * @param payload Request body as string
   * @param signature Signature from X-Signature header
   * @returns Whether the signature is valid
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    if (!payload || !signature || !this.publicKey) {
      log.error('Missing required parameters for signature verification', {
        hasPayload: !!payload,
        hasSignature: !!signature,
        hasPublicKey: !!this.publicKey,
      });
      return false;
    }

    log.info('Verifying Chip webhook signature');

    try {
      const verifier = crypto.createVerify('sha256WithRSAEncryption');
      verifier.update(payload);

      // Compare the calculated signature with the provided one
      const result = verifier.verify(
        this.publicKey,
        Buffer.from(signature, 'base64')
      );

      log.info(`Signature verification ${result ? 'successful' : 'failed'}`);
      return result;
    } catch (error) {
      log.error('Error verifying webhook signature:', { error });
      return false;
    }
  }
}

export const chip = new ChipClient();
