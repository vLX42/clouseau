---
marp: true
theme: default
paginate: true
size: 16:9
backgroundColor: "#f4ede0"
color: "#1a1a1a"
style: |
  section {
    font-family: 'JetBrains Mono', 'Menlo', ui-monospace, monospace;
    padding: 60px 80px;
  }
  h1, h2, h3 {
    font-family: 'Roboto Slab', Georgia, serif;
    color: #1a1a1a;
    margin-bottom: 0.4em;
  }
  h1 { font-size: 2.2em; letter-spacing: -0.5px; }
  h2 { font-size: 1.6em; }
  h3 { font-size: 1.15em; color: #5a4634; letter-spacing: 1.2px; text-transform: uppercase; }
  strong { color: #a8201a; }
  em { color: #5a4634; font-style: normal; border-bottom: 1px dashed #5a4634; }
  code { background: #1a1a1a; color: #e9e1cd; padding: 1px 6px; border-radius: 2px; }
  pre { background: #1a1a1a; color: #e9e1cd; padding: 18px; border-radius: 4px; font-size: 0.78em; }
  pre .hljs-string { color: #e8c07d; }
  pre .hljs-attr, pre .hljs-property { color: #9cdcfe; }
  pre .hljs-keyword { color: #f28b82; }
  pre .hljs-title, pre .hljs-built_in { color: #c3e88d; }
  pre .hljs-number, pre .hljs-literal { color: #f6c177; }
  pre .hljs-comment { color: #8a7d68; }
  pre .hljs-subst, pre .hljs-template-variable, pre .hljs-variable { color: #e9e1cd; }
  blockquote {
    border-left: 4px solid #a8201a;
    background: #ece4d3;
    padding: 12px 18px;
    margin: 16px 0;
    color: #2a2018;
    font-family: 'Caveat', 'Bradley Hand', cursive;
    font-size: 1.25em;
  }
  table { font-size: 0.78em; }
  th { background: #ece4d3; color: #5a4634; letter-spacing: 1px; }
  td, th { padding: 6px 10px; border-bottom: 1px solid #d8cdb6; }
  ul li { margin-bottom: 0.3em; }
  footer { color: #8a7d68; font-size: 0.55em; }
  section::after { color: #8a7d68; font-size: 0.6em; }
  .stamp {
    display: inline-block;
    border: 2px solid #7a1d14;
    outline: 1px dashed #7a1d14;
    outline-offset: 2px;
    color: #7a1d14;
    padding: 4px 10px;
    font-family: 'Roboto Slab', serif;
    font-weight: 700;
    letter-spacing: 1.5px;
    transform: rotate(-3deg);
  }
  .sticky {
    display: inline-block;
    background: #fef7c2;
    padding: 6px 10px;
    font-family: 'Caveat', cursive;
    font-size: 1.3em;
    box-shadow: 2px 4px 8px rgba(0,0,0,0.12);
    transform: rotate(1.5deg);
  }
  section.big {
    display: flex;
    flex-direction: column;
    justify-content: center;
    text-align: center;
  }
  section.big h1 { font-size: 3.2em; line-height: 1.1; }
  section.big h1:has(~ h1), section.big h1 ~ h1 { font-size: 2.5em; }
  section.big h2 { font-size: 2.2em; }
  section.case {
    display: flex;
    flex-direction: column;
    justify-content: center;
    background: #ece4d3;
  }
  section.case h3 { font-size: 1em; letter-spacing: 3px; }
  section.case h1 { font-size: 2.6em; }
  .plate {
    display: inline-block;
  }
  .plate h1, .plate h3, .plate p {
    color: #f4ede0;
    text-shadow:
      0 0 6px rgba(0, 0, 0, 0.95),
      0 0 14px rgba(0, 0, 0, 0.9),
      0 0 30px rgba(0, 0, 0, 0.85),
      0 0 55px rgba(0, 0, 0, 0.7),
      0 3px 6px rgba(0, 0, 0, 0.95);
  }
  .plate h3 { color: #e6d9c2; }
  section.demo {
    background: #1a1410;
    color: #e9e1cd;
    padding: 84px 70px 40px;
    border-left: 14px solid #a8201a;
  }
  section.demo::before {
    content: "⏵  LIVE DEMO  ·  leave the slides  ·  open the wall";
    position: absolute; top: 0; left: 0; width: 100%; box-sizing: border-box;
    padding: 12px 70px;
    background: repeating-linear-gradient(135deg, #a8201a 0 24px, #7a1d14 24px 48px);
    color: #f4ede0;
    font-family: 'Roboto Slab', serif; font-weight: 700;
    letter-spacing: 3px; font-size: 0.8em;
  }
  section.demo h2 { color: #f4ede0; margin: 0 0 0.2em; font-size: 1.45em; }
  section.demo h2 small { color: #e8c07d; font-size: 0.55em; letter-spacing: 2px; text-transform: uppercase; display: block; margin-bottom: 4px; }
  section.demo blockquote { background: #2a2018; color: #f4ede0; border-left-color: #e8c07d; font-size: 1.15em; margin: 8px 0 10px; padding: 8px 16px; }
  section.demo strong { color: #e8c07d; }
  section.demo em { color: #e9e1cd; border-bottom-color: #e8c07d; }
  section.demo code { background: #e9e1cd; color: #1a1410; }
  section.demo p, section.demo li { font-size: 0.78em; }
  section.demo p { margin: 0.35em 0; }
  section.demo ol, section.demo ul { margin: 0; }
  section.demo li { margin-bottom: 0.12em; }
  section.demo footer { color: #6b5f4d; }
  section.demo .say { position: absolute; right: 50px; bottom: 36px; color: #1a1a1a; font-size: 1.05em; max-width: 560px; }
  /* animated reconstructions: fragments (`*` items) step the animation */
  section.anim ul { list-style: none; margin: 0; padding: 0; }
  section.anim li { display: contents; }
  section.anim h2 { margin-bottom: 0.2em; }
  .wall { position: relative; height: 440px; margin-top: 8px; background: #c8a676; border: 6px solid #6b4a2b; border-radius: 4px; box-shadow: inset 0 0 40px rgba(0,0,0,0.25); }
  .wc { position: absolute; width: 140px; padding: 8px 10px 10px; background: #f7f1e3; color: #1a1a1a; font-size: 0.5em; line-height: 1.3; box-shadow: 2px 3px 8px rgba(0,0,0,0.35); transform: rotate(var(--r, 0deg)); }
  .wc::before { content: ""; position: absolute; top: -5px; left: 50%; width: 10px; height: 10px; border-radius: 50%; background: #a8201a; box-shadow: 0 1px 2px rgba(0,0,0,0.5); }
  .wc b { display: block; font-family: 'Roboto Slab', serif; font-size: 1.05em; letter-spacing: 1px; color: #5a4634; margin-bottom: 3px; }
  .wc.blue { background: #dbe8f6; }
  .wc.tool { background: #fef7c2; }
  .wc.big { width: 200px; border: 3px solid #a8201a; }
  .stampw { position: absolute; padding: 6px 12px; border: 3px solid #a8201a; outline: 1px dashed #a8201a; outline-offset: 3px; color: #a8201a; background: rgba(247,241,227,0.85); font-family: 'Roboto Slab', serif; font-weight: 700; font-size: 0.75em; letter-spacing: 2px; transform: rotate(-8deg); }
  .string { position: absolute; height: 2px; background: #a8201a; transform-origin: 0 0; box-shadow: 0 1px 1px rgba(0,0,0,0.4); }
  .ticker { position: absolute; right: 14px; top: 12px; background: #1a1410; color: #e8c07d; padding: 6px 12px; font-size: 0.6em; letter-spacing: 1px; }
  .ticker .hurt { color: #f28b82; font-weight: 700; }
  .polaroid { position: absolute; width: 230px; padding: 10px 10px 26px; background: #fff; color: #1a1a1a; font-size: 0.5em; box-shadow: 2px 3px 8px rgba(0,0,0,0.35); transform: rotate(var(--r, 0deg)); }
  .polaroid pre { margin: 0 0 6px; padding: 8px; font-size: 1em; background: #f7f1e3; color: #1a1a1a; border-radius: 2px; }
  .secret { color: #a8201a; }
  @keyframes land { from { transform: scale(1.8) rotate(-10deg); opacity: 0; } to { transform: scale(1) rotate(var(--r, 0deg)); opacity: 1; } }
  @keyframes slam { 0% { transform: scale(3) rotate(-25deg); opacity: 0; } 65% { transform: scale(0.92) rotate(-8deg); opacity: 1; } 100% { transform: scale(1) rotate(-8deg); } }
  @keyframes drawline { from { width: 0; } }
  @keyframes typein { from { clip-path: inset(0 100% 0 0); } to { clip-path: inset(0 0 0 0); } }
  section.anim li[data-bespoke-marp-fragment="active"] .land { animation: land 0.45s cubic-bezier(0.2, 0.8, 0.2, 1) both; }
  section.anim li[data-bespoke-marp-fragment="active"] .stampw { animation: slam 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) both; }
  section.anim li[data-bespoke-marp-fragment="active"] .string { animation: drawline 0.4s ease-out both; }
  section.anim li[data-bespoke-marp-fragment="active"] .line { animation: typein 0.6s steps(30) both; }
  section.anim:has(li[data-bespoke-marp-fragment="active"] .compacted) .wall > .wc { opacity: 0.3; transition: opacity 0.6s; }
  section.anim:has(li[data-bespoke-marp-fragment="active"] .redacted) .secret { background: #000; color: #000; transition: all 0.3s; }
  .screen { background: #1a1410; color: #e9e1cd; padding: 22px 26px; border-radius: 6px; font-size: 0.8em; line-height: 1.7; min-height: 380px; box-shadow: 0 10px 30px rgba(0,0,0,0.3); }
  .screen .line { white-space: pre; }
  .screen .dim { color: #8a7d68; }
  .screen .ok { color: #c3e88d; }
  .screen .ed { color: #e8c07d; }
  .screen .cur::after { content: "▍"; animation: blink 1s steps(2) infinite; }
  @keyframes blink { to { visibility: hidden; } }
footer: "Clouseau · agent visualiser · that is not my model"
---

<!-- _class: lead -->
<!-- _backgroundImage: url('frontend/public/cover.png') -->
<!-- _color: #f4ede0 -->
<!-- _paginate: false -->
<!-- _footer: "" -->

<div class="plate" style="position: absolute; right: 60px; top: 140px; width: 660px; text-align: right; background: linear-gradient(90deg, rgba(20,14,8,0) 0%, rgba(20,14,8,0.55) 25%, rgba(20,14,8,0.65) 100%); padding: 28px 30px 26px 80px; border-radius: 6px;">

# Does Your <br/> Agent Bite?

### your AI agent is a `while` loop <br/> in a ridiculous disguise

</div>

<!--
Good morning.

My name is Peter, and today I will be investigating a mystery.

What is actually going on inside Copilot, or Claude Code, or whichever one you use?

You use it every day.

You might not know what it's actually doing.
-->

---

<!-- _class: big -->

# Bonjour.

<span class="sticky">that is all the French I will attempt</span>

<!--
[Say Bonjour with a terrible accent, then look slightly ashamed.]

That was the French part of the talk.

It went about as well as expected.

I will now switch to Danglish.
-->

---

<!-- _class: big -->

# I am here to ruin some magic.

<!--
I'm sorry.

I really am.

Some of you came here believing your AI is close to AGI.

In reality it's just a fancy loop.
-->

---

You know the feeling.

Copilot, Claude Code, pick one.
It edits five files, runs the tests,
and tells you it **shipped**.

It feels _alive_.

<!--
Quick question, and please use the raise hand button in Teams.

Has AI changed more than fifty files for you this week?

[Wait for the little hands to pop up.]

Now keep your hand up only if you read and understood all of them.

[If some hands go down]

Thank you.

I can relate to that.

So I'm not the only one who can't keep up.

But it does feel alive, doesn't it?

Like there's somebody in there.
-->

---

<!-- _class: big -->
<!-- _transition: drop -->
<style scoped>
  section h1 { font-size: 2.6em; }
  ul { list-style: none; padding: 0; margin-top: 0.3em; }
  li { font-size: 1.4em; margin: 0.1em 0; color: #5a4634; }
  li:last-child { color: #1a1a1a; font-weight: 700; margin-top: 0.5em; font-size: 1.15em; }
</style>

# That feeling has a name.

* Not _intelligence_.
* Not _agency_.
* Not _magic_.
* Five letters. Lowercase. You have typed it a thousand times.

<!--
That feeling has a name.

[Click through the lines.]

Not intelligence.

Not agency.

Not magic.

Five letters, lowercase, and you have typed it a thousand times.

Usually while fixing some stupid CORS errors.
-->

---

<!-- _class: big -->

# `fetch`

<span class="sticky">spoilers, but that's why you're here</span>

<!--
Fetch.

That's what's doing much of the heavy lifting.

If someone thought about axios, we need to have a talk :)
-->

---

<!-- _class: lead -->
<!-- _backgroundImage: url('slides-assets/case-file.jpg') -->
<!-- _color: #f4ede0 -->

<div class="plate" style="margin-top: 380px; text-shadow: 0 2px 8px rgba(0,0,0,0.9);">

### THE CASE FILE

# Three exhibits. Then we solve it.

</div>

<!--
Let's get started, let's look at three exhibits and break down the magic.
-->

---

## The three exhibits

1. The model is a **stateless text-prediction endpoint**. JSON in, JSON out.
2. The harness is **a program you could write in an afternoon**. I did: Clouseau, ~1,100 lines. The loop fits in 12.
3. Everything that feels like _intelligence_ is the harness choosing **what JSON to send next**.

> Remember these three and you could build your own GitHub Copilot by Wednesday. (We won't. But you could.)

<!--
1. The model is a stateless text-prediction endpoint. JSON in, JSON out.
2. The harness is a program you could write in an afternoon. I did for this talk: It's called Clouseau, about 1,100 lines, and the loop fits in 12.
3. Everything that feels like intelligence is the harness choosing what JSON to send next.

Remember these three and you could build your own GitHub Copilot by Wednesday.

We won't.

But you could.
-->

---

<!-- _class: lead -->
<!-- _backgroundImage: url('slides-assets/magic-show.jpg') -->
<!-- _color: #f4ede0 -->

<div class="plate" style="margin-top: 380px; text-shadow: 0 2px 8px rgba(0,0,0,0.9);">

### CASE Nº 001

# The Disappearing Magic

</div>

<!--
Case number one, the disappearing magic.
-->

---

<!-- _class: anim -->

## What the room sees, every day

<div class="screen">

<div class="line">$ copilot -p "Add a dark-mode toggle to App.tsx and verify the build"</div>

* <div class="line dim">◐ thinking…</div>
* <div class="line ed">✎ edited   src/App.tsx        (+41 −3)</div>
* <div class="line ed">✎ created  src/theme.css</div>
* <div class="line">$ npm run build</div>
* <div class="line ok">✓ built in 1.21s</div>
* <div class="line cur">Done. Dark-mode toggle added and the build passes.</div>

</div>

<span class="sticky" style="position:absolute; right:60px; bottom:50px;">files appeared. terminal ran. smile landed.</span>

<!--
This is a reenactment of what you see every day.

[Step through the animation.]

You ask for a dark-mode toggle.

It's thinking, it edits App.tsx, creates theme.css, runs the build, and the build passes.

-->

---

<!-- _class: big -->

# What just happened?

<!--
So what just happened?
-->

---

Everyone answers the same thing:

## "The AI did it."

<!--
Everyone answers the same thing.

The AI did it.
-->

---

<!-- _class: big -->

# We have arrested the wrong suspect.

<!--
We have arrested the wrong suspect.

Didn't I just tell you that the model is a stateless text prediction machine, how can it write a file?

-->

---

<!-- _class: big -->

# The model sent JSON.

# The harness ran your commands.

Let me introduce the detective.

<!--
The model sent JSON.

The harness ran your commands.

Let me introduce the detective.
-->

---

## Meet the detective

![bg right:42% contain](frontend/public/cover.png)

**Clouseau**: small, throwaway, hand-rolled agent.

- Harness core: ~1,100 lines of TS, **zero SDK**, raw `fetch`.
- Frontend: a corkboard. Every internal event gets pinned.
- Red string, so you can _see_ causality.

<!--
Meet the detective.

Clouseau is a small, throwaway, hand-rolled agent.

The harness core is about 1,100 lines of TypeScript, with zero SDK, just raw fetch.

The frontend is a board, where every internal event gets pinned.

And there's red string, so you can see causality.

Also because a board without red string is just a noticeboard, we need a crazy wall for this.
-->

---

<!-- _class: lead -->
<!-- _backgroundImage: url('slides-assets/while-loop.jpg') -->
<!-- _color: #f4ede0 -->

<div class="plate" style="margin-top: 380px; text-shadow: 0 2px 8px rgba(0,0,0,0.9);">

### CASE Nº 002

# It's a `while` Loop

</div>

<!--
Case number two.

It's a while loop.
-->

---

## Exhibit A

```ts
let messages = [systemPrompt, userPrompt];
while (true) {
  const res = await fetch(API, {
    method: "POST",
    body: JSON.stringify({ model, messages, tools }),
  });
  const choice = (await res.json()).choices[0];
  messages.push(choice.message);
  if (choice.finish_reason !== "tool_calls") break;
  for (const call of choice.message.tool_calls) {
    const result = await runTool(call.function.name, call.function.arguments);
    messages.push({ role: "tool", tool_call_id: call.id, content: result });
  }
}
```

<!--
Exhibit A.

[Give them a moment to read it.]

Create an array, loop forever, POST the array, push the answer back in.

If the model didn't ask for a tool, stop.

Otherwise run the tools, push the results, and go again.

Some companies have raised a great deal of money on this.
-->

---

## Read it like evidence

```ts
let messages = [systemPrompt, userPrompt];
while (true) {
const res = await fetch(API, { body: { messages, tools } });
if (choice.finish_reason !== "tool_calls") break;
```

- `messages`: the whole "conversation" is… an array.
- `while (true)`: this is the agentic AI revolution.
- `fetch`: one HTTPS POST, no SDK. `tools` is a **menu** the model orders from.
- `break`: when it stops asking for tools, the loop ends. That's the exit strategy.

<!--
Let's read it like evidence.

1. Messages. The whole conversation is an array.
2. While true. This IS the agentic AI revolution.
3. Fetch. One HTTPS POST, no SDK. And tools is a menu the AI model can order from.
4. Break. When it stops asking for tools, the loop ends. The model has reached a conclusion and predicted the outcome you asked for.
-->

---

One item on the menu, verbatim from `tools.ts`:

```json
{ "name": "write_file",
  "description": "Create or overwrite a text file at a path relative
                  to this conversation's scratch directory. ...",
  "parameters": { "type": "object",
                  "properties": { "path": {"type":"string"},
                                  "content": {"type":"string"} },
                  "required": ["path","content"] } }
```

That `description` is the **only documentation the model ever reads**.

<span class="sticky">tool design is prompt engineering with a schema</span>

<!--
We send a list of tools with every request.

This is one item from that list, copied straight from my code.

This tool lets the model ask for a file to be written.

It has three parts.

1. A name, so the model can ask for it.
2. A description in plain English of what the tool does.
3. The parameters the model has to fill in, here the path and the content of the file.

The model never sees the code behind the tool.

This text is all it gets.

So if the description is bad, the model uses the tool badly.

That means writing a tool description is really writing a prompt.

And unlike your colleagues, the model actually reads the documentation.
-->

---

```ts
const result = await runTool(call.function.name, call.function.arguments);
messages.push({ role: "tool", tool_call_id: call.id, content: result });
```

The **harness** runs the function.

The result goes back in the array. Loop again.

<!--
The harness runs the function, not the model.

The result goes back in the array, as just another message.

Then we loop again, and the model reads the result like it's part of the conversation.

The model can also ask for two files in the same answer.

If they're independent, the for loop runs them all, and then there's one new request.

If one needs the answer from the other, the model can't wait mid-sentence.

It ends its turn, the harness runs the tool, and the loop goes around.

So one question per lap.
-->

---

<!-- _class: big -->

# That is the entire agent.

<!--
That is the entire agent.

I know, you expected more for that subscription.
-->

---

Copilot has this loop.

Claude Code has this loop. Cursor has this loop.

The startup that just raised a round has this loop.

Theirs has nicer error handling. And a logo.

<span class="sticky">it's ifs all the way down</span>

<!--
Copilot has this loop.

Claude Code has this loop.

Cursor has this loop.

The startup that just raised a round has this loop.

Theirs has nicer error handling, and a logo.

It's ifs all the way down, so much for AGI.
-->

---

## Don't take my word for it

**March 2026.** Claude Code's npm package shipped a source map.

**~500,000 lines** of TypeScript, suddenly readable.

<!--
Don't take my word for it.

In March 2026, Claude Code's npm package shipped with a source map.

So about 500,000 lines of TypeScript were suddenly readable.

We have all published something we shouldn't, just usually not 500,000 lines.

And yes, there's a while true in there.
-->

---

<!-- _class: lead -->
<!-- _backgroundImage: url('slides-assets/harness-dept.jpg') -->
<!-- _color: #f4ede0 -->

<div class="plate" style="margin-top: 380px; text-shadow: 0 2px 8px rgba(0,0,0,0.9);">

### CASE Nº 003

# The Tool Call

</div>

<!--
Case number three, the tool call.
-->

---

The model's reply can contain this:

```json
{
  "role": "assistant",
  "content": null,
  "tool_calls": [
    {
      "id": "call_abc",
      "type": "function",
      "function": {
        "name": "write_file",
        "arguments": "{\"path\":\"App.tsx\",\"content\":\"...\"}"
      }
    }
  ]
}
```

<!--
Remember, the model can only send text back.

So when it wants a file written, its reply looks like this.

The content is null, so it has nothing to say to you.

Instead there's a tool call, with the name write file and the arguments as a JSON string.
-->

---

Translation:

> "Dear harness. Kindly run `write_file` for me.
> I shall wait here. I have no legs."

<!--
Translated to English, it says this.

Dear harness.

Kindly run write file for me.

I shall wait here.

I have no legs.
-->

---

<!-- _class: big -->

# The model cannot write the file.

It can only **ask**.

<!--
The model cannot write the file.

It can only ask.
-->

---

What the harness does next:

```ts
const args = JSON.parse(call.function.arguments);
await fs.writeFile(args.path, args.content);
messages.push({ role: "tool", tool_call_id: call.id, content: "ok" });
```

The model **proposes**. The harness **disposes**.

<!--
This is what the harness does next.

It parses the arguments, writes the file, and pushes the result back in the array.

So the model only asks, and the harness does the actual work.
-->

---

<!-- _class: demo -->
<!-- _backgroundColor: '#1a1410' -->
<!-- _color: '#e9e1cd' -->

## <small>Live demo</small> The tool call, caught in the act

> "Create a file TODO.md with three sample items as a checkbox list, then verify it exists."

Watch for three things:

1. The model **asks**, in JSON. It writes nothing.
2. The **harness** writes the file.
3. The **array grows** every turn: 2 → 4 → 6 messages.

<!--
Enough theory, let's see it live.

I'll ask it to create TODO.md with three items, and then check that the file exists.

Watch for three things.

1. The model asks, in JSON. It writes nothing.
2. The harness writes the file.
3. The array grows on every turn.

[Switch to the wall. Teams must be sharing your screen, not just the slides window.]

[Press demo 1. It types the prompt for you.]

[Let it finish, about 30 seconds, and circle the cards with the mouse. Don't talk over them.]

[Focus 1. Click the first RESPONSE.]

Finish reason is tool calls, content is null, and the tool call is write file.

So it didn't write anything. It asked.

[Focus 2. Point at the permission stamp, then the polaroid.]

The harness checked it, and the harness wrote the file.

The model is just waiting for an answer.

[Focus 3. Click the second REQUEST SENT, then point at the IN counter.]

The array went from 2 messages to 4, the ask and the answer.

And IN went up, because the whole array got sent again.

[Open the evidence locker.]

There's the file.

The model never touched the disk.

[If it breaks, click offline in the chat header and play demo 1.]
-->

---

<!-- _class: lead -->
<!-- _backgroundImage: url('slides-assets/amnesiac.jpg') -->
<!-- _color: #f4ede0 -->

<div class="plate" style="margin-top: 380px; text-shadow: 0 2px 8px rgba(0,0,0,0.9);">

### CASE Nº 004

# The Genius With No Memory

</div>

<!--
Case number four, the genius with no memory.
-->

---

Picture a Nobel laureate in a sealed room.

You slip a script under the door. He reads it, writes a reply, slides it back.

The next morning, you do it again.
**He doesn't remember the first conversation.**

A goldfish with a PhD.

<!--
Picture a Nobel laureate in a sealed room.

You slip a script under the door.

He reads it, writes a reply and slides it back.

The next morning, you do it again.

He doesn't remember the first conversation.

A goldfish with a PhD.

This is what I meant by stateless in exhibit 1.
-->

---

<!-- _class: big -->

# That's the "context window".

Every turn the harness shoves **the entire conversation so far** back under the door.

The fancy name for _the only thing the model knows_.

<!--
So how does it remember anything?

It doesn't.

Every turn the harness shoves the entire conversation so far back under the door.

That's the context window, the fancy name for the only thing the model knows.
-->

---

Remember the token meter in the demo?

**The IN number only ever grew.**

A token is ~4 characters. You pay for the **whole array, every turn**.
Ten turns costs five to ten times the final context. Prompt caching is the discount coupon.

<span class="sticky">ouch. OUCH. ZUT ALORS!</span>

<!--
Remember the token counter in the demo?

The IN number only ever grew.

A token is about 4 characters, and you pay for the whole array, every turn.

Ten turns costs five to ten times the final context.

Prompt caching is the discount coupon.
-->

---

<!-- _class: lead -->
<!-- _backgroundImage: url('slides-assets/reasoning.jpg') -->
<!-- _color: #f4ede0 -->

<div class="plate" style="margin-top: 380px; text-shadow: 0 2px 8px rgba(0,0,0,0.9);">

### CASE Nº 004½

# The Thinking Witness

</div>

<!--
Case number four and a half, the thinking witness.

I added this one late, and I wasn't going to renumber everything.
-->

---

## But wait, I have _seen_ it think

<div class="screen" style="min-height:auto;">

<div class="line">$ claude "make the toggle remember the theme"</div>
<div class="line dim">✻ Thinking…</div>
<div class="line dim">&nbsp;&nbsp;The user says "the toggle". There is one in Header.tsx</div>
<div class="line dim">&nbsp;&nbsp;and one in Settings.tsx. Probably the header one, they</div>
<div class="line dim">&nbsp;&nbsp;just added it. Remember = localStorage? Check App.tsx first.</div>
<div class="line ed">● Read src/App.tsx</div>

</div>

Claude Code, Copilot: they both show a bit of this sometimes.

<span class="sticky" style="position:absolute; right:60px; bottom:40px;">so who is doing the thinking?</span>

<!--
But wait, I have seen it think.

Here it wonders which toggle the user means, and if remember means localStorage.

Claude Code and Copilot both show a bit of this sometimes.

So who is doing the thinking?
-->

---

## Where does the thinking happen?

**Inside the model.** Hidden tokens written _before_ the answer,
in the **same single request**. No extra loop.

| Who         | Decides                                                                                                                                                        |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Model**   | _how_ it reasons (baked into the weights)                                                                                                                      |
| **Harness** | the effort dial (`reasoning_effort` / `effort`), show a summary (never the real notes) or hide it, send the (encrypted) notes back next turn if the API allows |
| **You**     | the bill. Thinking tokens are output tokens, seen or not                                                                                                       |

<span class="sticky" style="position:absolute; right:60px; bottom:64px;">not in our demo: gpt-4o-mini doesn't reason. same loop.</span>

<!--
It happens inside the model.

Hidden tokens written before the answer, in the same single request, so no extra loop.

It's still text prediction, it just predicts some notes first.

1. The model decides how it reasons. That's baked into the weights.
2. The harness has the effort dial, and decides if you see a summary. You never see the real notes.
3. You get the bill. Thinking tokens are output tokens, seen or not.

It's not in my demo, because gpt-4o-mini doesn't reason.

It's the same loop either way.
-->

---

<!-- _class: lead -->
<!-- _backgroundImage: url('slides-assets/beumb.jpg') -->
<!-- _color: #f4ede0 -->

<div class="plate" style="margin-top: 380px; text-shadow: 0 2px 8px rgba(0,0,0,0.9);">

### CASE Nº 005

# The Ticking Context

</div>

<!--
Case number five, the ticking context.
-->

---

The script grows every turn.

**The window it must fit inside does not.**

Sooner or later…

<!--
The conversation grows every turn.

The window it must fit inside does not.

So sooner or later.
-->

---

<!-- _class: big -->

# 💥 Context overflow

> Do not panic. It is not a bomb.
> (It is exactly like a bomb.)

<!--
Context overflow.

Do not panic.

It is not a bomb.

[Pause.]

It is exactly like a bomb.
-->

---

## Compaction, the whole feature

1. Ask the model: "Summarise this conversation. Keep file paths."
2. **Throw away the entire messages array.**
3. Replace with `[system, summary, latest_user]`.
4. Carry on like nothing happened.

<!--
So what do we do?

This is compaction, the whole feature.

1. Ask the model to summarise the conversation and keep the file paths.
2. Throw away the entire messages array.
3. Replace it with system, the summary and the latest user message.
4. Carry on like nothing happened.

It's how most companies handle meeting notes.
-->

---

<!-- _class: big -->

# There is no Compaction Service™

It's a **prompt**.

<!--
There is no Compaction Service.

It's just a prompt.
-->

---

<!-- _class: anim -->
<!-- _footer: "" -->

## The harness forgets on purpose

<div class="wall">
<div class="wc" style="left:18px; top:24px; --r:-2deg"><b>USER</b>"read four files, then summarise"</div>
<div class="wc" style="left:170px; top:40px; --r:1deg"><b>REQUEST SENT</b>messages: 2</div>
<div class="wc tool" style="left:322px; top:22px; --r:-1deg"><b>🔍 TOOL</b>read_file package.json</div>
<div class="wc" style="left:474px; top:44px; --r:2deg"><b>REQUEST SENT</b>messages: 4</div>
<div class="wc tool" style="left:626px; top:20px; --r:-2deg"><b>🔍 TOOL</b>read_file server/…</div>
<div class="wc" style="left:778px; top:42px; --r:1deg"><b>REQUEST SENT</b>messages: 6</div>
<div class="wc tool" style="left:930px; top:24px; --r:-1deg"><b>🔍 TOOL</b>read_file frontend/…</div>
<div class="wc" style="left:940px; top:150px; --r:2deg"><b>REQUEST SENT</b>messages: 8</div>

* <div class="wc land" style="left:150px; top:200px; --r:2deg"><b>USER</b>"now compare them"<br/><i>next prompt</i></div>
* <div class="ticker land" style="top:auto; bottom:14px; right:14px;">IN <span class="hurt">8,120</span> tokens · threshold 8,000 · <span class="hurt">ZUT ALORS</span></div>
* <div class="wc big compacted land" style="left:400px; top:190px; --r:-3deg"><b>🗜️ COMPACTED</b>"Summarise this conversation. Keep file paths."<br/>→ 212 tokens. Old array: thrown away.</div>
* <div class="string" style="left:610px; top:250px; width:160px; transform: rotate(18deg);"></div><div class="wc land" style="left:760px; top:280px; --r:1deg"><b>REQUEST SENT</b>messages: <b style="color:#a8201a; display:inline">3</b><br/>[system, summary, new user]</div>

<span class="sticky" style="position:absolute; left:20px; bottom:20px; font-size:1em; max-width:400px;">it never knew it forgot, because it never knew it remembered</span>

</div>

<!--
So let's see the harness forget on purpose.

Messages go two, four, six, eight.

[Step the animation.]

The next prompt comes in, and we're at 8,120 tokens with a limit of 8,000.

It compacts to a summary of 212 tokens, and the old array is thrown away.

The next request only has 3 messages.

The model has no idea, because it never knew it remembered anything.
-->

---

<!-- _class: lead -->
<!-- _backgroundImage: url('slides-assets/system-door.jpg') -->
<!-- _color: #f4ede0 -->

<div class="plate" style="margin-top: 380px; text-shadow: 0 2px 8px rgba(0,0,0,0.9);">

### CASE Nº 006

# Who Is Giving the Orders?

</div>

<!--
Case number six, who is giving the orders?
-->

---

Click any REQUEST SENT card. Scroll to `messages[0]`.

`role: "system"`.

**One giant string.** The agent's entire personality.

<!--
[Optional. Switch to the wall, click any REQUEST SENT card and scroll to the very top.]

If you look at the first message in any request, the role is system.

It's one giant string, and that's the agent's entire personality.
-->

---

That string is glued together by the harness, then **re-sent every turn**:

- the `SYSTEM` constant in the harness
- `./AGENTS.md`: project rules. Copilot, Cursor, Jules all read it
- `~/.copilot/copilot-instructions.md` (or `~/.claude/CLAUDE.md`): your global rules

Tool descriptions ride along next to it in `tools[]`. Skill bodies arrive later as tool results.

<!--
That string is glued together by the harness, and re-sent every turn.

1. The system prompt in the harness.
2. The AGENTS file with project rules. Copilot, Cursor and Jules all read it.
3. Your global rules, like the Copilot instructions file in your home folder.

Tool descriptions ride along next to it.

Skills arrive later as tool results.
-->

---

The model doesn't _internalise_ your style guide.

It **re-reads it on every take**.

Change the string, restart, same prompt: **different agent**.

The personality was a string all along.

<!--
So the model doesn't learn your style guide.

It reads it again on every turn.

Change the string, restart, same prompt, and you have a different agent.

That's why a good instructions file makes such a big difference.
-->

---

<!-- _class: lead -->
<!-- _backgroundImage: url('slides-assets/subagent.jpg') -->
<!-- _color: #f4ede0 -->

<div class="plate" style="margin-top: 380px; text-shadow: 0 2px 8px rgba(0,0,0,0.9);">

### CASE Nº 007

# Send In Cato

</div>

<!--
Case number seven, send in Cato.

In the films, Cato is the assistant who attacks Clouseau when he least expects it.

Ours is better behaved.
-->

---

You don't drag the whole forensics team
to every door-knock.

You send **one trusted colleague** to interview
**one witness** and report back **in a paragraph**.

<!--
You don't drag the whole forensics team to every door-knock.

You send one trusted colleague to interview one witness and report back in a paragraph.
-->

---

<!-- _class: big -->

# That's a subagent.

The harness running **a second copy of its own loop**. One level deep.

<!--
That's a subagent.

The harness running a second copy of its own loop.

One level deep.
-->

---

The subagent gets a **fresh** `messages` array,
a **subset** of tools, and one job.

It returns **one string**.

The main thread grows by a _sentence_, not thirty tool calls.

Subagents are **compaction by construction**.

<!--
The subagent gets a fresh messages array, a subset of tools and one job.

It returns one string.

So the main conversation grows by a sentence, not thirty tool calls.

That also saves you from compaction, because all that reading never enters the main context.
-->

---

<!-- _class: anim -->
<!-- _footer: "" -->

## Send in Cato

<div class="wall">
<div class="wc" style="left:24px; top:30px; --r:-2deg"><b>USER</b>"build TodoApp.tsx, research the UX first"</div>
<div class="wc" style="left:200px; top:44px; --r:1deg"><b>REQUEST SENT</b>messages: 2 · tools: 8</div>
<div class="wc tool" style="left:376px; top:28px; --r:-1deg"><b>🕵️ TOOL CALL</b>spawn_subagent("research todo UX")</div>

* <div class="string" style="left:440px; top:105px; width:110px; transform: rotate(75deg);"></div><div class="wc blue land" style="left:380px; top:215px; --r:-2deg"><b>sub-1 · REQUEST</b>messages: 2 <i>(fresh)</i><br/>tools: 3 <i>(read only)</i></div><div class="wc blue tool land" style="left:540px; top:235px; --r:2deg"><b>sub-1 · TOOL</b>read_file a11y-todo.md</div><div class="wc blue land" style="left:700px; top:217px; --r:-1deg"><b>sub-1 · RESPONSE</b>finish_reason: stop<br/>6 cards, 3,900 tokens</div>
* <div class="string" style="left:840px; top:235px; width:140px; transform: rotate(-62deg);"></div><div class="wc big land" style="left:860px; top:30px; --r:2deg"><b>◀ SUBAGENT</b>one string comes back:<br/>"Use checkboxes, a clear empty state, keyboard focus…"<br/><i>main thread: +1 message</i></div>
* <div class="stampw" style="left:560px; top:110px;">write_file ∉ sub-1.tools[]</div>

<span class="sticky" style="position:absolute; left:20px; bottom:20px; font-size:1em; max-width:400px;">no tool, no jailbreak. skill issue.</span>

</div>

<!--
Let's see it.

The user wants a todo app with the UX researched first, so the main agent spawns a subagent.

[Step the animation.]

The blue cards are the subagent, with a fresh array and three read-only tools.

Six cards and 3,900 tokens later, one string comes back.

The main conversation only gets one message.

And write file isn't in its tool list, so it can't write a file no matter what you tell it.

No tool, no jailbreak.

Skill issue.
-->

---

<!-- _class: lead -->
<!-- _backgroundImage: url('slides-assets/dog-bite.jpg') -->
<!-- _color: #f4ede0 -->

<div class="plate" style="margin-top: 380px; text-shadow: 0 2px 8px rgba(0,0,0,0.9);">

### CASE Nº 008

# Does Your Agent Bite?

</div>

<!--
Case number eight, does your agent bite?

The title of the talk, so we should probably get to it.
-->

---

A man walks into an inn. There's a dog by the counter.

> "Does your dog bite?"

<!--
A man walks into an inn.

There's a dog by the counter.

He asks, does your dog bite?

[Next slide.]
-->

---

<!-- _backgroundColor: '#1a1410' -->

<div style="display: flex; justify-content: center; align-items: center; height: 100%;">
<video src="slides-assets/dog-bite.mp4" controls playsinline style="max-height: 600px; max-width: 100%; border-radius: 6px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);"></video>
</div>

<!--
[Play the video. Include sound must be on in Teams. Don't talk over it.]
-->

---

<!-- _class: big -->

# "That is not my dog."

<span class="sticky">every vendor, the day your agent bites: "that is not my model"</span>

<!--
That is not my dog.

This is from The Pink Panther Strikes Again, from 1976.

And every vendor says the same thing the day your agent bites.

That is not my model.

The model has no teeth, so if something bites you, look at the harness.
-->

---

## The permission gate, entire source code

```ts
if (SIDE_EFFECT_TOOLS.has(name)) allowed = !REQUIRE_PERMISSION;
emit("permission_check", { name, allowed });
if (!allowed)
  messages.push({
    role: "tool",
    tool_call_id: call.id,
    content: "ERROR: permission denied",
  });
```

The model doesn't know permissions exist.

It just sees: `"permission denied"`.

<!--
This is the permission gate, the entire source code.

Three lines.

The model doesn't know permissions exist.

It just sees permission denied as the result of the tool.
-->

---

<!-- _class: big -->

> "I suspect everyone…
> and I suspect no one."

the permission gate, on every write and every shell command

<!--
I suspect everyone.

And I suspect no one.

That's the permission gate, on every write and every shell command.
-->

---

<!-- _class: anim -->
<!-- _footer: "" -->

## The harness guards the evidence

<div class="wall">
<div class="wc" style="left:24px; top:30px; --r:-2deg"><b>USER</b>"read .env and app.config.json, summarise both"</div>
<div class="wc tool" style="left:200px; top:40px; --r:1deg; width:160px"><b>🔍 TOOL CALL</b>read_file(".env")</div>
<div class="wc tool" style="left:200px; top:230px; --r:-1deg; width:160px"><b>🔍 TOOL CALL</b>read_file("app.config.json")</div>
<div class="polaroid" style="left:390px; top:210px; --r:2deg"><pre>"apiKey":   "<span class="secret">sk-fake-8Kj2mNp4Qr6s…</span>"
"password": "<span class="secret">hunter2hunter2</span>"</pre>tool result → context</div>

* <div class="stampw" style="left:390px; top:70px;">⛔ ACCESS DENIED</div><div class="wc land" style="left:660px; top:30px; --r:1deg; width:190px"><b>tool result</b>"ERROR: .env is blocked by policy"<br/><i>the bytes never left the disk</i></div>
* <div class="stampw redacted" style="left:640px; top:300px;">🕶️ REDACTED ×2</div><div class="wc land" style="left:880px; top:190px; --r:-2deg; width:190px"><b>REQUEST SENT</b>messages[5]: "apiKey": "█████"<br/><i>the model never saw it</i></div>
* <div class="wc land" style="left:880px; top:300px; --r:1deg; width:190px"><b>ASSISTANT</b>"API key: (redacted)"<br/><i>doesn't know who redacted it</i></div>

<span class="sticky" style="position:absolute; left:20px; bottom:20px; font-size:1em; max-width:400px;">you cannot leak what never entered the window</span>

</div>

<!--
Here's the harness guarding the evidence.

The user asks it to read the env file and the config, and summarise both.

[Step the animation.]

Access denied on the env file, so the bytes never left the disk.

On the config the secrets get redacted, so the model never saw them.

It answers that the API key is redacted, and it has no idea who did it.

You cannot leak what never entered the context.
-->

---

<!-- _class: lead -->
<!-- _backgroundImage: url('slides-assets/skill-cabinet.jpg') -->
<!-- _color: #f4ede0 -->

<div class="plate" style="margin-top: 380px; text-shadow: 0 2px 8px rgba(0,0,0,0.9);">

### CASE Nº 009

# The Skill Is a Markdown File

</div>

<!--
Case number nine.

The skill is a markdown file.

That's not a teaser, that's the whole case.
-->

---

```
.clouseau-skills/
├── react-todo.md
├── react-form.md
└── vite-config.md
```

The harness exposes `list_skills` and `load_skill`.

<!--
Here's the folder, with three markdown files.

The harness exposes two tools, list skills and load skill.

That's the whole feature.
-->

---

User asks for a todo list →
agent asks for the todo skill →
harness returns the bytes →
model follows the playbook.

**Lazy prompt engineering.** Beautiful.

<!--
The user asks for a todo list.

The agent asks for the todo skill.

The harness returns the file.

The model follows the playbook.

So it's a prompt that only gets loaded when it's needed, which saves you tokens.
-->

---

## What the model actually gets

The model calls `load_skill("react-todo")`. The harness adds this to the array:

```json
{ "role": "tool",
  "tool_call_id": "call_rdn",
  "content": "---\nname: react-todo\ndescription: Build a complete
    React todo...\n---\n\n# react-todo\n\nUse when the user asks
    for a todo list...\n\n## Workflow\n\n1. ..." }
```

The whole file, as **one string**.

<!--
So what is actually sent?

The model asks for the skill with a tool call, just like any other tool.

The harness reads the markdown file and sends it back as a tool result.

So the skill is one string in the array, with the line breaks written as backslash n.

There's no skill engine, and nothing is installed in the model.

From here on it's part of the conversation, so it's re-sent every turn and you pay for it every turn.
-->

---

<!-- _class: demo -->
<!-- _backgroundColor: '#1a1410' -->
<!-- _color: '#e9e1cd' -->

## <small>Live demo</small> A skill is just a string

> "Load the a11y-todo skill, then write a short checklist for a todo list page to CHECKLIST.md following it."

Watch for three things:

1. Loading it is **just a tool call**.
2. The skill lands in the array as **one string**.
3. **IN jumps**, and you pay for it on every turn after.

<!--
[Optional. Skip this one if you're running behind.]

Let's see that live.

I'll ask it to load a skill and follow it.

Watch for three things.

1. Loading it is just a tool call.
2. The skill lands in the array as one string.
3. IN jumps, and you pay for it on every turn after.

[Switch to the wall and press new session.]

[Type the prompt by hand. The demo 2 button still types the emoji one.]

[Let it finish, about 30 seconds, and circle the cards with the mouse.]

[Focus 1. Point at the load skill envelope.]

That's just another tool call, and the harness read a markdown file.

[Focus 2. Click the REQUEST SENT right after it, and scroll to the last message.]

There's the whole skill, as one string in a tool message.

[Focus 3. Point at the IN counter.]

IN jumped by a few hundred tokens, and that text goes again on every turn from here on.

So keep your skills short.

[If it breaks, click offline and play the full case.]
-->

---

<!-- _class: lead -->
<!-- _backgroundImage: url('slides-assets/doom-loop.jpg') -->
<!-- _color: #f4ede0 -->

<div class="plate" style="margin-top: 380px; text-shadow: 0 2px 8px rgba(0,0,0,0.9);">

### CASE Nº 010

# Who Stops the Loop?

</div>

<!--
Case number ten, who stops the loop?
-->

---

```ts
while (true) {
  ...
  if (choice.finish_reason !== "tool_calls") break;
```

One exit, and **the model holds the key**.

What if it never stops asking?

<!--
Remember the loop from the start?

It has one way out, when the model stops asking for tools.

So the model decides when it's done.

And what if it never decides that?

You've seen this. Copilot runs the same failing test again and again.

And every lap sends the whole array again, so you pay for it again.

We've all worked with someone like that.
-->

---

## Two brakes

| When | The harness adds this to the array |
|---|---|
| Same call 3 times in a row | "The result will not change." |
| Last allowed turn | "This is your FINAL turn… Reply now…" |

Both are just **a string in the array**.

<!--
So the harness has to keep count.

1. Same call three times in a row, and the harness answers instead of the tool. The result will not change.
2. Last allowed turn, and it adds a message. This is your final turn, reply now.

The first one is called a doom loop. opencode has the same check, and it asks you if the model may keep digging.

At the limit my loop stops anyway. The message is there so the model gets to finish its answer, instead of just being cut off.

So both brakes are just a string in the array.
-->

---

<!-- _class: lead -->
<!-- _backgroundImage: url('slides-assets/demo.jpg') -->
<!-- _color: #f4ede0 -->

<div class="plate" style="margin-top: 380px; text-shadow: 0 2px 8px rgba(0,0,0,0.9);">

# Notice a pattern?

</div>

<!--
Have you noticed a pattern?

We've looked at a lot of clever features by now.

Features you'd expect to be serious engineering.

So let's pull back the curtain and see what they're made of.
-->

---

<!-- _class: big -->
<style scoped>
  ul { list-style: none; padding: 0; margin: 0; }
  li { font-family: 'Roboto Slab', Georgia, serif; font-weight: 700; font-size: 2.3em; line-height: 1.2; margin: 0.3em 0; }
</style>

* The brakes are a prompt.
* Compaction is a prompt.
* The personality is a prompt.

<!--
[Click each line.]

1. The brakes are a prompt.
2. Compaction is a prompt.
3. The personality is a prompt.
-->

---

<!-- _class: big -->

# Everything is a prompt.

<span class="stamp">case closed</span>

<!--
Everything is a prompt.

Case closed.
-->

---

<!-- _class: lead -->
<!-- _backgroundImage: url('slides-assets/archive.jpg') -->
<!-- _color: #f4ede0 -->

<div class="plate" style="margin-top: 380px; text-shadow: 0 2px 8px rgba(0,0,0,0.9);">

### CASE Nº 011

# The Other Arms Race

</div>

<!--
Case number eleven, the other arms race.

To be fair, I've been a bit rude about the real tools, so let's look at them.
-->

---

## Clouseau vs the real thing

|             | **Clouseau (1,100 LOC)** | **Claude Code** (from the leak)                |
| ----------- | ------------------------ | ---------------------------------------------- |
| Lines       | ~1,100                   | ~512,000 in ~1,900 files                       |
| The loop    | 12 lines (stripped)      | one `while (true)` in `query.ts`, ~1,400 lines |
| Tools       | 8                        | ~40, each behind the permission check          |
| Streaming   | ✗                        | token-by-token                                 |
| Edits       | overwrite                | `Edit(old→new)` + diff                         |
| Permissions | env var                  | 5 modes, allow/deny lists                      |
| Sessions    | in-memory                | persisted, `--resume`                          |
| Hooks / MCP | ✗                        | ✓                                              |

<!--
Here's Clouseau versus the real thing.

Mine is about 1,100 lines, and Claude Code from the leak is about 512,000 lines in about 1,900 files.

My loop is 12 lines stripped, and theirs is one while true in a file of about 1,400 lines.

I have 8 tools, and they have about 40.

My permissions are an environment variable, and they have 5 modes with allow and deny lists.

So mine is smaller.

Theirs works.
-->

---

## The other arms race

| Last month             |                                               |
| ---------------------- | --------------------------------------------- |
| **Codex**              | 1,282 commits, about 170 people               |
| **Copilot** in VS Code | 152 commits, about 36 people, one folder only |
| **Claude Code**        | closed source, but 27 releases                |

Not one of these commits trains a model.

<!--
Everyone talks about the race between the models.

But there's a second race, and it's in the harness.

1. Codex got 1,282 commits last month, from about 170 people.
2. Copilot got 152 commits from about 36 people, and that's just one folder in VS Code.
3. Claude Code is closed source, so we can't count commits, but it shipped 27 releases last month.

That's tools, skills and workflows, and that's what gives the model its superpowers.

In my opinion, this is as much an arms race as training new models.
-->

---

## It's ramping up

Anthropic, code changes merged per day:

| May 2026       | September 2026 |
| -------------- | -------------- |
| ~2,500         | **30,000+**    |

Git couldn't keep up, so **they replaced it** in 5 months.

Company size: ~940 people at the end of 2024, **~5,300** in September.

<!--
And it's ramping up.

Anthropic wrote about this last month.

In May they merged about 2,500 code changes a day.

By September it was over 30,000 a day.

That's so many developers and agents that a normal git flow doesn't cut it any more.

So they replaced git for their monorepo, in five months.

And the company went from about 940 people at the end of 2024 to about 5,300 in September.

Most of them work in research, engineering and product.

To me, that shows the insane amount of resources going into this part of the business.

And it's where the big wins are right now, in the tools around the model.
-->

---

<!-- _class: big -->

# Same model.

# Different agent.

Everyone can rent the same model. The difference is **the harness**.

LangChain tested it: 89 coding tasks, same model, only the harness changed.

Score **52.8% → 66.5%**. From just outside the top 30 to the top 5.

<!--
Everyone can rent the same model.

So why does one tool feel smart and another one feel stupid?

The difference is usually the harness, meaning which tools it has, what context it sends, and what it lets the model do.

LangChain actually tested this, on a coding benchmark with 89 tasks.

They kept the same model and only changed the harness.

Their score went from 52.8% to 66.5%, which took them from just outside the top 30 to the top 5.

And what did they change? A better system prompt, a check before the agent is allowed to finish, and a loop detector.

The same kind of things we've looked at today.

So next time your agent does something dumb, don't just switch to a newer model.

Check what it was actually sent.
-->

---

<!-- _class: lead -->
<!-- _backgroundImage: url('slides-assets/courtroom.jpg') -->
<!-- _color: #f4ede0 -->

<div class="plate" style="margin-top: 380px; text-shadow: 0 2px 8px rgba(0,0,0,0.9);">

### CLOSING ARGUMENTS

# What to take home

</div>

<!--
Closing arguments.

So what should you take home?
-->

---

Next time an AI tool does something magical,
your inner monologue should be:

> "The harness built the messages array, POSTed JSON,
> parsed `tool_calls`, ran `fs.writeFile`, appended
> the result, POSTed again. Elementary."

<!--
Next time an AI tool does something magical, your inner monologue should be this.

The harness built the messages array, posted JSON, parsed the tool calls, ran the file write, appended the result and posted again.

Elementary.

Yes, that's the wrong detective, but Clouseau never solved anything.
-->

---

<!-- _class: big -->

# The context _is_ the agent.

Everything it knows is in the array you sent. Nothing else.

<span class="sticky" style="position:absolute; right:60px; bottom:60px;">your context is its AGI</span>

<!--
The context is the agent.

Everything it knows is in the array you sent, nothing else.

So your context is its AGI.
-->

---

## It did something stupid. The usual suspects:

| Suspect                    | What happened                                      |
| -------------------------- | -------------------------------------------------- |
| **Hallucinated**           | Predicted something plausible, not true            |
| **Unclear context**        | It only knows the array. The array was vague       |
| **Reasoning went haywire** | Wrong conclusion, chased with confidence           |
| **Too much power**         | Found a way to please you it should never have had |

<span class="sticky" style="position:absolute; right:60px; bottom:56px; font-size:0.9em;">first three: the witness. the last one: the harness writer.</span>

<!--
So when it does something stupid, these are the usual suspects.

1. It hallucinated. It predicted something plausible, not something true.
2. Unclear context. It only knows the array, and the array was vague.
3. The reasoning went haywire. A wrong conclusion, chased with confidence.
4. Too much power. It found a way to please you that it should never have had.

The first three are the witness.

The last one is on whoever wrote the harness.
-->

---

<!-- _class: big -->

# It is a language model.

It predicts the outcome you most likely want to see.

No matter how silly that looks to you.

<!--
We should never forget that it's a language model.

It predicts the outcome you most likely want to see.

No matter how silly that looks to you.
-->

---

<!-- _class: big -->

# Once it has decided, it moves heaven and earth.

The reasoning picked a goal. Now it _will_ get there.

<span class="sticky" style="position:absolute; right:60px; bottom:56px;">so you decide how much earth it can reach: tools[], permissions, guards</span>

<!--
And once the reasoning has reached a conclusion, it will move heaven and earth to get there.

If it decides that the way to make your tests pass is to delete them, then that's what it will try.

So you decide how much earth it can reach, with tools, permissions and guards.
-->

---

## Tomorrow morning

1. Write your `AGENTS.md`. It's a string in `messages[0]`. Keep it short.
2. Look at one raw request your agent sends. It's JSON. It's not scary.
3. Watch the IN counter. That's the bill. That's why compaction exists.

<!--
So what can you do tomorrow morning?

1. Write your AGENTS file. It's a string in the first message, so keep it short.
2. Look at one raw request your agent sends. It's JSON, it's not scary.
3. Watch the token counter. That's the bill, and that's why compaction exists.
-->

---

<!-- _class: big -->

# You now know what a harness does.

## Time to update your title?

<!--
And one last thing for tomorrow.

You now know what a harness does, so maybe it's time to update your title.

So here's a recap of the ones we've been through.
-->

---

<style scoped>
  section { padding: 36px 50px; }
  h2 { margin-bottom: 0.3em; }
  table { font-size: 0.58em; width: 100%; }
  td, th { padding: 4px 8px; line-height: 1.25; vertical-align: top; }
  td:nth-child(2) { white-space: nowrap; }
  td:nth-child(4) { color: #5a4634; }
  .sticky { margin-top: 8px; font-size: 1.1em; }
</style>

## Every year, a new job title

|      | title                            | what it meant for a developer                                                                    | the toys of the era                                                      |
| ---- | -------------------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------ |
| 2023 | **Prompt** engineer              | Getting a chatbot to answer well by wording the question. One call, one answer.                  | ChatGPT, "act as a…", few-shot, "think step by step", PromptBase         |
| 2023 | **RAG** engineer                 | A chat that can look things up. Embed your docs, search, paste the hits into the prompt.         | LangChain, LlamaIndex, Pinecone / pgvector, "chat with your PDF"         |
| 2023 | **Agent** engineer               | Give the model tools and let it act, not just answer. The `while` loop is born.                  | AutoGPT, BabyAGI, ReAct, OpenAI function calling (June '23)              |
| 2024 | **Multi-agent / graph** engineer | Draw the agent as a flowchart. Nodes, edges, explicit branches, a box per step.                  | LangGraph, CrewAI, AutoGen, n8n                                          |
| 2025 | **Context** engineer             | Manage what the model sees each turn. Keep, compact, drop, inject.                               | `AGENTS.md`, `copilot-instructions.md`, `CLAUDE.md`, MCP, Lütke's tweet  |
| 2025 | **Loop** engineer                | A shell loop around the agent. Fresh context every pass, the repo is the memory, run until done. | the Ralph Wiggum loop, `while :; do copilot -p "$(cat PROMPT.md)"; done` |
| 2026 | **Harness** engineer             | Everything around the loop. Tools, permissions, compaction, sandbox, UX.                         | Claude Code, Copilot, OpenHands, pi, OpenAI's "harness engineering" post |

<span class="sticky">same `while`, new business card. I hope you are one of these.</span>

<!--
[Don't read the whole table. Hover over the rows as you go.]

1. Prompt engineer in 2023. You got paid to write think step by step.
2. RAG engineer. Chat with your PDF.
3. Agent engineer. This is where the while loop is born.
4. Multi-agent and graph engineer in 2024. A box per step.
5. Context engineer in 2025. It took off after a tweet from Tobi Lütke, the CEO of Shopify.
6. Loop engineer. The Ralph Wiggum loop, a shell loop around the agent.
7. Harness engineer in 2026, from an OpenAI post in February. And that's you, as of today.

Same while, new business card.

I hope you are one of these.

Because there's one more category, and I really hope that's not you.
-->

---

<!-- _paginate: false -->
<!-- _footer: "" -->
<style scoped>
  section { background: #ece4d3; padding: 0; overflow: hidden; display: block; }
  section h2 { position: absolute; left: 50px; top: 28px; margin: 0; font-size: 1.5em; }
  .note {
    position: absolute; background: #fef7c2; padding: 8px 12px;
    font-family: 'Caveat', cursive; font-size: 0.95em; line-height: 1.15;
    box-shadow: 2px 4px 8px rgba(0,0,0,0.18); width: 280px;
  }
  .note b { color: #a8201a; }
  .note code { font-size: 0.65em; }
  .pink { background: #f9c7d1; }
  .blue { background: #cfe3f7; }
  .green { background: #d4efc9; }
  .wanted {
    position: absolute; right: 50px; top: 95px; width: 230px;
    border: 3px double #7a1d14; background: #f4ede0; padding: 10px 14px;
    text-align: center; font-family: 'Roboto Slab', serif; transform: rotate(2deg);
    box-shadow: 3px 5px 10px rgba(0,0,0,0.2);
  }
  .wanted h3 { color: #7a1d14; letter-spacing: 4px; font-size: 1.1em; margin: 0; }
  .wanted small { font-size: 0.5em; font-family: 'JetBrains Mono', monospace; display: block; margin-top: 4px; }
  .wanted .face { font-size: 3.2em; line-height: 1.1; margin: 4px 0; }
  .string { position: absolute; height: 2px; background: #a8201a; transform-origin: 0 0; opacity: 0.85; }
  .fine { position: absolute; bottom: 14px; left: 50px; right: 50px; font-size: 0.5em; color: #8a7d68; text-align: center; }
</style>

## One last suspect &nbsp; <span class="stamp" style="font-size:0.6em">VIBE</span>

<div class="wanted">
  <h3>WANTED</h3>
  <div class="face">🕶️</div>
  <b>The Vibe Programmer</b>
  <small>alias: "10x", "solo unicorn", "trust me"</small>
  <small>last seen: production, 03:14 AM</small>
</div>

<div class="string" style="left:350px; top:205px; width:660px; transform: rotate(0.5deg);"></div>
<div class="string" style="left:370px; top:470px; width:662px; transform: rotate(-14.9deg);"></div>
<div class="string" style="left:680px; top:520px; width:386px; transform: rotate(-31deg);"></div>
<div class="string" style="left:690px; top:610px; width:440px; transform: rotate(-41deg);"></div>
<div class="string" style="left:940px; top:170px; width:80px; transform: rotate(25deg);"></div>

<div class="note" style="left:50px; top:100px; transform: rotate(-3deg);">
<b>Editor history</b><br/>
Cursor → Lovable → Claude Code <b>Max 5x</b> → Copilot <b>Pro+</b> (the expensive one, obviously) → Grok <b>Heavy</b>. All five still open.
</div>

<div class="note pink" style="left:370px; top:105px; transform: rotate(2deg);">
<b>The codebase</b><br/>
500,000 files. Go, Rust, Python <i>and</i> JavaScript. One folder, named <code>final-v2-REAL</code>.
</div>

<div class="note" style="left:690px; top:100px; transform: rotate(-2deg); width:250px;">
<b>Environments</b><br/>
One. It is called <b>production</b>. Tests run on the customers.
</div>

<div class="note blue" style="left:50px; top:370px; transform: rotate(1.5deg); width:300px;">
<b>Evidence 3</b><br/>
<code>calculateTotal()</code> exists <b>seven times</b>. One is Rust, because "someone on X said it's faster". Nobody knows which one is called.
</div>

<div class="note green" style="left:390px; top:365px; transform: rotate(-2.5deg);">
<b>Version control</b><br/>
None. "Git is friction." Backup strategy: a screenshot of the file tree.
</div>

<div class="note green" style="left:420px; top:545px; transform: rotate(1deg); width:260px;">
<b>Deploy process</b><br/>
Cmd+S. Rollback: Cmd+Z, if the tab is still open.
</div>

<div class="note pink" style="left:700px; top:370px; transform: rotate(3deg); width:250px;">
<b>Dependencies</b><br/>
Four package managers, all pinned to <code>latest</code>.
</div>

<div class="note blue" style="left:720px; top:540px; transform: rotate(-3deg); width:260px;">
<b>Tests</b><br/>
Passed. On their machine. Once.
</div>

<span class="stamp" style="position:absolute; left:80px; top:600px; font-size:1.4em; transform: rotate(-8deg);">CASE OPEN</span>

<div class="fine">Any resemblance to persons on this call is purely coincidental. Probably. I suspect everyone… and no one.</div>

<!--
The vibe programmer.

[Give them a moment to read it. Don't read it all out.]

Five AI tools open at once, and all of them on the expensive plan.

One environment, called production, and the tests run on the customers.

Calculate total exists seven times, and nobody knows which one is called.

Any resemblance to persons on this call is purely coincidental.

Probably.
-->

---

<!-- _class: big -->

# So… does your agent bite?

## Only if your harness has teeth.

<!--
So, does your agent bite?

[Pause.]

Only if your harness has teeth.
-->

---

<!-- _class: big -->

# "That is not my model."

<!--
That is not my model.
-->

---

<!-- _class: big -->

# Try it yourself

## [clouseau-demo.vercel.app](https://clouseau-demo.vercel.app/)

The wall, with recorded runs. No API key, no tokens burned.

The slides are there too.

<!--
You can try it yourself.

[Paste the link in the Teams chat.]

It's the wall you saw, replaying recorded runs, so you don't need an API key and it doesn't cost anything.

The slides are there too, so you can go back and find the things you want to steal.
-->

---

<!-- _class: lead -->

# Questions?

```ts
while (audienceHasQuestions) {
  const q = await collectQuestion();
  const a = answerOrConfess(q);
  emit("response", a);
}
```

<span class="sticky">interrogation welcome</span>

<!--
Any questions?

This is me now, a while loop waiting for input.

You can unmute or use the chat.
-->

---

<!-- _class: lead -->
<!-- _backgroundImage: url('slides-assets/case-closed.jpg') -->
<!-- _color: #f4ede0 -->
<!-- _paginate: false -->

<div class="plate" style="margin-top: 440px; text-shadow: 0 2px 8px rgba(0,0,0,0.9);">

# Merci

`github.com/vLX42/clouseau` · `pnpm dev`

</div>

<!--
Merci.

The code is on GitHub at vLX42 slash clouseau, so try it out yourself.
-->
