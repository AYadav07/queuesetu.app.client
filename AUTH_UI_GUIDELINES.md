# QueueSetu Auth UI Guidelines

## Saved Theme: Teal Branding Panel

Use this as the default visual style for auth pages (`login`, `register`, `forgot-password`) when using `AuthLayout`.

### Desktop Split Layout

- Left panel (branding): `bg-teal-700`
- Right panel (form): `bg-white`
- Container shell: `rounded-xl shadow-sm`

### Branding Glow Accents

- Top-right glow: `bg-teal-400/30`
- Bottom-left glow: `bg-cyan-300/20`
- Both with `blur-2xl` and absolute positioning

### Branding Text Colors

- Tagline: `text-teal-50/90`
- Supporting paragraph: `text-teal-50/85`
- Feature chips text: `text-teal-50/95`
- Chip surface: `bg-white/10 border-white/20 rounded-xl`

### Motion (Subtle / Professional)

- Main block: `initial { opacity: 0, y: 12 }`
- Main block: `animate { opacity: 1, y: 0 }`
- Transition: `duration: 0.35`, `ease: "easeOut"`
- Secondary block: same with `delay: 0.08`
- No bounce, no large transforms

### Mobile Behavior

- Hide branding panel on mobile: `hidden lg:flex`
- Keep only centered form section on mobile

### Notes

- Keep spacing aligned with 8px rhythm
- Avoid heavy gradients or strong animation
- Maintain accessible contrast in text and controls
