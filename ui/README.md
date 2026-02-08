# Mongoose Studio UI

This directory contains the Next.js application for the **Mongoose Studio** dashboard interface (v1.2.0).

Now features:
- **Smart Type Inference** & **Deep Linking**
- **Visual Aggregation Builder**
- **Premium Dark Mode UI** with Shadcn/ui & Tailwind

It handles:
- Connection to the `mongoose-studio` server (running on port 5555 by default).
- Rendering the Schema Explorer, Data Grid, and Document Forms.
- Strictly dark-themed UI components built with Tailwind CSS.

## Development

The UI is built automatically when you run the main CLI in dev mode.
To run this separately (for UI-only dev):

```bash
cd ui
npm run dev
```
