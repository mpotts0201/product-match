// src/lib/prefilter.ts
// Cuts the search results down to a short list worth showing the model.
// Pure functions, no React Native imports, so the app and scripts/eval.ts can share it.
//
// Three passes:
//   1. Same product or same brand  -> drop (we want alternatives)
//   2. No name                     -> drop (nobody can judge or display it)
//   3. Different main ingredient   -> drop (corn flakes are not oat O's)
// Missing ingredient data is NOT a reason to drop. We only filter on what we know.

import type { PromptProduct } from "./equivalencePrompt";

export type PrefilterOptions = {
    maxCandidates?: number; // how many survivors to keep, in search order
    ingredientWindow?: number; // how far into a candidate's tags to look for the main ingredient
    requireImage?: boolean; // drop candidates with no front photo (shoppers need to see what to look for)
};

// Tags that say almost nothing about what a product is. Every cereal has
// "cereal", every spread has "oil-and-fat", so they can't define a match.
const GENERIC_TAGS = new Set([
    "cereal",
    "flour",
    "cereal-flour",
    "starch",
    "added-sugar",
    "disaccharide",
    "oil-and-fat",
    "vegetable-oil-and-fat",
    "vitamins",
    "minerals",
    "ingredients",
    "water",
]);

// "General Mills", "general-mills", "generalmills" -> "generalmills"
export function normalizeBrand(brand: string): string {
    return brand.toLowerCase().replace(/[^a-z0-9]/g, "");
}

// Collects every brand spelling a product has, normalized.
// Very short ones (like junk "a" or "of") are ignored.
function brandSet(p: PromptProduct & { brands_tags?: string[] }): Set<string> {
    const raw = [
        ...(p.brands_tags ?? []),
        ...(Array.isArray(p.brands) ? p.brands : (p.brands ?? "").split(",")),
    ];
    return new Set(raw.map(normalizeBrand).filter((b) => b.length >= 3));
}

// "en:wholemeal-oat" -> "wholemeal-oat", and "de:palm oil" -> "palm-oil".
// The language prefix is dropped because the scanned product's tags are
// sometimes stored under another language even when the words are English.
function normalizeTag(tag: string): string {
    return tag
        .replace(/^[a-z]{2}:/, "")
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-");
}

// The scanned product's defining ingredients: its first few specific tags.
// For Honey Nut Cheerios that's ["wholemeal-oat", "oat"].
// Uses tags only: they're Open Food Facts' standardized names, so they match
// across products. Free text ("whole grain oats") doesn't match tags ("wholemeal-oat").
// Returns [] when there are no tags, which turns the ingredient filter off
// (eval.ts warns you when that happens).
//
// Only the FIRST specific ingredient counts, plus its parent tags (which
// appear right after it, like "wholemeal-oat" then "oat"). Earlier versions
// used the first three, but then "sugar" became a "main ingredient" for
// Cheerios and let every sugary cereal through.
export function coreIngredients(scanned: PromptProduct, lookahead = 3): string[] {
    const specific = (scanned.ingredients_tags ?? [])
        .map(normalizeTag)
        .filter((t) => t && !GENERIC_TAGS.has(t));
    const first = specific[0];
    if (!first) return [];

    // Parents of "wholemeal-oat" include "oat": a later tag that is one of its word parts.
    const parts = first.split("-");
    const parents = specific
        .slice(1, lookahead)
        .filter((t) => parts.includes(t) || first.includes(t));
    return [first, ...parents];
}

// "oat" matches "oat", "wholemeal-oat", and "oat-flour", but not "goat".
function tagMatches(tag: string, core: string): boolean {
    return tag === core || tag.split("-").includes(core);
}

function isSameProductOrBrand(
    candidate: PromptProduct & { brands_tags?: string[] },
    scannedBrands: Set<string>,
    scannedName: string,
): boolean {
    // Brand overlap. Substring check catches "ferreronutella" vs "ferrero".
    for (const b of brandSet(candidate)) {
        for (const s of scannedBrands) {
            if (b === s) return true;
            if (s.length >= 4 && b.includes(s)) return true;
            if (b.length >= 4 && s.includes(b)) return true;
        }
    }

    const name = normalizeBrand(candidate.product_name ?? "");
    // Same name, like a bigger jar of the same product.
    if (scannedName && name.includes(scannedName)) return true;
    // The scanned brand shows up in the candidate's name, like "Cheerios Oat Crunch".
    for (const s of scannedBrands) {
        if (s.length >= 4 && name.includes(s)) return true;
    }
    return false;
}

function sharesMainIngredient(candidate: PromptProduct, core: string[], window: number): boolean {
    const tags = candidate.ingredients_tags ?? [];
    if (core.length === 0 || tags.length === 0) return true; // unknown, so don't judge
    const early = tags.slice(0, window).map(normalizeTag);
    return core.some((c) => early.some((t) => tagMatches(t, c)));
}

export function prefilterCandidates<T extends PromptProduct & { brands_tags?: string[] }>(
    scanned: T,
    candidates: T[],
    { maxCandidates = 15, ingredientWindow = 6, requireImage = false }: PrefilterOptions = {},
): T[] {
    const scannedBrands = brandSet(scanned);
    const scannedName = normalizeBrand(scanned.product_name ?? "");
    const core = coreIngredients(scanned);
    const seen = new Set<string>();

    return candidates
        .filter((c) => {
            // Skip duplicates and the scanned product itself.
            if (c.code) {
                if (c.code === scanned.code || seen.has(c.code)) return false;
                seen.add(c.code);
            }
            return true;
        })
        .filter((c) => (c.product_name ?? "").trim().length > 0)
        .filter((c) => !requireImage || Boolean(c.image_front_small_url))
        .filter((c) => !isSameProductOrBrand(c, scannedBrands, scannedName))
        .filter((c) => sharesMainIngredient(c, core, ingredientWindow))
        .slice(0, maxCandidates);
}
