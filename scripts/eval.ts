// scripts/eval.ts
// Runs each test case through the model and scores it against your answer key.
// Run with: npm run eval
// Optional: npm run eval -- qwen3.5:2b   (pick a different model)

import { readFile } from "node:fs/promises";
import { buildEquivalencePrompt, PromptProduct } from "../src/lib/equivalencePrompt";
import { coreIngredients, prefilterCandidates } from "../src/lib/prefilter";

const MODEL = process.argv[2] ?? "llama3.2:3b";
const OLLAMA_URL = "http://localhost:11434/api/chat";
const RUNS_PER_CASE = 1; // temperature 0 gives the same answer every run; raise this if you raise temperature
const USE_PREFILTER = true; // set false to compare against the raw 50-candidate baseline

// One entry per product you want to test. Add chips/pretzels here later.
// product: the barcode lookup response you saved
// search:  the Search-a-licious response you saved
// key:     { "expected": [barcodes], "acceptable": [barcodes] }
const CASES = [
    {
        name: "Nutella",
        product: "evals/nutella.json",
        search: "evals/nutella_match.json",
        key: "evals/nutella_key.json",
    },
    {
        name: "Honey Nut Cheerios",
        product: "evals/cheerios.json",
        search: "evals/cheerios_match.json",
        key: "evals/cheerios_key.json",
    },
];

type Key = { expected: string[]; acceptable?: string[] };

async function loadJson(path: string) {
    return JSON.parse(await readFile(path, "utf8"));
}

// Sends one request to Ollama. "format" forces the reply into
// { "matches": [numbers] }, so it can't answer with prose or Python.
async function askModel(system: string, user: string): Promise<number[]> {
    const res = await fetch(OLLAMA_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            model: MODEL,
            stream: false,
            think: false, // turns off long "thinking" output on models that support it
            options: { temperature: 0 },
            format: {
                type: "object",
                properties: { matches: { type: "array", items: { type: "integer" } } },
                required: ["matches"],
            },
            messages: [
                { role: "system", content: system },
                { role: "user", content: user },
            ],
        }),
    });
    if (!res.ok) throw new Error(`Ollama error ${res.status}: ${await res.text()}`);
    const data = await res.json();
    // The reply text is a JSON string, so it gets parsed a second time.
    return JSON.parse(data.message.content).matches ?? [];
}

async function runCase(c: (typeof CASES)[number]) {
    const productFile = await loadJson(c.product);
    const searchFile = await loadJson(c.search);
    const key: Key = await loadJson(c.key);

    // The barcode lookup wraps the product in { product: {...} }.
    const scanned: PromptProduct = productFile.product ?? productFile;
    const allCandidates: PromptProduct[] = searchFile.hits ?? [];

    // The prompt is built from THIS list, so the model's numbers map back through it.
    const candidates = USE_PREFILTER ? prefilterCandidates(scanned, allCandidates) : allCandidates;

    const { system, user } = buildEquivalencePrompt(scanned, candidates);

    const expected = new Set(key.expected);
    const acceptable = new Set(key.acceptable ?? []);
    const nameOf = (code: string) =>
        allCandidates.find((x) => x.code === code)?.product_name ?? code;

    console.log(
        `\n=== ${c.name} (${allCandidates.length} -> ${candidates.length} candidates, model ${MODEL}) ===`,
    );
    const core = coreIngredients(scanned);
    console.log(
        core.length
            ? `   main ingredients: ${core.join(", ")}`
            : "   WARNING: scanned product has no ingredient data, so the ingredient filter was skipped. " +
                  "Add ingredients_tags to your barcode lookup's fields and re-save this file.",
    );
    candidates.forEach((x, i) => console.log(`   ${i + 1}. ${x.product_name}`));

    // If the prefilter removed something in your key, the model never had a chance at it.
    const filteredOut = [...expected].filter((code) => !candidates.some((x) => x.code === code));
    if (filteredOut.length) {
        console.log(
            `   WARNING: prefilter removed expected: ${filteredOut.map(nameOf).join("; ")}`,
        );
    }

    for (let run = 1; run <= RUNS_PER_CASE; run++) {
        const started = Date.now();
        const picks = await askModel(system, user);
        const seconds = ((Date.now() - started) / 1000).toFixed(1);

        // Numbers -> barcodes, using the same list the prompt was built from.
        const pickedCodes = picks
            .map((n) => candidates[n - 1]?.code)
            .filter((code): code is string => Boolean(code));
        const picked = new Set(pickedCodes);

        const correct = [...expected].filter((code) => picked.has(code));
        const missed = [...expected].filter((code) => !picked.has(code));
        const wrong = pickedCodes.filter((code) => !expected.has(code) && !acceptable.has(code));

        console.log(
            `Run ${run}: ${correct.length}/${expected.size} found, ${wrong.length} wrong (${seconds}s)  picks: [${picks.join(", ")}]`,
        );
        if (missed.length) console.log(`   missed: ${missed.map(nameOf).join("; ")}`);
        if (wrong.length) console.log(`   wrong:  ${wrong.map(nameOf).join("; ")}`);
    }
}

async function main() {
    for (const c of CASES) {
        try {
            await runCase(c);
        } catch (err) {
            console.log(`\n=== ${c.name}: skipped (${(err as Error).message}) ===`);
        }
    }
}

main();
