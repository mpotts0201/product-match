// src/types/product.ts
export type Product = {
    code: string;
    name: string;
    brand?: string;
    brandTags: string[]; // for filtering out the same brand
    quantity?: string;
    imageUrl?: string;
    ingredientTags: string[];
    allergens: string[];
    labels: string[];
    category?: string; // for the alternatives search
    traces: string[];
};
