import "./env.ts";
import { runAgent } from "./agent.ts";

const prompt = process.argv.slice(2).join(" ");
if (!prompt) {
  console.error("usage: pnpm agent \"your prompt\"");
  process.exit(1);
}

await runAgent(prompt, (e) => {
  const payload = JSON.stringify(e.payload).slice(0, 240);
  console.log(`[${e.id} t${e.turn}] ${e.type}  parents=${JSON.stringify(e.parentIds)}  ${payload}`);
}, "cli");
