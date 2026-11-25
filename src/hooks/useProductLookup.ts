import { mapBarcodeProduct, mapSearchHit } from "@/api/mappers";
import { getAlternatives, getProduct } from "@/api/openFoodFacts";
import { alternativesFilter } from "@/lib/alternativesFilter";
import { Product } from "@/types/product";
import { useState } from "react";

export default function useProductLookup() {
    const [product, setProduct] = useState<Product | null>(null);
    const [error, setError] = useState<string>("");
    const [alternatives, setAlternatives] = useState<Product[]>([]);
    const [productLoading, setProductLoading] = useState<boolean>(false);
    const [altsLoading, setAltsLoading] = useState<boolean>(false);

    const lookup = async (barcode: string) => {
        reset();
        let productRes;
        let altRes;
        try {
            setProductLoading(true);
            productRes = await getProduct(barcode);
        } catch (err) {
            setError("Product Not Found.");
            console.warn("Product Lookup Request Failed: ", err);
            return;
        } finally {
            setProductLoading(false);
        }
        if (productRes?.product) {
            const mappedProduct = mapBarcodeProduct(productRes.product);
            setProduct(mappedProduct);

            const productCategory: string = mappedProduct.category ?? "";
            const brandTags: string[] = mappedProduct.brandTags || [];
            if (productCategory) {
                try {
                    setAltsLoading(true);
                    altRes = await getAlternatives(productCategory, brandTags);
                    if (altRes?.hits) {
                        const mappedAlts = altRes.hits.map(mapSearchHit);
                        const rankedAlts = alternativesFilter(mappedProduct, mappedAlts);
                        setAlternatives(rankedAlts);
                        console.log("ALTS: ", altRes.hits);
                    }
                } catch (err) {
                    setError("Alternatives Not Found.");
                    console.warn("Alt Products Request Failed: ", err);

                    return;
                } finally {
                    setAltsLoading(false);
                }
            }
        }
    };

    const reset = () => {
        setProduct(null);
        setAlternatives([]);
        setProductLoading(false);
        setAltsLoading(false);
        setError("");
    };

    return {
        lookup,
        reset,
        error,
        productLoading,
        altsLoading,
        product,
        alternatives,
    };
}
