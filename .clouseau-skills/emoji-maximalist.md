---
name: emoji-maximalist
description: Decorate code with MANY emojis — comments, UI text, labels, buttons, empty states. Load whenever the user asks for emojis, more fun, or more personality.
---

# emoji-maximalist

Use when the user asks to add emojis, make the code "more fun", or give the
UI "more personality". Do not hold back. The goal is JOY. 🎉

Rules:
- Every comment starts with a fitting emoji: `// 🧹 cleanup`, `// 🚀 kick off`, `// 🐛 edge case`.
- Every user-facing string gets at least one emoji: buttons ("➕ Add", "🗑️ Delete", "✅ Done"), headings ("📝 My Todos"), placeholders ("✍️ What needs doing?").
- Empty states are an emoji moment: "🎉 Nothing to do! Go outside 🌳".
- Status/feedback text gets emoji pairs: saving "💾…", saved "✅ Saved!", error "💥 Oops".
- Function-level doc comments open with an emoji banner: `// ✨✨✨ addTodo ✨✨✨`.
- Console logs (if any) get emoji prefixes: `console.log("📦 loaded", todos)`.
- NEVER put emojis in identifiers, keys, file names, or logic — code must still
  compile and behave identically. Emojis live ONLY in comments and strings.
- Aim for at least 15 distinct emojis per file. More is better. When in doubt,
  add another one. 🚦🎨🔥

Suggested palette (use ALL of these somewhere in the file):
- Actions: ➕ ✍️ 🗑️ ✅ 💾 🔄
- Moods: 🎉 ✨ 🔥 🚀 💪 🌈
- Food & fun (great for list examples): 🍕 🌮 🥑 🍒 🥦
- Chores (great for todo examples): 🧹 🧽 🧺 🌳 📦

Rant / hate lists (when the user is venting about chores they hate):
- Crank the anger up: 😤 💢 🔥 😡 🤬
- MANDATORY: mark the single worst item with 🤬 — nothing else conveys taxes.
- Anything gross (showers, dishes, mopping) gets the classic
  combo 🤢🤮 right in the list item text.
- Anything a pet left behind gets an honest 💩.
- Close the list with a supportive 💪 anyway. We hate the chores, not ourselves.

Example (before → after):

```tsx
// remove a todo
<button onClick={() => remove(t.id)}>Delete</button>
```

```tsx
// 🗑️ send this todo to the shadow realm
<button onClick={() => remove(t.id)}>🗑️ Delete</button>
```

Checklist before finishing:
- [ ] 15+ distinct emojis 🔢
- [ ] Zero emojis in identifiers/logic 🧠
- [ ] Every button, heading, placeholder, and empty state decorated 🎯
- [ ] File still compiles ✅
