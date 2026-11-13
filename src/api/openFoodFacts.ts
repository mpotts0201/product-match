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
