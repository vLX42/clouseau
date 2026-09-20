---
name: react-todo
description: Build a complete React todo list component, after a single subagent gathers UX + a11y guidance.
---

# react-todo

Use when the user asks for a todo list, task list, or to-do app in React.

## Workflow

1. **Design-research subagent (one call, required).** Spawn a research
   subagent so the design notes don't clutter your own context.
   Use `spawn_subagent` with EXACTLY this task:

   > "Read both `.clouseau-skills/ux-todo-list.md` and
   > `.clouseau-skills/a11y-todo.md`. Return ONE combined brief: 3 UX
   > bullets, 3 a11y bullets. Under 120 words total."

   That single summary is enough — don't spawn more subagents for this task.

2. **Write `TodoApp.tsx`** at the workspace root, following the brief.
   Use the skeleton below as a starting point and adapt for any UX/a11y
   notes the subagent surfaced.

3. **Verify** with `file_exists("TodoApp.tsx")` and reply with the path
   plus one sentence about which finding(s) from the brief you applied.

## Skeleton

```tsx
import { useState, useEffect } from "react";

type Todo = { id: string; text: string; done: boolean };

export default function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    const raw = localStorage.getItem("todos");
    if (raw) setTodos(JSON.parse(raw));
  }, []);
  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos));
  }, [todos]);

  const add = () => {
    const t = draft.trim();
    if (!t) return;
    setTodos((xs) => [...xs, { id: crypto.randomUUID(), text: t, done: false }]);
    setDraft("");
  };
  const toggle = (id: string) =>
    setTodos((xs) => xs.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  const remove = (id: string) =>
    setTodos((xs) => xs.filter((t) => t.id !== id));

  return (
    <div>
      <h2>Todos</h2>
      <label>
        <span style={{ display: "none" }}>new todo</span>
        <input
          aria-label="new todo"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="add an item…"
        />
      </label>
      <button onClick={add}>Add</button>
      {todos.length === 0 ? (
        <p>No todos yet. Add one above.</p>
      ) : (
        <ul>
          {todos.map((t) => (
            <li
              key={t.id}
              style={{ textDecoration: t.done ? "line-through" : "none" }}
            >
              <input
                type="checkbox"
                aria-label={t.text}
                checked={t.done}
                onChange={() => toggle(t.id)}
              />
              {t.text}
              <button onClick={() => remove(t.id)} aria-label={`remove ${t.text}`}>
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```
