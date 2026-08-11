"use strict";

const assert = require("assert");
const core = require("../js/core.js");

function pdfBytes(prefix) {
    const header = (prefix || "") + "%PDF-1.7 restante";
    return new Uint8Array(Array.from(header, (c) => c.charCodeAt(0)));
}

module.exports = {
    // --- sanitizeFilename -------------------------------------------------
    "sanitizeFilename: nome normal fica intacto (espaço e acento preservados)": () => {
        assert.strictEqual(core.sanitizeFilename("Anatomia Aplicada"), "Anatomia Aplicada");
        assert.strictEqual(core.sanitizeFilename("Faculdade — Módulo 2"), "Faculdade — Módulo 2");
    },
    "sanitizeFilename: remove chars proibidos no Windows": () => {
        assert.strictEqual(core.sanitizeFilename('a<b>c:d"e/f\\g|h?i*j'), "a b c d e f g h i j");
    },
    "sanitizeFilename: remove control chars": () => {
        assert.strictEqual(core.sanitizeFilename("abc\u0000\u001F\u007Fdef"), "abcdef");
    },
    "sanitizeFilename: vazio/só lixo vira fallback": () => {
        assert.strictEqual(core.sanitizeFilename(""), "parte");
        assert.strictEqual(core.sanitizeFilename("   ..  "), "parte");
        assert.strictEqual(core.sanitizeFilename(null, "doc"), "doc");
    },
    "sanitizeFilename: nome reservado do Windows ganha sufixo": () => {
        assert.strictEqual(core.sanitizeFilename("CON"), "CON_");
        assert.strictEqual(core.sanitizeFilename("lpt1"), "lpt1_");
    },
    "sanitizeFilename: pontos/espaços nas bordas caem (anti dotfile / trailing dot)": () => {
        assert.strictEqual(core.sanitizeFilename("..escondido"), "escondido");
        assert.strictEqual(core.sanitizeFilename("nome final. "), "nome final");
    },
    "sanitizeFilename: limita a 80 chars": () => {
        const out = core.sanitizeFilename("x".repeat(300));
        assert.strictEqual(out.length, 80);
    },

    // --- looksLikePdf -----------------------------------------------------
    "looksLikePdf: header no offset 0": () => {
        assert.strictEqual(core.looksLikePdf(pdfBytes()), true);
    },
    "looksLikePdf: header depois de preâmbulo": () => {
        assert.strictEqual(core.looksLikePdf(pdfBytes("lixo antes do header ")), true);
    },
    "looksLikePdf: não-PDF rejeitado": () => {
        const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00]);
        assert.strictEqual(core.looksLikePdf(png), false);
        assert.strictEqual(core.looksLikePdf(new Uint8Array([])), false);
        assert.strictEqual(core.looksLikePdf(null), false);
    },
    "looksLikePdf: header além de 1024 bytes NÃO conta": () => {
        const bytes = new Uint8Array(2048).fill(0x20);
        const sig = [0x25, 0x50, 0x44, 0x46, 0x2d];
        sig.forEach((b, i) => (bytes[1500 + i] = b));
        assert.strictEqual(core.looksLikePdf(bytes), false);
    },

    // --- toPageNum / validatePart ----------------------------------------
    "toPageNum: vazio e não-inteiro viram null": () => {
        assert.strictEqual(core.toPageNum(""), null);
        assert.strictEqual(core.toPageNum(null), null);
        assert.strictEqual(core.toPageNum("2.5"), null);
        assert.strictEqual(core.toPageNum("abc"), null);
        assert.strictEqual(core.toPageNum("7"), 7);
        assert.strictEqual(core.toPageNum(0), 0);
    },
    "validatePart: parte válida passa": () => {
        assert.deepStrictEqual(core.validatePart({ from: 1, to: 10 }, 50), []);
        assert.deepStrictEqual(core.validatePart({ from: "40", to: "45" }, 45), []);
    },
    "validatePart: campos vazios → required": () => {
        assert.deepStrictEqual(core.validatePart({ from: "", to: 5 }, 50), ["error.range.required"]);
        assert.deepStrictEqual(core.validatePart({}, 50), ["error.range.required"]);
    },
    "validatePart: fora dos limites → bounds": () => {
        assert.deepStrictEqual(core.validatePart({ from: 0, to: 5 }, 50), ["error.range.bounds"]);
        assert.deepStrictEqual(core.validatePart({ from: 1, to: 51 }, 50), ["error.range.bounds"]);
    },
    "validatePart: invertida → order": () => {
        assert.deepStrictEqual(core.validatePart({ from: 10, to: 2 }, 50), ["error.range.order"]);
    },
    "validatePart: fora do limite E invertida → os dois erros": () => {
        assert.deepStrictEqual(core.validatePart({ from: 60, to: 55 }, 50), [
            "error.range.bounds",
            "error.range.order",
        ]);
    },

    // --- parseRangeList ---------------------------------------------------
    "parseRangeList: exemplo canônico do usuário": () => {
        const r = core.parseRangeList("1-10, 15-30, 40-45", 50);
        assert.deepStrictEqual(r.errors, []);
        assert.deepStrictEqual(r.ranges, [
            { from: 1, to: 10 },
            { from: 15, to: 30 },
            { from: 40, to: 45 },
        ]);
    },
    "parseRangeList: número solto vira página única": () => {
        assert.deepStrictEqual(core.parseRangeList("7", 10).ranges, [{ from: 7, to: 7 }]);
    },
    "parseRangeList: aceita '1 a 10' e '2 até 5'": () => {
        assert.deepStrictEqual(core.parseRangeList("1 a 10; 2 até 5", 20).ranges, [
            { from: 1, to: 10 },
            { from: 2, to: 5 },
        ]);
    },
    "parseRangeList: tokens inválidos vão pra errors, válidos sobrevivem": () => {
        const r = core.parseRangeList("1-3, abc, 9-5, 60-70, 4", 50);
        assert.deepStrictEqual(r.ranges, [{ from: 1, to: 3 }, { from: 4, to: 4 }]);
        assert.deepStrictEqual(r.errors, ["abc", "9-5", "60-70"]);
    },
    "parseRangeList: vazio → nada": () => {
        const r = core.parseRangeList("", 10);
        assert.deepStrictEqual(r.ranges, []);
        assert.deepStrictEqual(r.errors, []);
    },
    "parseRangeList: input gigante é truncado sem explodir": () => {
        const big = "1-2,".repeat(5000);
        const r = core.parseRangeList(big, 10);
        assert.ok(r.ranges.length > 0 && r.ranges.length <= 500);
    },

    // --- rangeToIndices / dedupeNames / baseName / formatBytes -----------
    "rangeToIndices: 1-based → 0-based": () => {
        assert.deepStrictEqual(core.rangeToIndices(1, 3), [0, 1, 2]);
        assert.deepStrictEqual(core.rangeToIndices(5, 5), [4]);
    },
    "dedupeNames: duplicados ganham (2), (3)… e colisão com sufixo existente resolve": () => {
        assert.deepStrictEqual(core.dedupeNames(["a", "b", "a", "A"]), ["a", "b", "a (2)", "A (3)"]);
        assert.deepStrictEqual(core.dedupeNames(["a", "a", "a (2)"]), ["a", "a (2)", "a (2) (2)"]);
    },
    "baseName: tira só a última extensão": () => {
        assert.strictEqual(core.baseName("aula.pdf"), "aula");
        assert.strictEqual(core.baseName("modulo.1.final.pdf"), "modulo.1.final");
        assert.strictEqual(core.baseName("sem-extensao"), "sem-extensao");
        assert.strictEqual(core.baseName(".oculto"), ".oculto");
    },
    "formatBytes: unidades corretas": () => {
        assert.strictEqual(core.formatBytes(0, "en"), "0 B");
        assert.strictEqual(core.formatBytes(2048, "en"), "2 KB");
        assert.strictEqual(core.formatBytes(1258291, "en"), "1.2 MB");
        assert.strictEqual(core.formatBytes(1258291, "pt-BR"), "1,2 MB");
        assert.strictEqual(core.formatBytes(-5, "en"), "");
    },
};
