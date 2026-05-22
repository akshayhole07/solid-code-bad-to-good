# Practical Exercise for Trainees (React Real-World Edition)

Hello From Akshay 👌

You are given a deliberately **badly written React e-commerce admin module** that simulates real-world behavior:
- order creation
- pricing/discount logic
- payment branching
- notification side-effects
- local persistence
- reporting/export

## Your tasks
1. Identify SOLID violations in `src/App.jsx`.
2. Refactor into a maintainable architecture.
3. Explain what improved and why.

## What makes this real-world
- Multiple business rules in one flow (pricing + discounts + payment + order state).
- External side effects (HTTP call, alerts, CSV export) mixed with UI.
- Persistence concerns mixed with rendering.
- Growth pain points: new payment methods, new discounts, new notification channels.

## Expected refactor direction
- Split domain logic into focused modules/services.
- Introduce abstractions for payment and notification behaviors.
- Move storage/API/reporting behind interfaces/adapters.
- Keep React components focused on view + orchestration.

## Run
```bash
npm install
npm run dev
```

## Files
- `src/App.jsx` (intentionally bad)
- `src/styles.css`
