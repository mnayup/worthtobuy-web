export interface VariantPriceRule {
  id?: string;
  variants: string[];
  sizes: string[];
  buyPrice?: number;
  sellingPrice: number;
}

export interface BundlePriceRule {
  id?: string;
  name?: string;
  minQty: number;
  bundlePrice: number;
  note?: string;
}

export interface ProductPriceRules {
  variantRules?: VariantPriceRule[];
  bundleRules?: BundlePriceRule[];
}

export function parseProductPriceRules(raw: any): ProductPriceRules {
  if (!raw) return { variantRules: [], bundleRules: [] };
  if (Array.isArray(raw)) {
    return { variantRules: raw, bundleRules: [] };
  }
  return {
    variantRules: Array.isArray(raw.variantRules) ? raw.variantRules : [],
    bundleRules: Array.isArray(raw.bundleRules) ? raw.bundleRules : [],
  };
}

export function findMatchingVariantPrice(
  priceRules: ProductPriceRules,
  variant: string,
  size: string,
  fallbackBasePrice: number
): number {
  const rules = priceRules.variantRules || [];
  const cleanVar = (variant || '').trim().toLowerCase();
  const cleanSize = (size || '').trim().toLowerCase();

  for (const rule of rules) {
    const ruleVariants = (rule.variants || []).map((v) => v.trim().toLowerCase());
    const ruleSizes = (rule.sizes || []).map((s) => s.trim().toLowerCase());

    const varMatches =
      ruleVariants.length === 0 || (cleanVar && ruleVariants.includes(cleanVar));
    const sizeMatches =
      ruleSizes.length === 0 || (cleanSize && ruleSizes.includes(cleanSize));

    if (varMatches && sizeMatches) {
      const rulePrice = Number(rule.sellingPrice || 0);
      return rulePrice > 0 ? rulePrice : fallbackBasePrice;
    }
  }

  return fallbackBasePrice;
}

/**
 * Distribute a bundle price across `bundleQty` items so that:
 * 1. The sum of all unit prices equals bundlePrice exactly (no 1 IDR missing due to floor/round).
 * 2. If the bundle rule defines minQty = 3 with bundlePrice = 310,000,
 *    base unit price = Math.floor(310000 / 3) = 103,333.
 *    remainder = 310000 % 3 = 1.
 *    The first remainder items get +1: [103334, 103333, 103333] -> sum = 310,000 exact!
 */
export function calculateExactBundleUnitPrices(bundlePrice: number, bundleQty: number): number[] {
  if (bundleQty <= 0) return [];
  const base = Math.floor(bundlePrice / bundleQty);
  const remainder = bundlePrice - base * bundleQty;
  const prices: number[] = [];
  for (let i = 0; i < bundleQty; i++) {
    prices.push(base + (i < remainder ? 1 : 0));
  }
  return prices;
}

/**
 * Given a list of items (each with quantity, variant, size, and normal price)
 * and an active bundle rule, calculate the exact unit price and bundleName for each item:
 * - Bundle applies to groups of `bundle.minQty` pieces.
 * - Any extra pieces beyond complete bundle sets get their normal variant price.
 * - Exact remainder balancing is applied per bundle group so sum of bundle pieces equals bundlePrice exact.
 */
export function applyBundleToItems<T extends { quantity: number; variant?: string; size?: string; price?: number; bundleName?: string }>(
  items: T[],
  bundle: BundlePriceRule | null,
  priceRules: ProductPriceRules,
  defaultPrice: number
): T[] {
  if (!bundle || bundle.minQty <= 0) {
    // Revert to normal variant price without bundle
    return items.map((it) => ({
      ...it,
      bundleName: undefined,
      price: findMatchingVariantPrice(priceRules, it.variant || '', it.size || '', defaultPrice),
    }));
  }

  const bundleQty = bundle.minQty;
  const bundlePrice = bundle.bundlePrice;
  const bundleLabel = bundle.name || `Bundle of ${bundleQty}`;

  // Expand items into single units for granular bundle assignment
  const units: Array<{ itemIndex: number; normalPrice: number }> = [];
  items.forEach((it, idx) => {
    const qty = Math.max(1, Number(it.quantity || 1));
    const normalPrice = findMatchingVariantPrice(priceRules, it.variant || '', it.size || '', defaultPrice);
    for (let q = 0; q < qty; q++) {
      units.push({ itemIndex: idx, normalPrice });
    }
  });

  const totalUnits = units.length;
  const numBundles = Math.floor(totalUnits / bundleQty);
  const bundledUnitsCount = numBundles * bundleQty;

  // Compute unit prices for each single unit
  const unitResults: Array<{ price: number; bundleName?: string }> = [];

  // 1. Assign bundled units
  for (let b = 0; b < numBundles; b++) {
    const bundlePrices = calculateExactBundleUnitPrices(bundlePrice, bundleQty);
    for (const p of bundlePrices) {
      unitResults.push({ price: p, bundleName: bundleLabel });
    }
  }

  // 2. Extra units beyond complete bundle sets get their standard normal price
  for (let u = bundledUnitsCount; u < totalUnits; u++) {
    unitResults.push({
      price: units[u].normalPrice,
      bundleName: undefined,
    });
  }

  // When bundling is active, expand all items into individual units with quantity = 1.
  // This guarantees:
  // 1. Every unit piece has an exact integer price.
  // 2. Exact remainder distribution never causes rounding drift (e.g. 103334 + 103333 + 103333 = 310,000 always).
  // 3. User can freely select different variants & sizes on each line.
  const expanded: T[] = [];
  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    const qty = Math.max(1, Number(it.quantity || 1));
    for (let q = 0; q < qty; q++) {
      expanded.push({
        ...it,
        quantity: 1,
      });
    }
  }

  return expanded.map((it, idx) => ({
    ...it,
    quantity: 1,
    price: unitResults[idx].price,
    bundleName: unitResults[idx].bundleName,
  }));
}

