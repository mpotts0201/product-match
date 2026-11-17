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

export function alternativesFilter(product: any, alts: any[]) {
    // preserve alts with ingredients weighted to the scanned product
    const weightedAlts = alts.map((alt: any) => {
        const matchWeight = product.ingredients.reduce((acc: number, ing: any) => {
            if ((alt.ingredients_tags ?? []).includes(ing.id)) {
                acc += ing.percent_estimate ?? 0;
            }
            return acc;
        }, 0);

        return { product: alt, matchWeight };
    });

    // dedupe by barcode
    // require name and photo
    const seenBarcodes = new Set<string>([product.code]);
    const dedupedCleanAlts = alts.filter((alt) => {
        if (!seenBarcodes.has(alt.code) && alt.product_name && alt.image_front_small_url) {
            seenBarcodes.add(alt.code);
            return true;
        }
        return false;
    });

    // drop same brand
    const productBrands = new Set<string>();
    (product.brands_tags ?? []).forEach((brand: string) => {
        productBrands.add(normalizeTag(brand));
    });

    const dedupedByBrand = dedupedCleanAlts.filter((alt) => {
        const hasSameBrand = (alt.brands_tags ?? []).reduce((acc: boolean, brand: string) => {
            if (productBrands.has(normalizeTag(brand))) {
                return true;
            }
            return acc;
        }, false);

        return !hasSameBrand;
    });
    // Keep same main ingredient
    const mainIngredients = (product.ingredients_tags ?? []).slice(0, 6).map((ing: string) => {
        return formatIngredients(ing);
    });

    let mainIngredient = "";
    for (const ing of mainIngredients) {
        if (!GENERIC_TAGS.has(ing)) {
            mainIngredient = ing;
            break;
        }
    }

    const altsWithMainIngredient = mainIngredient
        ? dedupedByBrand.filter((alt) => {
              const cleanIngs = (alt.ingredients_tags ?? []).slice(0, 6).map((ing: string) => {
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
