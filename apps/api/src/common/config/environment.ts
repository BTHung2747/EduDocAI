import { z } from 'zod';

const environmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3001),
  DATABASE_URL: z.string().url(),
  APP_URL: z.string().url(),
  API_URL: z.string().url(),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  JWT_ACCESS_SECRET: z.string().min(24),
  JWT_REFRESH_SECRET: z.string().min(24),
  JWT_ACCESS_TTL_SECONDS: z.coerce.number().int().positive().default(900),
  JWT_REFRESH_TTL_DAYS: z.coerce.number().int().positive().default(30),
  STORAGE_DRIVER: z.enum(['local', 's3']).default('local'),
  STORAGE_LOCAL_PATH: z.string().min(1).default('./storage'),
  MAX_UPLOAD_BYTES: z.coerce.number().int().positive().default(20 * 1024 * 1024),
  DEFAULT_USER_QUOTA_BYTES: z.coerce.number().int().positive(),
  SEMANTIC_SEARCH_CANDIDATE_LIMIT: z.coerce.number().int().min(20).max(1000).default(300),
  SEMANTIC_SEARCH_TOP_K: z.coerce.number().int().min(1).max(30).default(8),
  SEMANTIC_SEARCH_THRESHOLD: z.coerce.number().min(-1).max(1).default(0.35),
  SUBJECT_CLASSIFICATION_THRESHOLD: z.coerce.number().min(-1).max(1).default(0.55),
  SUBJECT_CLASSIFICATION_MIN_MARGIN: z.coerce.number().min(0).max(2).default(0.05),
  // Keep AI configuration in the validated ConfigService object. Zod strips
  // undeclared keys by default, which would otherwise make a configured
  // OpenRouter key appear missing at runtime.
  AI_PROVIDER_ORDER: z.literal('openrouter').default('openrouter'),
  OPENROUTER_API_KEY: z.string().trim().optional(),
  ALLOW_PAID_MODELS: z.enum(['true', 'false']).default('false'),
  AI_MODEL_PRIMARY: z.string().trim().min(1).default('openrouter/free'),
  AI_MODEL_FALLBACKS: z.string().trim().default(''),
});

export function validateEnvironment(config: Record<string, unknown>) {
  return environmentSchema.parse(config);
}
