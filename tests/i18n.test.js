"use strict";

const assert = require("assert");
const i18n = require("../js/i18n.js");

module.exports = {
    "simetria: pt-BR e en têm EXATAMENTE as mesmas chaves": () => {
        const pt = Object.keys(i18n.DICTS["pt-BR"]).sort();
        const en = Object.keys(i18n.DICTS["en"]).sort();
        const soPt = pt.filter((k) => !en.includes(k));
        const soEn = en.filter((k) => !pt.includes(k));
        assert.deepStrictEqual(soPt, [], "chaves só em pt-BR: " + soPt.join(", "));
        assert.deepStrictEqual(soEn, [], "chaves só em en: " + soEn.join(", "));
    },
    "simetria: placeholders {x} idênticos nas duas línguas": () => {
        const pt = i18n.DICTS["pt-BR"];
        const en = i18n.DICTS["en"];
        for (const key of Object.keys(pt)) {
            const ph = (s) => (s.match(/\{[a-zA-Z]+\}/g) || []).sort().join(",");
            assert.strictEqual(ph(en[key]), ph(pt[key]), "placeholders divergem em " + key);
        }
    },
    "nenhuma string vazia nos dicionários": () => {
        for (const lang of i18n.LANGS) {
            for (const [k, v] of Object.entries(i18n.DICTS[lang])) {
                assert.ok(typeof v === "string" && v.trim().length > 0, lang + "/" + k + " vazia");
            }
        }
    },
    "makeT: resolve chave e interpola params": () => {
        const t = i18n.makeT("pt-BR");
        assert.strictEqual(t("error.range.bounds", { max: 50 }), "Use páginas entre 1 e 50.");
        const te = i18n.makeT("en");
        assert.strictEqual(te("error.range.bounds", { max: 9 }), "Use pages between 1 and 9.");
    },
    "makeT: chave desconhecida devolve a própria chave (nunca undefined)": () => {
        const t = i18n.makeT("pt-BR");
        assert.strictEqual(t("nao.existe"), "nao.existe");
    },
    "makeT: idioma desconhecido cai no default": () => {
        const t = i18n.makeT("fr");
        assert.strictEqual(t("generate.button"), i18n.DICTS["pt-BR"]["generate.button"]);
    },
    "plural: .one e .other": () => {
        const t = i18n.makeT("pt-BR");
        assert.strictEqual(i18n.plural(t, "file.pages", 1), "1 página");
        assert.strictEqual(i18n.plural(t, "file.pages", 12), "12 páginas");
        const te = i18n.makeT("en");
        assert.strictEqual(i18n.plural(te, "generate.done", 3), "3 parts ready to download.");
    },
    "todas as chaves de plural têm o par .one/.other": () => {
        for (const lang of i18n.LANGS) {
            const keys = Object.keys(i18n.DICTS[lang]);
            for (const k of keys) {
                if (k.endsWith(".one")) {
                    assert.ok(keys.includes(k.replace(/\.one$/, ".other")), k + " sem .other em " + lang);
                }
                if (k.endsWith(".other")) {
                    assert.ok(keys.includes(k.replace(/\.other$/, ".one")), k + " sem .one em " + lang);
                }
            }
        }
    },
};
