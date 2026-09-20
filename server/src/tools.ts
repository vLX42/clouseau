import { readFile, readdir, stat, writeFile, mkdir } from "node:fs/promises";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import { resolve, relative, isAbsolute, dirname } from "node:path";

const execP = promisify(exec);

function root(): string {
  return process.env.WORKSPACE_ROOT || process.cwd();
}

// Per-conversation scratch directory. Agent write_file / run_bash side effects
// land here, NOT in the project root, so the repo stays clean between demos.
// `tmp/` is gitignored.
function scratchDir(sessionId: string): string {
  return resolve(root(), "tmp", sessionId);
}

function safeUnder(base: string, p: string): string {
  const abs = isAbsolute(p) ? resolve(p) : resolve(base, p);
  if (!abs.startsWith(base)) throw new Error(`path escapes ${base}: ${p}`);
  return abs;
}

// For reads we resolve under the session scratch first, then fall back to
// the workspace — so `read_file("TodoApp.tsx")` finds files the agent
// just wrote AND files that live in the repo (e.g. package.json, CLAUDE.md).
async function resolveForRead(p: string, sessionId: string): Promise<string> {
  const scratch = scratchDir(sessionId);
  const scratchAbs = safeUnder(scratch, p);
  try {
    await stat(scratchAbs);
    return scratchAbs;
  } catch {
    return safeUnder(root(), p);
  }
}

