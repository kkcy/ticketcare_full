import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const keys = () =>
  createEnv({
    server: {
      STRIPE_SECRET_KEY: z.string().min(1).startsWith('sk_'),
      STRIPE_WEBHOOK_SECRET: z.string().min(1).startsWith('whsec_').optional(),
      // Chip-In Asia API credentials
      CHIP_API_KEY: z.string().min(1).optional(),
      CHIP_SECRET_KEY: z.string().min(1).optional(),
      CHIP_WEBHOOK_SECRET: z.string().min(1).optional(),
      CHIP_BRAND_ID: z.string().optional(),
      CHIP_BASE_URL: z.string().url().optional(),
    },
    runtimeEnv: {
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
      STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
      // Chip-In Asia environment variables
      CHIP_API_KEY: process.env.CHIP_API_KEY,
      CHIP_SECRET_KEY: process.env.CHIP_SECRET_KEY,
      CHIP_WEBHOOK_SECRET: process.env.CHIP_WEBHOOK_SECRET,
      CHIP_BRAND_ID: process.env.CHIP_BRAND_ID,
      CHIP_BASE_URL: process.env.CHIP_BASE_URL,
    },
  });
