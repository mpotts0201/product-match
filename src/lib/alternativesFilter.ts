import { Product } from "@/types/product";

export const GENERIC_TAGS = new Set([
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
    "salt",
    "flavoring",
    "flavouring",
    "sugar",
]);

export function alternativesFilter(product: Product, alts: Product[]) {
    // dedupe by barcode
    // require name and photo
    const seenBarcodes = new Set<string>([product.code]);
    const dedupedCleanAlts = alts.filter((alt: Product) => {
        if (!seenBarcodes.has(alt.code) && alt.name && alt.imageUrl) {
            seenBarcodes.add(alt.code);
            return true;
        }
        return false;
    });

    // drop same brand
    const productBrands = new Set<string>();
    (product.brandTags ?? []).forEach((brand: string) => {
        productBrands.add(normalizeTag(brand));
    });

    const dedupedByBrand = dedupedCleanAlts.filter((alt) => {
        const hasSameBrand = (alt.brandTags ?? []).reduce((acc: boolean, brand: string) => {
            if (productBrands.has(normalizeTag(brand))) {
                return true;
            }
            return acc;
        }, false);

        return !hasSameBrand;
    });

    const altsWithMainIngredient = product.mainIngredient
        ? dedupedByBrand.filter((alt) => {
              const cleanIngs = (alt.ingredientTags ?? []).slice(0, 6).map((ing: string) => {
                  return formatIngredients(ing);
              });
              if (cleanIngs.length == 0) return false;
              return cleanIngs.includes(product.mainIngredient);
          })
        : dedupedByBrand;

    return altsWithMainIngredient;
}

export function normalizeTag(tag: string): string {
    return tag
        .replace(/^[a-z]{2}:/, "")
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-");
}

export function formatIngredients(tag: string) {
    return tag.split(":").pop();
}

export function normalizeIngredientTags(tags: string[]) {
    return tags.map((tag: string) => normalizeTag(tag));
}

export function filterGenericTags(tags: string[]) {
    return tags.filter((ing) => !GENERIC_TAGS.has(ing));
}
