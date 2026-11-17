// src/lib/equivalencePrompt.ts
// Turns a scanned product and its search candidates into the two strings
// the model needs: a system message (standing instructions) and a user
// message (this scan's data, written out as plain text).
// No React Native imports here, so both the app and scripts/eval.ts can use it.

// Only the fields we actually read. Everything is optional because
// Open Food Facts data is crowdsourced and anything can be missing.
type Nutriments = {
    sugars_100g?: number;
    fat_100g?: number;
    proteins_100g?: number;
    fiber_100g?: number;
};

export type PromptProduct = {
    code?: string;
    product_name?: string;
    generic_name?: string;
    brands?: string | string[];
    quantity?: string;
    ingredients_text?: string;
    ingredients_tags?: string[];
    labels_tags?: string[];
    nutriments?: Nutriments;
    image_front_small_url?: string; // ~200px front photo; used by the image experiment
};

// The model's "job description". Edit the definition of a match here.
// This is where your judgment calls (flavors, premium versions, shape) live.
// const SYSTEM_PROMPT = `You are a grocery shopping assistant. You do not write code.
// You compare a scanned product with a numbered list of candidate products and decide which candidates a shopper could buy instead.

// A candidate is a match when it is the same kind of product, made from the same main ingredients in the same way.
// - Ignore brand, price, and package size.
// - Ignore words like organic, whole grain, natural, or sea (organic corn is still corn).
// - Shape and serving style do not matter (a scoop-shaped corn chip is still a corn chip).
// - A different main ingredient means it is NOT a match (a lentil chip is not a corn chip).
// - Low-sugar, sweetener-based, or high-protein versions of a sugary product are NOT matches.
// - A product that is clearly the same item as the scanned product is NOT a match; we want alternatives.

// Answer only with the numbers of the matching candidates. If none match, return an empty list.`;

const SYSTEM_PROMPT = `
Given images, the first being the main product a customer wishes to find an off brand alternative for, and the rest being images of potential alternatives, 
which alternatives would be the most equivalent to the first image if one were to want to buy an off brand alternative to the main product?  
Consider yourself a store associate making a recommendation to a customer.  You can recommend more than one alternative.  
Which ones would you recommend?

Answer only with the numbers of your recommendations. If you recommend none, return an empty list.
`;

// "en:wholemeal-oat" -> "wholemeal oat". Drops tags in other languages
// (like "de:zucker"), since those are usually untranslated junk.
function cleanTag(tag: string): string | null {
    if (!tag.startsWith("en:")) return null;
    return tag.slice(3).replace(/-/g, " ");
}

function brandText(brands: PromptProduct["brands"]): string {
    if (!brands) return "unknown brand";
    return Array.isArray(brands) ? brands.join(", ") : brands;
}

// Prefer the readable ingredient list; fall back to cleaned tags.
// Tags include parent categories ("added sugar", "oil and fat"), so we cap
// the count to keep each line short.
function ingredientText(p: PromptProduct, maxTags = 12): string {
    if (p.ingredients_text?.trim()) return p.ingredients_text.trim();
    const tags = (p.ingredients_tags ?? []).map(cleanTag).filter((t): t is string => t !== null);
    return tags.length ? tags.slice(0, maxTags).join(", ") : "ingredients unknown";
}

// Only includes numbers that exist, so missing data never prints "undefined".
function nutritionText(n?: Nutriments): string {
    if (!n) return "";
    // Round to one decimal: 5.8823529411765 -> 5.9
    const r = (x: number) => Math.round(x * 10) / 10;
    const parts: string[] = [];
    if (n.sugars_100g != null) parts.push(`sugar ${r(n.sugars_100g)}g`);
    if (n.fat_100g != null) parts.push(`fat ${r(n.fat_100g)}g`);
    if (n.proteins_100g != null) parts.push(`protein ${r(n.proteins_100g)}g`);
    if (n.fiber_100g != null) parts.push(`fiber ${r(n.fiber_100g)}g`);
    return parts.length ? `per 100g: ${parts.join(", ")}` : "";
}

function labelText(labels?: string[]): string {
    const cleaned = (labels ?? [])
        .map(cleanTag)
        .filter((t): t is string => t !== null)
        .slice(0, 4);
    return cleaned.length ? `labels: ${cleaned.join(", ")}` : "";
}

// One product as one compact, readable line (or block for the scanned one).
function describe(p: PromptProduct): string {
    const name = p.product_name?.trim() || "unnamed product";
    const pieces = [
        `${name} (${brandText(p.brands)})`,
        p.generic_name?.trim() || "",
        p.quantity ? `size: ${p.quantity}` : "",
        `ingredients: ${ingredientText(p)}`,
        nutritionText(p.nutriments),
        labelText(p.labels_tags),
    ];
    return pieces.filter(Boolean).join(" | ");
}

export function buildEquivalencePrompt(
    scanned: PromptProduct,
    candidates: PromptProduct[],
): { system: string; user: string } {
    const lines = candidates.map((c, i) => `${i + 1}. ${describe(c)}`);

    const user = [
        `Scanned product: ${describe(scanned)}`,
        "",
        "Candidates:",
        ...lines,
        "",
        "Which candidates are matches?",
    ].join("\n");

    return { system: SYSTEM_PROMPT, user };
}
