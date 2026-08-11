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
            "nav.aria": "Navegação principal",
            "nav.how": "Como funciona",
            "nav.privacy": "Privacidade",

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

            "page.cta": "Abrir o app",
            "how.doc.title": "Como funciona — SplitSMART",
            "how.intro": "Dividir um PDF no SplitSMART são três passos — tudo acontece no seu navegador, sem enviar nada pra lugar nenhum.",
            "how.step1.body": "Arraste um ou vários PDFs pra área pontilhada, ou clique pra escolher. Cada arquivo é validado antes de entrar: precisa ser um PDF de verdade e não pode ter senha.",
            "how.step2.body": "Pra cada PDF, crie as partes que quiser: um nome, a página inicial e a página final. Os intervalos podem pular páginas e até se sobrepor — a mesma página pode aparecer em duas partes.",
            "how.bulk.title": "Criar várias partes de uma vez",
            "how.bulk.body": "Abra “Criar várias partes de uma vez” e digite os intervalos separados por vírgula, por exemplo: 1-10, 15-30, 40-45. Também vale “1 a 10” e página solta (7). Cada intervalo vira uma parte — você só dá os nomes.",
            "how.step3.body": "Clique em “Dividir tudo”. Cada parte vira um PDF novo, pronto pra baixar um a um — ou tudo junto num .zip. Com vários PDFs, o .zip organiza uma pasta por arquivo de origem.",
            "how.notes.title": "Bom saber",
            "how.notes.encrypted": "PDF protegido por senha é recusado com aviso — remova a senha antes.",
            "how.notes.big": "Arquivos grandes (acima de ~150 MB) funcionam, só podem demorar alguns segundos.",
            "how.notes.names": "Os nomes das partes são ajustados automaticamente pra serem válidos como nome de arquivo em qualquer sistema.",

            "privacy.doc.title": "Privacidade — SplitSMART",
            "privacy.intro": "No SplitSMART, privacidade não é uma promessa — é a arquitetura. Não existe servidor: o site é um arquivo estático, e todo o processamento acontece dentro do seu navegador.",
            "privacy.list.title": "O que isso significa na prática",
            "privacy.item.noupload": "Nenhum byte dos seus PDFs sai do seu computador. Não há upload — a divisão acontece na memória do navegador.",
            "privacy.item.notrack": "Zero rastreamento: sem analytics, sem cookies, sem fontes ou scripts de terceiros carregados em tempo de execução.",
            "privacy.item.storage": "As únicas coisas guardadas no navegador são suas preferências de tema e idioma — nunca nomes ou conteúdo de arquivos.",
            "privacy.item.csp": "Uma política de segurança de conteúdo (CSP) estrita impede a página de se comunicar com qualquer servidor externo.",
            "privacy.item.vendors": "As duas bibliotecas usadas (pdf-lib e JSZip) são servidas junto com o site, com versão fixa e integridade verificada — nada vem de CDN.",
            "privacy.item.meta": "Os PDFs gerados não herdam os metadados do arquivo original.",
            "privacy.outro": "O projeto é de código aberto e pode ser auditado por qualquer pessoa.",

            "footer.tagline": "Divida PDFs em partes com nome — 100% no seu navegador.",
            "footer.product": "Produto",
            "footer.family": "Família Grovic",
            "footer.rights": "© 2026 Grovic. Todos os direitos reservados.",
        },

        "en": {
            "doc.title": "SplitSMART — split PDFs in your browser",
            "app.tagline": "Split your PDFs into named parts, right in your browser",
            "app.privacy": "Your files never leave your computer: everything happens here in the browser, nothing is uploaded to any server.",
            "a11y.skip": "Skip to content",
            "lang.toggle.aria": "Switch to Portuguese",
            "theme.toggle.aria": "Toggle light/dark theme",
            "nav.aria": "Main navigation",
            "nav.how": "How it works",
            "nav.privacy": "Privacy",

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

            "page.cta": "Open the app",
            "how.doc.title": "How it works — SplitSMART",
            "how.intro": "Splitting a PDF in SplitSMART takes three steps — everything happens in your browser, nothing is sent anywhere.",
            "how.step1.body": "Drag one or more PDFs onto the dotted area, or click to browse. Every file is validated before it gets in: it must be a real PDF and it can't be password-protected.",
            "how.step2.body": "For each PDF, create the parts you want: a name, a first page and a last page. Ranges can skip pages and even overlap — the same page can appear in two parts.",
            "how.bulk.title": "Create several parts at once",
            "how.bulk.body": "Open “Create several parts at once” and type the ranges separated by commas, for example: 1-10, 15-30, 40-45. “1 to 10” and single pages (7) also work. Each range becomes a part — you just name them.",
            "how.step3.body": "Click “Split everything”. Each part becomes a brand-new PDF, ready to download one by one — or all together in a .zip. With several PDFs, the .zip keeps one folder per source file.",
            "how.notes.title": "Good to know",
            "how.notes.encrypted": "Password-protected PDFs are refused with a notice — remove the password first.",
            "how.notes.big": "Large files (over ~150 MB) work fine, they just may take a few seconds.",
            "how.notes.names": "Part names are automatically adjusted to be valid file names on any system.",

            "privacy.doc.title": "Privacy — SplitSMART",
            "privacy.intro": "In SplitSMART, privacy is not a promise — it is the architecture. There is no server: the site is a static file, and all processing happens inside your browser.",
            "privacy.list.title": "What that means in practice",
            "privacy.item.noupload": "Not a single byte of your PDFs leaves your computer. There is no upload — splitting happens in the browser's memory.",
            "privacy.item.notrack": "Zero tracking: no analytics, no cookies, no third-party fonts or scripts loaded at runtime.",
            "privacy.item.storage": "The only things stored in your browser are your theme and language preferences — never file names or contents.",
            "privacy.item.csp": "A strict Content Security Policy (CSP) prevents the page from talking to any external server.",
            "privacy.item.vendors": "The two libraries used (pdf-lib and JSZip) ship with the site itself, version-pinned and integrity-checked — nothing comes from a CDN.",
            "privacy.item.meta": "The generated PDFs do not inherit the original file's metadata.",
            "privacy.outro": "The project is open source and can be audited by anyone.",

            "footer.tagline": "Split PDFs into named parts — 100% in your browser.",
            "footer.product": "Product",
            "footer.family": "Grovic family",
            "footer.rights": "© 2026 Grovic. All rights reserved.",
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
