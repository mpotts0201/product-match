// scripts/eval.ts
// Runs each test case through the model and scores it against your answer key.
// Run with: npm run eval
// Different model: npm run eval -- gemma3:4b

import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
// Node's built-in fetch gives up if a server takes over 5 minutes to start replying.
// Ollama doesn't reply until it has read every image, so a long run hits that limit.
// undici is the library behind Node's fetch; using it directly lets us turn the limits off.
import { Agent, fetch as fetchNoLimit } from "undici";
import { buildEquivalencePrompt, PromptProduct } from "../src/lib/equivalencePrompt";
import { coreIngredients, prefilterCandidates } from "../src/lib/prefilter";
const noTimeouts = new Agent({ headersTimeout: 0, bodyTimeout: 0 });

const MODEL = process.argv[2] ?? "gemma3:4b";
const OLLAMA_URL = "http://localhost:11434/api/chat";
const RUNS_PER_CASE = 1; // temperature 0 gives the same answer every run
const USE_PREFILTER = true;

// Image experiment. Needs a vision model (gemma3:4b, gemma3:12b, llama3.2-vision).
// Each image is slow to process, so the candidate list is capped smaller.
const USE_IMAGES = true;
const MAX_CANDIDATES = USE_IMAGES ? 8 : 15;

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

