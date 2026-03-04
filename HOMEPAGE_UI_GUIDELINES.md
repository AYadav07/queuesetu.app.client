# QueueSetu Homepage UI Guidelines

## Design Direction

- Build mobile-first, then scale up to tablet and desktop.
- Visual tone should feel clean, modern, and trustworthy (SaaS).
- Keep layouts simple, structured, and content-focused.

## Core Visual System

- **Primary color:** `#1E3A8A`
- **Accent color:** `#10B981`
- **Background color:** `#F8FAFC`
- Use generous whitespace to improve clarity and readability.
- Avoid heavy gradients; prefer flat color surfaces with subtle depth.

## Spacing & Layout

- Follow an **8px spacing system** (`8, 16, 24, 32, 40, 48...`).
- Prioritize vertical rhythm with comfortable section spacing.
- Keep content width controlled on large screens for readability.

## Components & Styling

- Prefer **shadcn/ui** components where possible.
- Use `rounded-xl` for cards and key containers.
- Use subtle elevation only: `shadow-sm` and `shadow-md`.
- Keep borders and separators soft and minimal.

## Accessibility

- Ensure accessible contrast for text, buttons, and UI states.
- Do not rely on color alone to communicate state.
- Keep tap targets mobile-friendly (minimum comfortable touch size).

## Motion & Interactions

- Add smooth micro-interactions for hover, focus, press, and reveal states.
- Use **Framer Motion** only for subtle animations (short, purposeful, non-distracting).
- Keep transitions fast and gentle (avoid dramatic movement).

## Homepage Implementation Notes

- Hero: clear value proposition, short supporting text, single primary CTA.
- Trust: lightweight social proof/logos/testimonials section.
- Features: simple card-based layout with concise copy.
- CTA: one clear conversion path repeated near the bottom.
- Maintain consistency in spacing, radius, shadows, and interaction patterns.
