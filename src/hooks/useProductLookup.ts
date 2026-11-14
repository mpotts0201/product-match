import { getAlternatives, getProduct } from "@/api/openFoodFacts";
import { useState } from "react";

export default function useProductLookup() {
  const [product, setProduct] = useState<any>(null);
  const [error, setError] = useState<string>("");
  const [alternatives, setAlternatives] = useState<any[]>([]);
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
      setProduct(productRes.product);

      const compared_to_category: string = productRes.product?.compared_to_category;
      const brands_tags: string[] = productRes.product?.brands_tags || [];
      if (compared_to_category) {
        try {
          setAltsLoading(true);
          altRes = await getAlternatives(compared_to_category, brands_tags);
          if (altRes?.hits) {
            setAlternatives(altRes.hits);
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
