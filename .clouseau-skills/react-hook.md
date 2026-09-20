---
name: react-hook
description: Author a custom React hook with the `use*` naming convention.
---

# react-hook

Use when the user asks to extract reusable React state/effect logic.

Rules:
- Name starts with `use`, file name matches.
- Return a stable tuple `[value, setter]` when state-like, or a named object when there are more than two values.
- Every `useEffect` that touches a subscription must return a cleanup function.

Skeleton:

```tsx
import { useEffect, useState } from "react";

export function useThing(initial: string) {
  const [value, setValue] = useState(initial);
  useEffect(() => {
    // subscribe…
    return () => { /* cleanup */ };
  }, []);
  return [value, setValue] as const;
}
```
