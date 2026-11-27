/**
 * Saves a quiz title's source pages as plain text, and checks its evidence quotes against them.
 * The method is docs/documents/how-to-create-quiz.md; the text stays in tmp/, which git ignores.
 *
 *   bun scripts/quiz-sources.ts fetch <slug> <https://host/wiki/Page> ...
 *     Saves each page to tmp/<slug>/<Page>.txt. The first line is `URL: <page url>`.
 *     Works for any MediaWiki: a fandom wiki (api.php) or Wikipedia (w/api.php).
 *
 *   bun scripts/quiz-sources.ts check <slug>
 *     For every question in src/games/<slug>/questions.json, finds the saved page for its
 *     source and requires its evidence quote in that page's text. Exits 1 on any miss.
 */

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const USER_AGENT = "byou-quiz-sources/1.0";

/** Whitespace, quote marks and dashes vary between the page and a quote copied from it. */
function normalize(text: string): string {
  return text
    .normalize("NFC")
    .replace(/[‘’ʼ]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[‐-―]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

/** A page URL without its fragment or query, with the title decoded, so links to one page compare equal. */
function pageKey(url: string): string {
  const u = new URL(url);
  return `${u.host}${decodeURIComponent(u.pathname).replace(/ /g, "_")}`;
}

function htmlToText(html: string): string {
  return html
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<sup[^>]*class="[^"]*reference[^"]*"[\s\S]*?<\/sup>/gi, "")
    .replace(/<br\s*\/?>|<\/(p|div|li|tr|h[1-6]|dd|dt|table)>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&#(\d+);/g, (_, n: string) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n: string) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n+/g, "\n\n")
    .trim();
}

async function fetchPage(slug: string, pageUrl: string): Promise<void> {
  const u = new URL(pageUrl);
  const title = decodeURIComponent(u.pathname.replace(/^\/wiki\//, ""));
  const api = u.host.endsWith("wikipedia.org") ? `https://${u.host}/w/api.php` : `https://${u.host}/api.php`;
  const query = new URLSearchParams({ action: "parse", page: title, prop: "text", redirects: "1", format: "json", formatversion: "2" });
  const res = await fetch(`${api}?${query}`, { headers: { "User-Agent": USER_AGENT } });
  const body = (await res.json()) as { parse?: { title: string; text: string }; error?: { info: string } };
  if (!body.parse) throw new Error(`${pageUrl}: ${body.error?.info ?? res.status}`);
  const finalUrl = `https://${u.host}/wiki/${body.parse.title.replace(/ /g, "_")}`;
  const dir = join("tmp", slug);
  mkdirSync(dir, { recursive: true });
  const file = join(dir, `${body.parse.title.replace(/[/\\:]/g, "_")}.txt`);
  writeFileSync(file, `URL: ${finalUrl}\n\n${htmlToText(body.parse.text)}\n`);
  console.log(`${file}  ${finalUrl}${finalUrl === pageUrl ? "" : `  (from ${pageUrl})`}`);
}

function savedPages(slug: string): Map<string, string> {
  const dir = join("tmp", slug);
  const pages = new Map<string, string>();
  if (!existsSync(dir)) return pages;
  for (const name of readdirSync(dir).filter((n) => n.endsWith(".txt"))) {
    const text = readFileSync(join(dir, name), "utf8");
    const url = /^URL: (\S+)/.exec(text)?.[1];
    if (url) pages.set(pageKey(url), normalize(text));
  }
  return pages;
}

function check(slug: string): number {
  const questions = JSON.parse(readFileSync(join("src", "games", slug, "questions.json"), "utf8")) as {
    id: string;
    source: string;
    evidence?: string;
  }[];
  const pages = savedPages(slug);
  const misses: string[] = [];
  for (const q of questions) {
    const page = pages.get(pageKey(q.source));
    if (!page) misses.push(`${q.id}: no saved page for ${q.source}`);
    else if (!q.evidence) misses.push(`${q.id}: no evidence`);
    else if (!page.includes(normalize(q.evidence))) misses.push(`${q.id}: quote not on ${q.source}: "${q.evidence}"`);
  }
  for (const miss of misses) console.log(miss);
  console.log(`${questions.length - misses.length}/${questions.length} quotes found`);
  return misses.length === 0 ? 0 : 1;
}

const [command, slug, ...urls] = process.argv.slice(2);
if (command === "fetch" && slug && urls.length > 0) {
  for (const url of urls) {
    try {
      await fetchPage(slug, url);
    } catch (error) {
      console.error(String(error));
      process.exitCode = 1;
    }
  }
} else if (command === "check" && slug) {
  process.exitCode = check(slug);
} else {
  console.error("usage: bun scripts/quiz-sources.ts fetch <slug> <page url>... | check <slug>");
  process.exitCode = 2;
}
