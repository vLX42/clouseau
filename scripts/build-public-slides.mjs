// Builds the public copy of the deck into frontend/public/slides, so the demo
// build ships it at /slides/. Run it on a Mac and commit the output whenever
// SLIDES.md changes. Speaker notes are stripped, images are shrunk with `sips`.
import { execFileSync } from "node:child_process";
import { copyFileSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const out = "frontend/public/slides";
const temp = "_public-slides.md";

const source = readFileSync("SLIDES.md", "utf8");
// Notes are multi-line comments. Marp directives are single-line, so they stay.
const stripped = source.replace(/<!--\n[\s\S]*?\n-->/g, "");

mkdirSync(out, { recursive: true });
writeFileSync(temp, stripped);
try {
  execFileSync(
    "npx",
    ["-y", "@marp-team/marp-cli@4.5.1", "--no-stdin", temp, "--html", "-o", join(out, "index.html")],
    { stdio: "inherit" },
  );
} finally {
  rmSync(temp);
}

const assets = new Set(stripped.match(/(?:slides-assets|frontend\/public)\/[\w./-]+\.\w+/g));
for (const asset of assets) {
  const target = join(out, asset);
  mkdirSync(dirname(target), { recursive: true });
  if (asset.endsWith(".jpg")) {
    execFileSync("sips", ["-Z", "1600", "-s", "formatOptions", "72", asset, "--out", target], { stdio: "ignore" });
  } else {
    copyFileSync(asset, target);
  }
}
console.log(`public slides: ${assets.size} assets in ${out}`);