// Photos are saved to evals/images/<barcode>.jpg the first time they download.
// After that they're read from disk, so every run uses identical photos and
// Open Food Facts' flaky image server can't change your results.
const IMAGE_DIR = "evals/images";
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Returns the photo as base64 text, which is how Ollama accepts images.
async function imageAsBase64(url: string, code: string): Promise<string> {
    const cached = `${IMAGE_DIR}/${code}.jpg`;
    if (existsSync(cached)) return (await readFile(cached)).toString("base64");

    let lastError = "";
    for (let attempt = 1; attempt <= 3; attempt++) {
        try {
            const res = await fetch(url, {
                headers: { "User-Agent": "product-match-eval/0.1" },
                signal: AbortSignal.timeout(30_000),
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const bytes = Buffer.from(await res.arrayBuffer());
            await mkdir(IMAGE_DIR, { recursive: true });
            await writeFile(cached, bytes);
            return bytes.toString("base64");
        } catch (err) {
            lastError = (err as Error).message;
            await sleep(2000 * attempt); // back off: 2s, 4s, 6s
        }
    }
    throw new Error(lastError);
}

// Sends one request to Ollama. "format" forces { "matches": [numbers] }.
// "images" rides along on the user message, in the order the text describes.
//
// Streams the answer so you can watch it being written in your terminal.
// No time limit: it runs as long as the model needs.
async function askModel(system: string, user: string, images: string[]): Promise<number[]> {
    console.log(`   Sending ${images.length} images to ${MODEL}, waiting for it to read them...`);
    const res = await fetchNoLimit(OLLAMA_URL, {
        method: "POST",
        dispatcher: noTimeouts,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            model: MODEL,
            stream: true,
            think: false,
            // num_ctx is how much text + images the model can hold at once. Each image costs
            // about 256 tokens, so 9 images plus the candidate text overflows the default.
            // num_predict caps the answer length. 1500 leaves room for thinking models;
            // non-thinking models stop on their own after ~20 tokens anyway.
            options: { temperature: 0, num_predict: 1500, num_ctx: 16384 },
            format: {
                type: "object",
                properties: { matches: { type: "array", items: { type: "integer" } } },
                required: ["matches"],
            },
            messages: [
                { role: "system", content: system },
                { role: "user", content: user, ...(images.length ? { images } : {}) },
            ],
        }),
    });
    if (!res.ok || !res.body) throw new Error(`Ollama error ${res.status}: ${await res.text()}`);

    // The stream is one small JSON object per line, each holding a piece of the answer.
    const decoder = new TextDecoder();
    let buffer = "";
    let answer = "";
    process.stdout.write("   Writing: ");
    for await (const chunk of res.body as unknown as AsyncIterable<Uint8Array>) {
        buffer += decoder.decode(chunk, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? ""; // last line may be incomplete; keep it for the next chunk
        for (const line of lines) {
            if (!line.trim()) continue;
            const message = JSON.parse(line).message ?? {};
            // Thinking models (like Qwen) may stream reasoning separately before the answer.
            // It's shown so you can see what's happening, but it isn't part of the answer.
            if (message.thinking) process.stdout.write(`\x1b[2m${message.thinking}\x1b[0m`);
            const piece: string = message.content ?? "";
            answer += piece;
            process.stdout.write(piece);
        }
    }
    process.stdout.write("\n");

    if (!answer.trim()) {
        throw new Error(
            "model returned an empty answer (it may have spent its whole token budget thinking; raise num_predict)",
        );
    }
    // The full answer is a JSON string, like {"matches":[1,2]}.
    return JSON.parse(answer).matches ?? [];
}

async function runCase(c: (typeof CASES)[number]) {
    const productFile = await loadJson(c.product);
    const searchFile = await loadJson(c.search);
    const key: Key = await loadJson(c.key);

    const scanned: PromptProduct = productFile.product ?? productFile;
    const allCandidates: PromptProduct[] = searchFile.hits ?? [];

    // The prompt is built from THIS list, so the model's numbers map back through it.
    let candidates = USE_PREFILTER
        ? prefilterCandidates(scanned, allCandidates, {
              maxCandidates: MAX_CANDIDATES,
              requireImage: USE_IMAGES,
          })
        : allCandidates;

    // Images: scanned product first, then each candidate in list order.
    // Downloaded BEFORE building the prompt, so a candidate whose photo fails to
    // download is dropped and the numbering still lines up with the photos.
    let images: string[] = [];
    if (USE_IMAGES) {
        if (!scanned.image_front_small_url) {
            console.log(
                `\n=== ${c.name}: skipped (scanned product has no image_front_small_url; add it to fields) ===`,
            );
            return;
        }
        images.push(await imageAsBase64(scanned.image_front_small_url, scanned.code ?? "scanned"));
        const withPhotos: PromptProduct[] = [];
        for (const x of candidates) {
            try {
                images.push(await imageAsBase64(x.image_front_small_url!, x.code ?? "unknown"));
                withPhotos.push(x);
            } catch (err) {
                console.log(
                    `   (photo failed after 3 tries, dropping ${x.product_name}: ${(err as Error).message})`,
                );
            }
        }
        candidates = withPhotos;
    }

    let { system, user } = buildEquivalencePrompt(scanned, candidates);

    if (USE_IMAGES) {
        user +=
            `\n\n${images.length} product photos are attached in order. ` +
            `Photo 1 is the main product. Photo 2 is alternative candidate 1, photo 3 is alternative candidate 2, and so on. ` +
            `Use the photos to check what you would recommend.`;
    }

    const expected = new Set(key.expected);
    const acceptable = new Set(key.acceptable ?? []);
    const nameOf = (code: string) =>
        allCandidates.find((x) => x.code === code)?.product_name ?? code;

    console.log(
        `\n=== ${c.name} (${allCandidates.length} -> ${candidates.length} candidates, ` +
            `model ${MODEL}${USE_IMAGES ? ", with photos" : ""}) ===`,
    );
    const core = coreIngredients(scanned);
    console.log(
        core.length
            ? `   main ingredients: ${core.join(", ")}`
            : "   WARNING: scanned product has no ingredient data, so the ingredient filter was skipped.",
    );
    console.log("   Sent to the model:");
    candidates.forEach((x, i) => console.log(`     ${i + 1}. ${x.product_name}`));

    const filteredOut = [...expected].filter((code) => !candidates.some((x) => x.code === code));
    if (filteredOut.length) {
        console.log(`   NOTE: not sent to the model: ${filteredOut.map(nameOf).join("; ")}`);
    }

    for (let run = 1; run <= RUNS_PER_CASE; run++) {
        const started = Date.now();
        const picks = await askModel(system, user, images);
        const seconds = ((Date.now() - started) / 1000).toFixed(1);

        const pickedCodes = picks
            .map((n) => candidates[n - 1]?.code)
            .filter((code): code is string => Boolean(code));
        const picked = new Set(pickedCodes);

        // Only score against expected items the model actually saw.
        const reachable = [...expected].filter((code) => candidates.some((x) => x.code === code));
        const correct = reachable.filter((code) => picked.has(code));
        const missed = reachable.filter((code) => !picked.has(code));
        const wrong = pickedCodes.filter((code) => !expected.has(code) && !acceptable.has(code));

        console.log(`   Model picked: [${picks.join(", ")}] (${seconds}s)`);
        console.log(`   Score: ${correct.length}/${reachable.length} found, ${wrong.length} wrong`);
        if (missed.length) console.log(`     missed: ${missed.map(nameOf).join("; ")}`);
        if (wrong.length) console.log(`     wrong:  ${wrong.map(nameOf).join("; ")}`);
    }
}

async function main() {
    for (const c of CASES) {
        try {
            await runCase(c);
        } catch (err) {
            // "fetch failed" hides the real reason in err.cause, so print both.
            const e = err as Error & { cause?: unknown };
            console.log(`\n=== ${c.name}: skipped (${e.message}) ===`);
            if (e.cause) console.log("   cause:", e.cause);
        }
    }
}

main();
