---
name: a11y-todo
description: Accessibility checklist for a todo list component.
---

# Accessibility checklist for a todo list

This is a research note. A subagent will summarise it into a 4-bullet
checklist.

## Labels

- The text input MUST have a visible label *or* an `aria-label`. Placeholder
  text alone is not a label — it disappears on input and screen readers
  may or may not announce it.
- Each checkbox MUST have an associated label, ideally by wrapping
  `<label>` around it, or via `aria-labelledby` referencing the todo's
  text element.
- The "×" delete button needs `aria-label="remove <todo text>"` because
  the visual "×" tells a screen reader nothing.

## Focus management

- After adding a new todo, focus should stay on the input so the user
  can type the next item.
- After removing a todo, focus should not be lost into the void —
  move it to the next remaining item or back to the input.
- A visible focus ring on all interactive elements. Don't suppress it
  with `outline: none` without providing an alternative.

## ARIA

- Wrap the list in `<ul>` — semantic HTML beats roles when it's available.
- Don't put `role="checkbox"` on a `<div>` — use `<input type="checkbox">`
  and the browser does it for you.
- If the list has live updates from elsewhere (e.g. realtime sync),
  consider `aria-live="polite"` on the list container.

## Keyboard

- Tab moves between input → Add → each row's checkbox → row's delete.
- Enter in the input adds.
- Space toggles a focused checkbox.
- The order must be predictable — match the visual top-to-bottom flow.

## Colour & contrast

- Don't rely on colour alone to indicate completion — also use
  line-through or an icon, so colourblind users can perceive state.
- Contrast ratios: at least 4.5:1 for text, 3:1 for non-text UI.
