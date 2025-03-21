import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const keys = () =>
  createEnv({
    server: {
      // Backblaze credentials
      B2_REGION: z.string().min(1),
      B2_ACCESS_KEY_ID: z.string().min(1),
      B2_SECRET_ACCESS_KEY: z.string().min(1),
      B2_BUCKET_NAME: z.string().min(1),
    },
    runtimeEnv: {
      // Backblaze credentials
      B2_REGION: process.env.B2_REGION,
      B2_ACCESS_KEY_ID: process.env.B2_ACCESS_KEY_ID,
      B2_SECRET_ACCESS_KEY: process.env.B2_SECRET_ACCESS_KEY,
      B2_BUCKET_NAME: process.env.B2_BUCKET_NAME,
    },
  });
