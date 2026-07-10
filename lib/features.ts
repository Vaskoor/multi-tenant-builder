import { Tenant } from '@prisma/client';

const DEFAULT_FEATURES = {
  website_builder: true,
  basic_pos: true,
  accounting_module: false,
  advanced_reporting: false,
  gst_billing: false,
  multi_branch: false,
} as const;

export type FeatureKey = keyof typeof DEFAULT_FEATURES;

export function getFeatureFlags(tenant: Tenant | null): Record<FeatureKey, boolean> {
  if (!tenant) return DEFAULT_FEATURES;
  const overrides = (tenant.featureOverrides ?? {}) as Partial<Record<FeatureKey, boolean>>;
  return { ...DEFAULT_FEATURES, ...overrides };
}

export function canAccess(tenant: Tenant | null, feature: FeatureKey): boolean {
  const flags = getFeatureFlags(tenant);
  return flags[feature] === true;
}

// Plan limits (enforced in API routes)
export const PLAN_LIMITS = {
  free: {
    maxProducts: 10,
    maxStaff: 1,
    customDomain: false,
    storageMB: 100,
  },
  pro: {
    maxProducts: 100,
    maxStaff: 5,
    customDomain: true,
    storageMB: 500,
  },
  premium: {
    maxProducts: 10000,
    maxStaff: 50,
    customDomain: true,
    storageMB: 2000,
  },
};

export function getPlanLimits(plan: string) {
  return PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS] || PLAN_LIMITS.free;
}
