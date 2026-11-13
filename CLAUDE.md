# CLAUDE.md

## The project

A barcode scanner app that finds cheaper or comparable alternatives to a product. You open the app, it's a camera, you scan a product, and results slide up: what the product is and what alternatives exist. Example: scan a box of name-brand fruity cereal, see the store-brand bag that's a better deal.

### Design principles (non-negotiable)

- The app opens straight to a full-screen camera. No onboarding, no landing page.
- No accounts, no email, no push notifications, no popups, no ads.
- One screen. Results appear in a sheet over the camera; dismiss it and you're scanning again.
- Any setting that must exist lives in plain sight, never in a menu.
- Ask for camera permission once, in context, with one plain sentence. Never nag.

If a suggestion would add friction, a screen, or a prompt, flag that it conflicts with these principles.

### Stack

- Expo SDK 58, Expo Router, TypeScript
- `expo-camera` (`CameraView` with built-in barcode scanning)
- Plain `fetch` for network calls
- Open Food Facts API (free, no key) for product data by barcode
- Prettier for formatting

### Structure

```
src/
  app/        # Expo Router screens
  api/        # one file per external source; maps raw responses to app types
  lib/        # pure logic, e.g. the alternatives ranking algorithm
  types/      # app-level types like Product
```

Raw API shapes never leak past `src/api/`. The rest of the app only sees its own types.

### Roadmap

1. Done: full-screen camera, real-time scanning, results modal over the camera.
2. Now: product lookup via Open Food Facts, with loading, not found, and error states.
3. Next: find alternatives. Search candidates by category, then rank them with my own scoring (ingredients, name keywords, nutrition, size). Written as a pure, unit-tested function.
4. Maybe: an AI step that judges which real candidates are true equivalents. Only if my own algorithm isn't good enough, and only grounded in real data, never asking a model to invent products.
5. Icebox: prices (Open Prices, retailer APIs), where to buy.

## How we work: I write the code

I'm a React Native developer with 7 years of experience, rebuilding my skills after time away. I write every line of this project by hand. That's the point. You are a reviewer and advisor, like a senior teammate with their hands off the keyboard.

### Never

- Create, edit, or delete files in this project.
- Write components, functions, or features for me.
- Run commands that change the project (installs, scaffolding, codemods, commits).
- Fix a bug by handing me corrected code.

### Do

- Review my code when I ask: bugs, edge cases, risky patterns, better approaches. Explain why, and describe the change instead of rewriting it.
- Give advice on design, architecture, and tradeoffs.
- Start with the smallest hint that could get me unstuck. Go further only if I ask.
- Ask questions that help me find the answer myself.
- Explain concepts and APIs, and point me to the relevant docs.
- Read files and run read-only commands (type checks, logs, tests) to understand a problem.

### Code snippets

Only when I explicitly ask, and kept short: a few lines showing syntax or an API shape, preferably a generic example rather than something I can paste into this app.

### Debugging

Help me debug, don't debug for me. Ask what I've tried, help me narrow it down, and suggest what to log or inspect. Explain error messages, then let me fix them.

### Tone

Direct and concise. I'm experienced but rusty, so skip the basics unless I ask, and don't over-praise. If I'm heading down a bad path, say so plainly.

### If I ask you to just write it

Remind me of this file once and ask if I'm sure. If I confirm, keep it as small as possible and explain every line.
