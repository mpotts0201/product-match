import { Product } from "@/types/product";

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
    // Keep same main ingredient
    const mainIngredients = (product.ingredientTags ?? []).slice(0, 6).map((ing: string) => {
        return formatIngredients(ing);
    });

    let mainIngredient = "";
    for (const ing of mainIngredients) {
        if (!GENERIC_TAGS.has(ing ?? "")) {
            mainIngredient = ing ?? "";
            break;
        }
    }

    const altsWithMainIngredient = mainIngredient
        ? dedupedByBrand.filter((alt) => {
              const cleanIngs = (alt.ingredientTags ?? []).slice(0, 6).map((ing: string) => {
                  return formatIngredients(ing);
              });
              if (cleanIngs.length == 0) return false;
              return cleanIngs.includes(mainIngredient);
          })
        : dedupedByBrand;

    return altsWithMainIngredient;
}

function normalizeTag(tag: string): string {
    return tag
        .replace(/^[a-z]{2}:/, "")
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-");
}

function formatIngredients(tag: string) {
    return tag.split(":").pop();
}