export const toolSchemas = [
  {
    type: "function",
    function: {
      name: "read_file",
      description: "Read the contents of a text file at a path relative to the workspace.",
      parameters: {
        type: "object",
        properties: { path: { type: "string" } },
        required: ["path"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "list_files",
      description: "List entries of a directory (non-recursive).",
      parameters: {
        type: "object",
        properties: { path: { type: "string", default: "." } },
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "run_bash",
      description:
        "Run a bash command in this conversation's scratch directory and return stdout+stderr.",
      parameters: {
        type: "object",
        properties: { command: { type: "string" } },
        required: ["command"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "write_file",
      description:
        "Create or overwrite a text file at a path relative to this conversation's scratch directory. Parent directories are created automatically. Returns the path and byte count.",
      parameters: {
        type: "object",
        properties: {
          path: { type: "string" },
          content: { type: "string" },
        },
        required: ["path", "content"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "file_exists",
      description:
        "Check whether a file exists at the given path. Returns 'yes <bytes>' or 'no'. Looks in the session scratch dir first, then the workspace.",
      parameters: {
        type: "object",
        properties: { path: { type: "string" } },
        required: ["path"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "list_skills",
      description:
        "List skills available to the agent. Each skill is a markdown guide with focused instructions; call load_skill to read its body. ALWAYS call this first when the user asks for anything React-related.",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "load_skill",
      description:
        "Load the body of a named skill. Follow the instructions inside before writing any code.",
      parameters: {
        type: "object",
        properties: { name: { type: "string" } },
        required: ["name"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "spawn_subagent",
      description:
        "Spawn a research subagent in a fresh context. It has read-only tools (read_file, list_files, file_exists) and does NOT see your conversation history — pass it everything it needs in the task description. Returns the subagent's final answer as a single string. Use for focused research jobs that would otherwise bloat your own context.",
      parameters: {
        type: "object",
        properties: {
          task: {
            type: "string",
            description:
              "A self-contained task description for the subagent. Include any context it needs to do the job.",
          },
        },
        required: ["task"],
      },
    },
  },
];

// Tools the subagent is permitted to use (read-only).
export const SUBAGENT_TOOL_NAMES = new Set(["read_file", "list_files", "file_exists"]);

// ─── Harness guards ────────────────────────────────────────────────────────
// The bouncer: paths the model may never read. Checked BEFORE the tool runs,
// so the bytes never leave the disk. The model just gets an error string —
// there is no jailbreak, the harness simply refuses.
const BLOCKED_PATH_RULES: Array<{ rule: string; test: (p: string) => boolean }> = [
  { rule: "env files", test: (p) => /(^|\/)\.env(\.|$)/.test(p) },
  { rule: "private keys", test: (p) => /\.(pem|key|p12|pfx)$/i.test(p) || /id_rsa|id_ed25519/.test(p) },
  { rule: "credential files", test: (p) => /credential|secret/i.test(p) },
];

const GUARDED_READ_TOOLS = new Set(["read_file", "file_exists", "list_files"]);

export function checkReadGuard(
  name: string,
  args: any,
): { blocked: boolean; rule?: string; path?: string } {
  if (!GUARDED_READ_TOOLS.has(name)) return { blocked: false };
  const p = String(args?.path ?? "");
  for (const r of BLOCKED_PATH_RULES) {
    if (r.test(p)) return { blocked: true, rule: r.rule, path: p };
  }
  return { blocked: false };
}

// The firewall: secret-shaped strings are blacked out of tool output BEFORE
// it is appended to the messages array. The model receives the redacted
// bytes; the original never enters the context window.
const SECRET_PATTERNS: Array<{ rule: string; re: RegExp }> = [
  { rule: "OpenAI-style key", re: /sk-[A-Za-z0-9_-]{16,}/g },
  { rule: "AWS access key", re: /AKIA[0-9A-Z]{16}/g },
  { rule: "GitHub token", re: /gh[pousr]_[A-Za-z0-9]{20,}/g },
  {
    rule: "key/password assignment",
    re: /((?:api[_-]?key|secret|token|password|passwd)["']?\s*[=:]\s*["']?)([^\s"',;]{6,})/gi,
  },
];

// The emoji police: a harness-side content policy. Certain emojis and
// adjacent combinations are confiscated from anything the agent writes and
// replaced with 👮. The model is not told the policy exists — it just
// notices its swearing went missing. Family-friendly on purpose: the gag
// is the confiscation, not the contraband.
const BANNED_EMOJI = ["🤬", "💩", "🤮"];
const BANNED_PAIRS: Array<[string, string]> = [
  ["🤢", "🤮"],
];

export function policeEmojis(content: string): {
  content: string;
  removed: string[];
} {
  const removed: string[] = [];
  let out = content;
  for (const [a, b] of BANNED_PAIRS) {
    const pair = `${a}${b}`;
    if (out.includes(pair)) {
      removed.push(pair);
      out = out.split(pair).join("👮👮");
    }
  }
  for (const e of BANNED_EMOJI) {
    if (out.includes(e)) {
      removed.push(e);
      out = out.split(e).join("👮");
    }
  }
  return { content: out, removed };
}

export function redactSecrets(output: string): {
  output: string;
  count: number;
  rules: string[];
} {
  let count = 0;
  const rules = new Set<string>();
  let out = output;
  for (const { rule, re } of SECRET_PATTERNS) {
    out = out.replace(re, (full: string, g1?: any) => {
      count++;
      rules.add(rule);
      // key=value matches keep the key name, redact only the value
      if (typeof g1 === "string" && /[=:]/.test(g1)) return `${g1}█████REDACTED█████`;
      return "█████REDACTED█████";
    });
  }
  return { output: out, count, rules: [...rules] };
}

// Tools whose execution mutates the workspace and should trip a permission
// stamp on the wall (and the REQUIRE_PERMISSION gate).
export const SIDE_EFFECT_TOOLS = new Set(["run_bash", "write_file"]);

export async function runTool(
  name: string,
  args: any,
  sessionId: string,
): Promise<string> {
  const scratch = scratchDir(sessionId);

  if (name === "read_file") {
    const p = await resolveForRead(args.path, sessionId);
    return await readFile(p, "utf8");
  }
  if (name === "list_files") {
    // If the path resolves under the scratch dir, list it from there;
    // otherwise list from the workspace.
    const requested = args.path ?? ".";
    const scratchAbs = safeUnder(scratch, requested);
    let target: string;
    try {
      const s = await stat(scratchAbs);
      target = s.isDirectory() ? scratchAbs : safeUnder(root(), requested);
    } catch {
      target = safeUnder(root(), requested);
    }
    const entries = await readdir(target);
    const rows = await Promise.all(
      entries.map(async (e) => {
        try {
          const s = await stat(resolve(target, e));
          return `${s.isDirectory() ? "d" : "-"} ${e}`;
        } catch {
          return `? ${e}`;
        }
      }),
    );
    return rows.join("\n");
  }
  if (name === "run_bash") {
    await mkdir(scratch, { recursive: true });
    const { stdout, stderr } = await execP(args.command, {
      cwd: scratch,
      timeout: 15_000,
      maxBuffer: 1024 * 1024,
    });
    const out = (stdout || "") + (stderr ? `\n[stderr]\n${stderr}` : "");
    return out || "(no output)";
  }
  if (name === "write_file") {
    const p = safeUnder(scratch, args.path);
    const content: string = args.content ?? "";
    await mkdir(dirname(p), { recursive: true });
    await writeFile(p, content, "utf8");
    return `wrote ${relative(root(), p)} · ${Buffer.byteLength(content, "utf8")} bytes`;
  }
  if (name === "file_exists") {
    try {
      const p = await resolveForRead(args.path, sessionId);
      const s = await stat(p);
      return `yes ${s.size}`;
    } catch {
      return "no";
    }
  }
  if (name === "list_skills") {
    const dir = safeUnder(root(), ".clouseau-skills");
    let entries: string[] = [];
    try {
      entries = (await readdir(dir)).filter((e) => e.endsWith(".md"));
    } catch {
      return "(no skills installed)";
    }
    const rows = await Promise.all(
      entries.map(async (e) => {
        const body = await readFile(resolve(dir, e), "utf8");
        const m = body.match(/description:\s*(.+)/);
        const desc = m ? m[1].trim() : "(no description)";
        return `- ${e.replace(/\.md$/, "")} — ${desc}`;
      }),
    );
    return rows.join("\n");
  }
  if (name === "load_skill") {
    const dir = safeUnder(root(), ".clouseau-skills");
    const file = resolve(dir, `${args.name}.md`);
    if (!file.startsWith(dir)) throw new Error(`bad skill name: ${args.name}`);
    return await readFile(file, "utf8");
  }
  throw new Error(`unknown tool: ${name}`);
}

export function sessionScratchPath(sessionId: string): string {
  return scratchDir(sessionId);
}

export function relativeRoot(): string {
  return relative(process.cwd(), root()) || ".";
}
