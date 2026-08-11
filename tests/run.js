/*
 * SplitSMART — runner de testes zero-dependência.
 * Roda em Node (>= 18) e Bun: `node tests/run.js`
 * Cada arquivo *.test.js exporta { "nome do teste": fn } — fn lança em falha (node:assert).
 */
"use strict";

const path = require("path");

const SUITES = ["core.test.js", "i18n.test.js"];

let passed = 0;
let failed = 0;

for (const suite of SUITES) {
    const tests = require(path.join(__dirname, suite));
    console.log("\n" + suite);
    for (const [name, fn] of Object.entries(tests)) {
        try {
            fn();
            passed++;
            console.log("  ok    " + name);
        } catch (err) {
            failed++;
            console.error("  FAIL  " + name);
            console.error("        " + String(err && err.message ? err.message : err).split("\n").join("\n        "));
        }
    }
}

console.log("\n" + passed + " passed, " + failed + " failed");
process.exit(failed > 0 ? 1 : 0);
