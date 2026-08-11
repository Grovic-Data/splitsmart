/*
 * SplitSMART — scripts/check-i18n-keys.mjs
 * Gate de i18n da casa (análogo ao check-i18n-keys do Valerium):
 *   1. simetria pt-BR ↔ en (mesmas chaves nos dois dicionários)
 *   2. toda chave usada em index.html (data-i18n / data-i18n-aria) resolve
 *   3. toda chave literal t("...") do app.js resolve
 *   4. todo i18n.plural(t, "base", …) tem base.one e base.other
 * Chave dinâmica (t(variavel)) não é verificável aqui — mantê-la coberta por teste.
 * Rodar: node scripts/check-i18n-keys.mjs  (exit 1 em falha)
 */
import { createRequire } from "node:module";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
const i18n = require(join(root, "js", "i18n.js"));

const errors = [];

// 1. simetria
const pt = Object.keys(i18n.DICTS["pt-BR"]).sort();
const en = Object.keys(i18n.DICTS["en"]).sort();
for (const k of pt) if (!en.includes(k)) errors.push(`chave só em pt-BR: ${k}`);
for (const k of en) if (!pt.includes(k)) errors.push(`chave só em en: ${k}`);

const known = new Set(pt);
const resolve = (key, origem) => {
    if (!known.has(key)) errors.push(`chave inexistente (${origem}): ${key}`);
};

// 2. todo .html da raiz (data-i18n / data-i18n-aria / data-doc-title)
const pages = readdirSync(root).filter((f) => f.endsWith(".html"));
for (const page of pages) {
    const html = readFileSync(join(root, page), "utf8");
    for (const m of html.matchAll(/data-i18n(?:-aria)?="([^"]+)"/g)) resolve(m[1], page);
    for (const m of html.matchAll(/data-doc-title="([^"]+)"/g)) resolve(m[1], page);
}

// 3 + 4. app.js + page.js
for (const jsFile of ["app.js", "page.js"]) {
    const app = readFileSync(join(root, "js", jsFile), "utf8");
    for (const m of app.matchAll(/\bt\("([^"]+)"/g)) resolve(m[1], jsFile + " t()");
    for (const m of app.matchAll(/i18n\.plural\(t,\s*"([^"]+)"/g)) {
        resolve(m[1] + ".one", jsFile + " plural()");
        resolve(m[1] + ".other", jsFile + " plural()");
    }
}

// chaves dinâmicas conhecidas (entry.errorKey) — garantir que o conjunto existe
for (const k of ["file.error.notPdf", "file.error.encrypted", "file.error.corrupt", "file.error.read"]) {
    resolve(k, "errorKey dinâmica");
}

if (errors.length) {
    console.error("i18n FALHOU:");
    for (const e of errors) console.error("  - " + e);
    process.exit(1);
}
console.log(`i18n ok: ${pt.length} chaves simétricas, usos de ${pages.join(", ")}, app.js e page.js resolvem.`);
