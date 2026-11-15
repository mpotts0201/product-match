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

    const sortedAlts = weightedAlts.sort((a, b) => {
        return b.matchWeight - a.matchWeight;
    });

    return sortedAlts;
}
