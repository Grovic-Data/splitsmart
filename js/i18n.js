/*
 * SplitSMART — i18n.js
 * Dicionários pt-BR (default) + en. MESMAS chaves nos dois — validado por tests/i18n.test.js.
 * Plural: sufixo ".one"/".other" via SplitI18n.plural(t, base, n).
 * UMD mínimo: `SplitI18n` no browser, module.exports no Node (pros testes).
 */
(function (global) {
    "use strict";

    const DICTS = {
        "pt-BR": {
            "doc.title": "SplitSMART — divida PDFs no navegador",
            "app.tagline": "Divida seus PDFs em partes com nome, direto no navegador",
            "app.privacy": "Seus arquivos não saem do seu computador: tudo acontece aqui no navegador, nada é enviado a servidor nenhum.",
            "a11y.skip": "Pular para o conteúdo",
            "lang.toggle.aria": "Mudar para inglês",
            "theme.toggle.aria": "Alternar tema claro/escuro",

            "step1.title": "Escolha os PDFs",
            "dropzone.cta": "Arraste PDFs aqui",
            "dropzone.or": "ou",
            "dropzone.browse": "clique para escolher",
            "dropzone.hint": "Pode escolher vários de uma vez",

            "step2.title": "Monte as partes de cada PDF",
            "step2.empty": "Adicione um PDF no passo 1 para começar.",

            "file.loading": "Lendo o arquivo…",
            "file.pages.one": "1 página",
            "file.pages.other": "{n} páginas",
            "file.remove.aria": "Remover {name}",
            "file.bigWarning": "Arquivo grande — a divisão pode levar alguns segundos.",
            "file.error.notPdf": "Este arquivo não parece ser um PDF válido.",
            "file.error.encrypted": "Este PDF é protegido por senha. Remova a senha e tente de novo.",
            "file.error.corrupt": "Não foi possível ler este PDF. O arquivo pode estar corrompido.",
            "file.error.read": "Falha ao ler o arquivo. Tente de novo.",

            "parts.count.one": "1 parte",
            "parts.count.other": "{n} partes",
            "parts.add": "Adicionar parte",
            "parts.name.label": "Nome da parte",
            "parts.name.placeholder": "ex.: Anatomia",
            "parts.from.label": "Da página",
            "parts.to.label": "Até a página",
            "parts.remove.aria": "Remover parte {n}",
            "parts.quick.summary": "Criar várias partes de uma vez",
            "parts.quick.help": "Digite os intervalos separados por vírgula e clique em Criar. Ex.: 1-10, 15-30, 40-45",
            "parts.quick.placeholder": "1-10, 15-30, 40-45",
            "parts.quick.button": "Criar partes",
            "parts.quick.error": "Não entendi: {tokens}. Use o formato 1-10, 15-30.",
            "part.defaultName": "Parte {n}",

            "error.range.required": "Informe as páginas inicial e final.",
            "error.range.bounds": "Use páginas entre 1 e {max}.",
            "error.range.order": "A página inicial deve ser menor ou igual à final.",

            "step3.title": "Divida e baixe",
            "generate.button": "Dividir tudo",
            "generate.working": "Dividindo… {done} de {total}",
            "generate.done.one": "1 parte pronta para baixar.",
            "generate.done.other": "{n} partes prontas para baixar.",
            "generate.missing.loading": "Aguarde — ainda lendo seus PDFs…",
            "generate.missing.parts": "“{file}” ainda está sem partes.",
            "generate.missing.fix": "Corrija os campos destacados em vermelho.",
            "generate.missing.files": "Adicione ao menos um PDF válido no passo 1.",
            "generate.error": "Algo deu errado ao dividir. Recarregue a página e tente de novo.",

            "results.download": "Baixar",
            "results.download.aria": "Baixar {name}",
            "results.downloadAll": "Baixar tudo (.zip)",
            "results.zipWorking": "Gerando o .zip…",
            "results.pages": "págs. {from}–{to}",

            "reset.button": "Começar de novo",
            "reset.confirm": "Descartar todos os PDFs e as partes configuradas?",

            "footer.note": "100% no seu navegador · nenhum arquivo é enviado a servidores · projeto da família Grovic",
        },

        "en": {
            "doc.title": "SplitSMART — split PDFs in your browser",
            "app.tagline": "Split your PDFs into named parts, right in your browser",
            "app.privacy": "Your files never leave your computer: everything happens here in the browser, nothing is uploaded to any server.",
            "a11y.skip": "Skip to content",
            "lang.toggle.aria": "Switch to Portuguese",
            "theme.toggle.aria": "Toggle light/dark theme",

            "step1.title": "Choose your PDFs",
            "dropzone.cta": "Drag PDFs here",
            "dropzone.or": "or",
            "dropzone.browse": "click to browse",
            "dropzone.hint": "You can pick several at once",

            "step2.title": "Set up the parts of each PDF",
            "step2.empty": "Add a PDF in step 1 to get started.",

            "file.loading": "Reading file…",
            "file.pages.one": "1 page",
            "file.pages.other": "{n} pages",
            "file.remove.aria": "Remove {name}",
            "file.bigWarning": "Large file — splitting may take a few seconds.",
            "file.error.notPdf": "This file does not look like a valid PDF.",
            "file.error.encrypted": "This PDF is password-protected. Remove the password and try again.",
            "file.error.corrupt": "Could not read this PDF. The file may be corrupted.",
            "file.error.read": "Failed to read the file. Please try again.",

            "parts.count.one": "1 part",
            "parts.count.other": "{n} parts",
            "parts.add": "Add part",
            "parts.name.label": "Part name",
            "parts.name.placeholder": "e.g. Anatomy",
            "parts.from.label": "From page",
            "parts.to.label": "To page",
            "parts.remove.aria": "Remove part {n}",
            "parts.quick.summary": "Create several parts at once",
            "parts.quick.help": "Type the ranges separated by commas and click Create. E.g. 1-10, 15-30, 40-45",
            "parts.quick.placeholder": "1-10, 15-30, 40-45",
            "parts.quick.button": "Create parts",
            "parts.quick.error": "Could not understand: {tokens}. Use the format 1-10, 15-30.",
            "part.defaultName": "Part {n}",

            "error.range.required": "Fill in the first and last pages.",
            "error.range.bounds": "Use pages between 1 and {max}.",
            "error.range.order": "The first page must be less than or equal to the last one.",

            "step3.title": "Split and download",
            "generate.button": "Split everything",
            "generate.working": "Splitting… {done} of {total}",
            "generate.done.one": "1 part ready to download.",
            "generate.done.other": "{n} parts ready to download.",
            "generate.missing.loading": "Hold on — still reading your PDFs…",
            "generate.missing.parts": "“{file}” has no parts yet.",
            "generate.missing.fix": "Fix the fields highlighted in red.",
            "generate.missing.files": "Add at least one valid PDF in step 1.",
            "generate.error": "Something went wrong while splitting. Reload the page and try again.",

            "results.download": "Download",
            "results.download.aria": "Download {name}",
            "results.downloadAll": "Download all (.zip)",
            "results.zipWorking": "Building the .zip…",
            "results.pages": "pages {from}–{to}",

            "reset.button": "Start over",
            "reset.confirm": "Discard all PDFs and the parts you set up?",

            "footer.note": "100% in your browser · no file is ever uploaded · a Grovic family project",
        },
    };

    const DEFAULT_LANG = "pt-BR";
    const LANGS = ["pt-BR", "en"];

    /** Retorna a função t(key, params) do idioma. Chave ausente → fallback pt-BR → a própria chave. */
    function makeT(lang) {
        const dict = DICTS[lang] || DICTS[DEFAULT_LANG];
        const base = DICTS[DEFAULT_LANG];
        return function t(key, params) {
            let s;
            if (Object.prototype.hasOwnProperty.call(dict, key)) {
                s = dict[key];
            } else if (Object.prototype.hasOwnProperty.call(base, key)) {
                s = base[key];
            } else {
                s = key;
            }
            if (params) {
                for (const k of Object.keys(params)) {
                    s = s.split("{" + k + "}").join(String(params[k]));
                }
            }
            return s;
        };
    }

    /** Plural canônico da casa: base + ".one"/".other", com {n} já injetado. */
    function plural(t, baseKey, n, params) {
        const p = Object.assign({ n: n }, params || {});
        return t(baseKey + (n === 1 ? ".one" : ".other"), p);
    }

    const SplitI18n = {
        DICTS: DICTS,
        DEFAULT_LANG: DEFAULT_LANG,
        LANGS: LANGS,
        makeT: makeT,
        plural: plural,
    };

    if (typeof module !== "undefined" && module.exports) {
        module.exports = SplitI18n;
    } else {
        global.SplitI18n = SplitI18n;
    }
})(typeof globalThis !== "undefined" ? globalThis : this);
