/*
 * SplitSMART — core.js
 * Funções puras (sem DOM, sem pdf-lib). Testáveis em Node: `node tests/run.js`.
 * UMD mínimo: expõe `SplitCore` no browser e via module.exports no Node.
 */
(function (global) {
    "use strict";

    const MAX_NAME_LEN = 80;
    const MAX_RANGE_INPUT_LEN = 2000; // teto de input pro parser (higiene anti-DoS, CWE-1333)
    const WINDOWS_RESERVED = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i;
    // token: "5" | "1-10" | "1 a 10" | "1 até 10" — regex linear, sem backtracking catastrófico
    const RANGE_TOKEN = /^(\d{1,6})(?:\s*(?:-|–|—|a|ate|até)\s*(\d{1,6}))?$/i;

    /**
     * Sanitiza um nome vindo do usuário para uso como nome de arquivo.
     * Remove control chars, chars proibidos no Windows, pontos/espaços nas bordas,
     * nomes reservados (CON, PRN…) e limita a MAX_NAME_LEN. Vazio → fallback.
     */
    function sanitizeFilename(raw, fallback) {
        const fb = fallback || "parte";
        let s = String(raw === null || raw === undefined ? "" : raw).normalize("NFC");
        s = s.replace(/[\u0000-\u001F\u007F]/g, "");
        s = s.replace(/[<>:"/\\|?*]/g, " ");
        s = s.replace(/\s+/g, " ").trim();
        s = s.replace(/^\.+/, "");
        s = s.replace(/[. ]+$/, "");
        if (s.length > MAX_NAME_LEN) s = s.slice(0, MAX_NAME_LEN);
        s = s.replace(/[. ]+$/, "").trim();
        if (!s) s = fb;
        if (WINDOWS_RESERVED.test(s)) s = s + "_";
        return s;
    }

    /** Magic bytes: procura "%PDF-" nos primeiros 1024 bytes (a spec permite preâmbulo). */
    function looksLikePdf(bytes) {
        if (!bytes || !bytes.length) return false;
        const limit = Math.min(bytes.length, 1024);
        for (let i = 0; i + 4 < limit; i++) {
            if (
                bytes[i] === 0x25 && // %
                bytes[i + 1] === 0x50 && // P
                bytes[i + 2] === 0x44 && // D
                bytes[i + 3] === 0x46 && // F
                bytes[i + 4] === 0x2d // -
            ) {
                return true;
            }
        }
        return false;
    }

    /** "" | null | não-inteiro → null; senão o inteiro (0/negativo passam — bounds decide). */
    function toPageNum(v) {
        if (v === "" || v === null || v === undefined) return null;
        const n = Number(v);
        if (!Number.isFinite(n) || !Number.isInteger(n)) return null;
        return n;
    }

    /**
     * Valida uma parte {from, to} contra pageCount.
     * Retorna array de chaves i18n de erro (vazio = válida).
     */
    function validatePart(part, pageCount) {
        const errs = [];
        const from = toPageNum(part && part.from);
        const to = toPageNum(part && part.to);
        if (from === null || to === null) {
            errs.push("error.range.required");
            return errs;
        }
        if (from < 1 || to < 1 || from > pageCount || to > pageCount) {
            errs.push("error.range.bounds");
        }
        if (from > to) {
            errs.push("error.range.order");
        }
        return errs;
    }

    /**
     * Parse de "1-10, 15-30, 40-45" (também "5", "1 a 10", separadores , ; e quebra de linha).
     * Retorna { ranges: [{from,to}], errors: [tokenInválido] }. Bounds checadas se pageCount > 0.
     */
    function parseRangeList(input, pageCount) {
        const ranges = [];
        const errors = [];
        const raw = String(input === null || input === undefined ? "" : input).slice(0, MAX_RANGE_INPUT_LEN);
        const tokens = raw.split(/[,;\n]+/);
        for (const rawTok of tokens) {
            const tok = rawTok.trim();
            if (!tok) continue;
            const m = RANGE_TOKEN.exec(tok);
            if (!m) {
                errors.push(tok);
                continue;
            }
            const from = parseInt(m[1], 10);
            const to = m[2] ? parseInt(m[2], 10) : from;
            if (from < 1 || to < from || (pageCount > 0 && to > pageCount)) {
                errors.push(tok);
                continue;
            }
            ranges.push({ from: from, to: to });
        }
        return { ranges: ranges, errors: errors };
    }

    /** Páginas 1-based [from..to] → índices 0-based pro pdf-lib. */
    function rangeToIndices(from, to) {
        const out = [];
        for (let p = from; p <= to; p++) out.push(p - 1);
        return out;
    }

    /** Deduplica nomes (case-insensitive) com sufixo " (2)", " (3)"… Sempre único. */
    function dedupeNames(names) {
        const used = new Set();
        return names.map(function (name) {
            let candidate = name;
            let i = 2;
            while (used.has(candidate.toLowerCase())) {
                candidate = name + " (" + i + ")";
                i++;
            }
            used.add(candidate.toLowerCase());
            return candidate;
        });
    }

    /** "aula.pdf" → "aula" (só a última extensão; sem ponto ou dotfile → intacto). */
    function baseName(filename) {
        const s = String(filename === null || filename === undefined ? "" : filename);
        const dot = s.lastIndexOf(".");
        return dot > 0 ? s.slice(0, dot) : s;
    }

    /** 1234567 → "1,2 MB" (locale-aware). */
    function formatBytes(n, locale) {
        if (!Number.isFinite(n) || n < 0) return "";
        const units = ["B", "KB", "MB", "GB"];
        let u = 0;
        let v = n;
        while (v >= 1024 && u < units.length - 1) {
            v = v / 1024;
            u++;
        }
        const digits = v >= 100 || u === 0 ? 0 : 1;
        const num = new Intl.NumberFormat(locale || "pt-BR", {
            maximumFractionDigits: digits,
            minimumFractionDigits: 0,
        }).format(v);
        return num + " " + units[u];
    }

    const SplitCore = {
        MAX_NAME_LEN: MAX_NAME_LEN,
        sanitizeFilename: sanitizeFilename,
        looksLikePdf: looksLikePdf,
        toPageNum: toPageNum,
        validatePart: validatePart,
        parseRangeList: parseRangeList,
        rangeToIndices: rangeToIndices,
        dedupeNames: dedupeNames,
        baseName: baseName,
        formatBytes: formatBytes,
    };

    if (typeof module !== "undefined" && module.exports) {
        module.exports = SplitCore;
    } else {
        global.SplitCore = SplitCore;
    }
})(typeof globalThis !== "undefined" ? globalThis : this);
