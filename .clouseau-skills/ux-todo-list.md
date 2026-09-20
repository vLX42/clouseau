---
name: ux-todo-list
description: UX research brief — best practices for todo list interfaces.
---

# UX considerations for a todo list

This is a research note. A subagent will summarise it into a 4-bullet brief.

## Input affordance

- Single text input with placeholder ("add an item…") and an obvious Add
  button next to it.
- Enter key in the input must also submit — keyboard-first users hate
  having to reach for the mouse.
- Empty input must not be addable (trim whitespace then check length).
- After adding, clear the input but keep focus on it for rapid entry.

## Empty state

- Don't render an empty `<ul>` with nothing in it — the user wonders if
  the app is broken.
- Show a one-line hint: "No todos yet. Add one above." in a muted style.

## Edit and delete

- A checkbox toggles `done` and applies a line-through style to the
  text. Don't move completed items to a separate list unless asked.
- Each row has a small "×" button to remove, with an `aria-label`
  describing what it removes.
- Removal should be immediate (no confirm dialog for a single item) —
  the app is a demo; over-confirming feels paternalistic.
- Optional: a "clear completed" link near the bottom of the list.

## Persistence

- For a quick demo, in-memory state is fine.
- For a real tool, persist to `localStorage` keyed by a stable name,
  loading on mount inside a `useEffect`. Don't block the first render
  on persistence.

## Typography & spacing

- Generous line-height (1.5+) so the list is scannable.
- A subtle border or background on hover to suggest the row is
  interactive.
