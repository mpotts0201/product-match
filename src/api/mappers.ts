import { normalizeIngredientTags } from "@/lib/alternativesFilter";
import { Product } from "@/types/product";

// src/api/mappers.ts
export function mapBarcodeProduct(raw: any): Product {
    return {
        code: raw.code,
        name: raw.product_name ?? "Unknown product",
        brand: raw.brands?.split(",")[0]?.trim(),
        brandTags: raw.brands_tags ?? [],
        ingredientTags: normalizeIngredientTags(raw.ingredients_tags ?? []),
        allergens: raw.allergens_tags ?? [],
        labels: raw.labels_tags ?? [],
        imageUrl: raw.image_front_small_url,
        quantity: raw.quantity,
        category: raw.compared_to_category,
        traces: raw.traces_tags ?? [],
    };
}

export function mapSearchHit(raw: any): Product {
    return {
        code: raw.code,
        name: raw.product_name ?? "Unknown product",
        brand: Array.isArray(raw.brands) ? raw.brands[0] : raw.brands,
        brandTags: raw.brands ?? [],
        ingredientTags: normalizeIngredientTags(raw.ingredients_tags ?? []),
        allergens: raw.allergens ?? [],
        labels: raw.labels ?? [],
        imageUrl: raw.image_front_small_url,
        quantity: raw.quantity,
        category: undefined, // only needed for the scanned product
        traces: raw.traces ?? [],
    };
}
