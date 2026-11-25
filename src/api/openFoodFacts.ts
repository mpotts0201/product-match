export async function getProduct(barcode: string) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    try {
        const res = await fetch(`https://world.openfoodfacts.net/api/v2/product/${barcode}`, {
            method: "GET",
            headers: { Accept: "application/json" },
            signal: controller.signal,
        });

        if (!res.ok) {
            throw new Error(`Request failed: ${res.status}`);
        }

        const json = await res.json();
        return json;
    } finally {
        clearTimeout(timeout);
    }
}

// category is "compared_to_category" and brands from "brands_tags" in json from getProduct
export async function getAlternatives(category: string, brands: string[] = []) {
    console.log(category, brands);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    try {
        const parts = [
            `categories:"${category}"`,
            `countries:"en:united-states"`,
            ...brands.map((b) => `-brands:"${b}"`),
        ];
        const q = parts.join(" ");
        const res = await fetch(
            `https://search.openfoodfacts.org/search?q=${encodeURIComponent(q)}&page_size=50&sort_by=-unique_scans_n`,
            {
                method: "GET",
                headers: { Accept: "application/json" },
                signal: controller.signal,
            },
        );

        if (!res.ok) {
            throw new Error(`Request failed: ${res.status}`);
        }

        const json = await res.json();
        return json;
    } finally {
        clearTimeout(timeout);
    }
}
