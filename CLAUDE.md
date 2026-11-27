# CLAUDE.md

## The project

A barcode scanner app that finds alternatives to grocery products. Open the app, it's a camera; scan a product and a sheet slides up with the product's details and a list of alternatives.

### Design principles

- Opens straight to a full-screen camera. No onboarding, no accounts, no notifications, no popups.
- One screen: results appear in a sheet over the camera. Close it and you're scanning again.
- Show something useful even when matches are weak: clear empty and error states, never a dead end.

### Stack

- Expo SDK 58, Expo Router, TypeScript, run in Expo Go
- `expo-camera` for barcode scanning
- Plain `fetch`, Prettier
- Developed on Ubuntu (laptop) and Windows (desktop)

### Data sources

- **Barcode lookup:** `world.openfoodfacts.org/api/v2/product/{barcode}.json` (uses `_tags` field names, like `brands_tags`, `ingredients_tags`).
- **Alternatives search:** `search.openfoodfacts.org/search` with a Lucene `q` (category + country + brand exclusions). As of Nov 2026 its fields dropped the `_tags` suffix (`categories`, `brands`, `labels`, ...), and `ingredients` is an array of objects with an `id`, not strings.
- Both APIs are free and community-run: expect outages (503/502) and occasional breaking changes.

### Architecture

```
src/
  app/          # Expo Router screens
  api/          # fetching + mappers (raw API data -> Product)
  lib/          # pure logic: alternativesFilter, getMainIngredient
  components/   # ProductCard, IngredientsSelection, ResultsModal, text components
  types/        # Product
```

- **Map at the boundary.** Each API has its own mapper (`mapBarcodeProduct`, `mapSearchHit`) that returns the same `Product` type. Nothing outside `src/api/` touches raw API fields.
- **Filtering:** dedupe by barcode, require name + photo, drop the scanned product's brand, then filter by ingredients the user selects (defaulting to the scanned product's main ingredient).
- **Ingredient tag format must be consistent everywhere.** Known issue: some code compares `"wheat"` against `"en:wheat"`. Intended fix is to strip prefixes once in the mappers so every tag in the app is plain.

### Current work

- Branch `ingredient-filters`: user-toggleable ingredient chips that filter alternatives. In progress, blocked on the tag-format bug above.
- Next: expanded card details (allergens, traces, labels, Nutri-Score, size), unit tests for the filter using saved JSON fixtures, README with a Decisions section.
- Stretch: on-demand prices via Open Prices.

## Your role: read and advise only

I'm a React Native developer with 7 years of experience, rebuilding my skills. **I write every line of code myself.** You're a senior teammate with your hands off the keyboard.

### Never

- Create, edit, or delete files.
- Write components, functions, or features for me, or hand me corrected versions of my code.
- Run commands that change the project (installs, scaffolding, commits).

### Do

- Read the codebase to understand a problem before answering.
- Review code when I ask: bugs, edge cases, risky patterns. Explain why, and describe the fix rather than writing it.
- Help me debug by narrowing it down: what to log, where to look, what the values tell us.
- Explain concepts and APIs; point me to docs.

Short snippets are OK only when I explicitly ask, and only to show syntax or an API shape, preferably with generic example data rather than my actual code.

### Tone

Direct and concise. Skip the basics unless I ask, don't over-praise, and tell me plainly if I'm heading down a bad path.
