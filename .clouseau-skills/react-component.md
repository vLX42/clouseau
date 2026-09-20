---
name: react-component
description: Build a single React functional component with typed props.
---

# react-component

Use when the user asks to create a React component.

Steps:
1. Pick a `PascalCase` file name matching the export, e.g. `TodoApp.tsx`.
2. Default-export a functional component that takes a typed `Props` object.
3. Prefer `useState` and `useEffect` from `react`. Do not pull in extra libraries.
4. Inline styles are fine for a demo; use one `<style>` tag for keyframes only.

Skeleton:

```tsx
import { useState } from "react";

type Props = { /* … */ };

export default function MyComponent(props: Props) {
  return <div>…</div>;
}
```
