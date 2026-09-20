---
name: react-form
description: Build a controlled React form with per-field state and an onSubmit handler.
---

# react-form

Use when the user asks for an input form, sign-up form, or any controlled inputs.

Pattern:
- One `useState` per field, or a single `useState({ ... })` for related fields.
- Each input is fully controlled: `value=`, `onChange=`.
- `onSubmit` calls `e.preventDefault()` before doing work.
- Disable the submit button while submitting.

Skeleton:

```tsx
import { useState } from "react";

export default function MyForm() {
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    // …
    setBusy(false);
  };
  return (
    <form onSubmit={submit}>
      <input value={name} onChange={(e) => setName(e.target.value)} />
      <button disabled={busy}>Save</button>
    </form>
  );
}
```
