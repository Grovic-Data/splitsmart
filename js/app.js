/*
 * SplitSMART — app.js
 * Toda a lógica de UI. Regras de ouro deste arquivo:
 *   - NUNCA innerHTML com dado do usuário: só textContent / el() / clones de <template>.
 *   - Toda string visível passa por t() (i18n pt-BR + en).
 *   - Nenhum byte do PDF sai do browser; nada de PII em localStorage (só tema e idioma).
 */
(function () {
    "use strict";

    const core = window.SplitCore;
    const i18n = window.SplitI18n;
    const PDFDocument = window.PDFLib.PDFDocument;

    const LANG_KEY = "splitsmart-lang";
    const THEME_KEY = "splitsmart-theme";
    const BIG_FILE_BYTES = 150 * 1024 * 1024; // acima disso: aviso de lentidão (não bloqueia)
    const ZIP_NAME = "splitsmart-partes.zip";

    // ---------- helpers ----------

    function $(sel) {
        return document.querySelector(sel);
    }

    function el(tag, attrs, children) {
        const node = document.createElement(tag);
        if (attrs) {
            for (const [k, v] of Object.entries(attrs)) {
                if (v === null || v === undefined || v === false) continue;
                if (k === "class") node.className = v;
                else if (k === "text") node.textContent = String(v);
                else if (k === "value") node.value = String(v);
                else if (k.length > 2 && k.startsWith("on") && typeof v === "function") {
                    node.addEventListener(k.slice(2), v);
                } else if (v === true) node.setAttribute(k, "");
                else node.setAttribute(k, String(v));
            }
        }
        if (children !== null && children !== undefined) {
            for (const c of Array.isArray(children) ? children : [children]) {
                if (c !== null && c !== undefined) node.append(c);
            }
        }
        return node;
    }

    function iconEl(tplId, cls) {
        const svg = document.getElementById(tplId).content.firstElementChild.cloneNode(true);
        if (cls) svg.classList.add(cls);
        return svg;
    }

    function storageGet(key) {
        try {
            return localStorage.getItem(key);
        } catch (err) {
            return null;
        }
    }

    function storageSet(key, value) {
        try {
            localStorage.setItem(key, value);
        } catch (err) {
            // storage bloqueado — preferência só não persiste
        }
    }

    function prefersReduced() {
        return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }

    function scrollToEl(target) {
        if (target) target.scrollIntoView({ behavior: prefersReduced() ? "auto" : "smooth", block: "start" });
    }

    function focusById(id) {
        const node = document.getElementById(id);
        if (node) node.focus();
    }

    // ---------- estado ----------

    function initialLang() {
        const saved = storageGet(LANG_KEY);
        if (saved === "pt-BR" || saved === "en") return saved;
        const nav = String(navigator.language || "").toLowerCase();
        return nav.startsWith("pt") || nav === "" ? "pt-BR" : "en";
    }

    const state = {
        lang: initialLang(),
        files: [], // { id, file, name, size, status, errorKey, doc, pageCount, warnBig, parts, quickValue, quickError, quickOpen }
        results: null, // [{ fileId, fileName, filename, from, to, pages, size, url, blob }]
        busy: false,
    };
    let nextId = 1;
    let t = i18n.makeT(state.lang);

    // ---------- elementos ----------

    const fileInput = $("#file-input");
    const dropzone = $("#dropzone");
    const fileListEl = $("#file-list");
    const filesEmpty = $("#files-empty");
    const generateBtn = $("#generate-btn");
    const generateHint = $("#generate-hint");
    const generateStatus = $("#generate-status");
    const resultsEl = $("#results");
    const resultsActions = $("#results-actions");
    const zipBtn = $("#zip-btn");
    const resetBtn = $("#reset-btn");
    const langBtn = $("#lang-toggle");
    const themeBtn = $("#theme-toggle");
    const step1Section = $("#step-1");

    // ---------- tema ----------

    function storedTheme() {
        const v = storageGet(THEME_KEY);
        return v === "light" || v === "dark" ? v : null;
    }

    function effectiveTheme() {
        return storedTheme() || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    }

    function applyTheme() {
        const explicit = storedTheme();
        if (explicit) document.documentElement.setAttribute("data-theme", explicit);
        else document.documentElement.removeAttribute("data-theme");
        const dark = effectiveTheme() === "dark";
        $("#icon-sun").hidden = !dark;
        $("#icon-moon").hidden = dark;
    }

    // ---------- i18n ----------

    function applyStatic() {
        document.documentElement.lang = state.lang;
        document.title = t("doc.title");
        document.querySelectorAll("[data-i18n]").forEach((node) => {
            node.textContent = t(node.getAttribute("data-i18n"));
        });
        document.querySelectorAll("[data-i18n-aria]").forEach((node) => {
            node.setAttribute("aria-label", t(node.getAttribute("data-i18n-aria")));
        });
        langBtn.textContent = state.lang === "pt-BR" ? "EN" : "PT";
    }

    // ---------- arquivos ----------

    function isPristine(entry, part) {
        return part.name === "" && core.toPageNum(part.from) === 1 && core.toPageNum(part.to) === entry.pageCount;
    }

    function addFiles(list) {
        const files = Array.from(list || []);
        if (!files.length) return;
        const firstBatch = state.files.length === 0;
        const entries = files.map((f) => ({
            id: nextId++,
            file: f,
            name: f.name,
            size: f.size,
            status: "loading",
            errorKey: null,
            doc: null,
            pageCount: 0,
            warnBig: f.size > BIG_FILE_BYTES,
            parts: [],
            quickValue: "",
            quickError: "",
            quickOpen: false,
        }));
        state.files.push(...entries);
        clearResults();
        renderFileList();
        refreshGate();
        if (firstBatch) scrollToEl($("#step-2"));
        processQueue(entries);
    }

    async function processQueue(entries) {
        for (const entry of entries) {
            await processEntry(entry);
            renderFileList();
            refreshGate();
        }
    }

    async function processEntry(entry) {
        try {
            const buf = await entry.file.arrayBuffer();
            const bytes = new Uint8Array(buf);
            if (!core.looksLikePdf(bytes)) {
                entry.status = "error";
                entry.errorKey = "file.error.notPdf";
                return;
            }
            try {
                entry.doc = await PDFDocument.load(bytes);
                entry.pageCount = entry.doc.getPageCount();
                if (entry.pageCount < 1) {
                    entry.status = "error";
                    entry.errorKey = "file.error.corrupt";
                    return;
                }
                entry.parts = [{ id: nextId++, name: "", from: 1, to: entry.pageCount }];
                entry.status = "ready";
            } catch (err) {
                entry.status = "error";
                entry.errorKey = /encrypt/i.test(String(err && err.message)) ? "file.error.encrypted" : "file.error.corrupt";
            }
        } catch (err) {
            entry.status = "error";
            entry.errorKey = "file.error.read";
        } finally {
            entry.file = null; // libera memória; daqui em diante só o doc importa
        }
    }

    function removeFile(id) {
        state.files = state.files.filter((f) => f.id !== id);
        clearResults();
        renderFileList();
        refreshGate();
    }

    // ---------- render: lista de arquivos ----------

    function renderFileList() {
        fileListEl.textContent = "";
        filesEmpty.hidden = state.files.length > 0;
        for (const entry of state.files) fileListEl.append(fileCard(entry));
    }

    function fileMeta(entry) {
        const size = core.formatBytes(entry.size, state.lang);
        if (entry.status !== "ready") return size;
        return i18n.plural(t, "file.pages", entry.pageCount) + " · " + size;
    }

    function fileCard(entry) {
        const head = el("div", { class: "file-head" }, [
            iconEl("tpl-icon-file", "file-icon"),
            el("div", { class: "file-titles" }, [
                el("div", { class: "file-name", text: entry.name }),
                el("div", { class: "file-meta num", text: fileMeta(entry) }),
            ]),
            el(
                "button",
                {
                    type: "button",
                    class: "icon-btn file-remove",
                    "aria-label": t("file.remove.aria", { name: entry.name }),
                    onclick: () => removeFile(entry.id),
                },
                iconEl("tpl-icon-x")
            ),
        ]);

        const body = el("div", { class: "file-body" });
        if (entry.status === "loading") {
            body.append(
                el("div", { class: "file-status-loading" }, [
                    el("span", { class: "spinner", "aria-hidden": "true" }),
                    el("span", { text: t("file.loading") }),
                ])
            );
        } else if (entry.status === "error") {
            body.append(
                el("div", { class: "alert alert-error", role: "alert" }, [
                    iconEl("tpl-icon-warn"),
                    el("span", { text: t(entry.errorKey) }),
                ])
            );
        } else {
            if (entry.warnBig) {
                body.append(
                    el("div", { class: "alert alert-warn" }, [
                        iconEl("tpl-icon-warn"),
                        el("span", { text: t("file.bigWarning") }),
                    ])
                );
            }
            body.append(partsEditor(entry));
        }

        return el("article", { class: "file-card" }, [head, body]);
    }

    // ---------- render: editor de partes ----------

    function errText(errs, entry) {
        return errs.map((k) => (k === "error.range.bounds" ? t(k, { max: entry.pageCount }) : t(k))).join(" ");
    }

    function markInvalid(entry, part) {
        const errs = core.validatePart(part, entry.pageCount);
        const errEl = document.getElementById("p-" + part.id + "-err");
        if (errEl) {
            errEl.textContent = errText(errs, entry);
            errEl.hidden = errs.length === 0;
        }
        for (const key of ["from", "to"]) {
            const input = document.getElementById("p-" + part.id + "-" + key);
            if (input) input.setAttribute("aria-invalid", errs.length > 0 ? "true" : "false");
        }
    }

    function field(cls, labelText, input) {
        return el("label", { class: "field " + cls }, [
            el("span", { class: "field-label", text: labelText }),
            input,
        ]);
    }

    function numInput(entry, part, key, errId) {
        return el("input", {
            type: "number",
            inputmode: "numeric",
            min: "1",
            max: String(entry.pageCount),
            step: "1",
            id: "p-" + part.id + "-" + key,
            value: part[key] === null || part[key] === undefined ? "" : String(part[key]),
            "aria-describedby": errId,
            oninput: (e) => {
                part[key] = e.target.value;
                markInvalid(entry, part);
                refreshGate();
            },
        });
    }

    function partBlock(entry, part, idx) {
        const errId = "p-" + part.id + "-err";
        const errs = core.validatePart(part, entry.pageCount);

        const nameInput = el("input", {
            type: "text",
            id: "p-" + part.id + "-name",
            maxlength: String(core.MAX_NAME_LEN),
            value: part.name,
            placeholder: t("parts.name.placeholder"),
            "aria-label": t("parts.name.label"),
            oninput: (e) => {
                part.name = e.target.value;
            },
        });

        const row = el("div", { class: "part-row" }, [
            field("field-name", t("parts.name.label"), nameInput),
            field("field-from", t("parts.from.label"), numInput(entry, part, "from", errId)),
            field("field-to", t("parts.to.label"), numInput(entry, part, "to", errId)),
            el(
                "button",
                {
                    type: "button",
                    class: "icon-btn part-remove",
                    "aria-label": t("parts.remove.aria", { n: idx + 1 }),
                    onclick: () => {
                        entry.parts = entry.parts.filter((p) => p.id !== part.id);
                        clearResults();
                        renderFileList();
                        refreshGate();
                    },
                },
                iconEl("tpl-icon-x")
            ),
        ]);

        const errEl = el("p", { class: "part-error", id: errId, "aria-live": "polite", text: errText(errs, entry) });
        errEl.hidden = errs.length === 0;
        const block = el("div", { class: "part" }, [row, errEl]);

        // estado inicial de aria-invalid
        for (const key of ["from", "to"]) {
            const input = row.querySelector("#p-" + part.id + "-" + key);
            if (input) input.setAttribute("aria-invalid", errs.length > 0 ? "true" : "false");
        }
        return block;
    }

    function addPart(entry) {
        const last = entry.parts[entry.parts.length - 1];
        const lastTo = last ? core.toPageNum(last.to) : null;
        const from = lastTo !== null && lastTo < entry.pageCount ? lastTo + 1 : 1;
        const part = { id: nextId++, name: "", from: from, to: entry.pageCount };
        entry.parts.push(part);
        clearResults();
        renderFileList();
        refreshGate();
        focusById("p-" + part.id + "-name");
    }

    function quickCreate(entry) {
        const res = core.parseRangeList(entry.quickValue, entry.pageCount);
        if (res.errors.length) {
            const shown = res.errors.slice(0, 3).join(", ") + (res.errors.length > 3 ? "…" : "");
            entry.quickError = t("parts.quick.error", { tokens: shown });
        } else {
            entry.quickError = "";
        }
        if (res.ranges.length) {
            entry.parts = entry.parts.filter((p) => !isPristine(entry, p));
            const created = [];
            for (const r of res.ranges) {
                const part = { id: nextId++, name: "", from: r.from, to: r.to };
                entry.parts.push(part);
                created.push(part);
            }
            entry.quickValue = "";
            clearResults();
            renderFileList();
            refreshGate();
            if (created.length) focusById("p-" + created[0].id + "-name");
            return;
        }
        renderFileList();
        refreshGate();
        focusById("quick-" + entry.id);
    }

    function partsEditor(entry) {
        const wrap = el("div", { class: "parts" });
        entry.parts.forEach((part, idx) => wrap.append(partBlock(entry, part, idx)));

        wrap.append(
            el("div", { class: "parts-actions" }, [
                el(
                    "button",
                    { type: "button", class: "btn btn-outline btn-sm", onclick: () => addPart(entry) },
                    [iconEl("tpl-icon-plus"), el("span", { text: t("parts.add") })]
                ),
                el("span", { class: "parts-count num", text: i18n.plural(t, "parts.count", entry.parts.length) }),
            ])
        );

        const quickInput = el("input", {
            type: "text",
            id: "quick-" + entry.id,
            value: entry.quickValue,
            placeholder: t("parts.quick.placeholder"),
            "aria-label": t("parts.quick.summary"),
            oninput: (e) => {
                entry.quickValue = e.target.value;
            },
            onkeydown: (e) => {
                if (e.key === "Enter") {
                    e.preventDefault();
                    quickCreate(entry);
                }
            },
        });
        const quickErrEl = el("p", { class: "quick-error", "aria-live": "polite", text: entry.quickError });
        quickErrEl.hidden = entry.quickError === "";
        const details = el("details", { class: "quick", open: entry.quickOpen }, [
            el("summary", { text: t("parts.quick.summary") }),
            el("div", { class: "quick-row" }, [
                quickInput,
                el("button", {
                    type: "button",
                    class: "btn btn-outline",
                    text: t("parts.quick.button"),
                    onclick: () => quickCreate(entry),
                }),
            ]),
            el("p", { class: "quick-help", text: t("parts.quick.help") }),
            quickErrEl,
        ]);
        details.addEventListener("toggle", () => {
            entry.quickOpen = details.open;
        });
        wrap.append(details);
        return wrap;
    }

    // ---------- gate do botão "Dividir tudo" ----------

    function refreshGate() {
        const loading = state.files.some((f) => f.status === "loading");
        const ready = state.files.filter((f) => f.status === "ready");
        let msg = "";
        let ok = false;
        if (loading) {
            msg = t("generate.missing.loading");
        } else if (!ready.length) {
            msg = t("generate.missing.files");
        } else {
            const noParts = ready.find((f) => f.parts.length === 0);
            const invalid = ready.some((f) => f.parts.some((p) => core.validatePart(p, f.pageCount).length > 0));
            if (noParts) msg = t("generate.missing.parts", { file: noParts.name });
            else if (invalid) msg = t("generate.missing.fix");
            else ok = true;
        }
        generateBtn.disabled = !ok || state.busy;
        generateHint.textContent = ok ? "" : msg;
        generateHint.hidden = ok;
        return ok;
    }

    function setBusy(busy) {
        state.busy = busy;
        step1Section.inert = busy;
        fileListEl.inert = busy;
        zipBtn.disabled = busy;
        resetBtn.disabled = busy;
        document.body.classList.toggle("busy", busy);
    }

    // ---------- geração ----------

    function clearResults() {
        if (!state.results) return;
        for (const r of state.results) URL.revokeObjectURL(r.url);
        state.results = null;
        resultsEl.textContent = "";
        resultsActions.hidden = true;
        generateStatus.textContent = "";
        generateStatus.classList.remove("ok");
    }

    async function generateAll() {
        if (state.busy || !refreshGate()) return;
        clearResults();
        setBusy(true);
        generateStatus.classList.remove("ok");
        const ready = state.files.filter((f) => f.status === "ready");
        const total = ready.reduce((acc, f) => acc + f.parts.length, 0);
        const results = [];
        let done = 0;
        generateStatus.textContent = t("generate.working", { done: done, total: total });
        try {
            for (const f of ready) {
                const names = core.dedupeNames(
                    f.parts.map((p, i) => {
                        const raw = p.name.trim() !== "" ? p.name : t("part.defaultName", { n: i + 1 });
                        return core.sanitizeFilename(raw, "parte");
                    })
                );
                for (let i = 0; i < f.parts.length; i++) {
                    const part = f.parts[i];
                    const from = core.toPageNum(part.from);
                    const to = core.toPageNum(part.to);
                    const out = await PDFDocument.create();
                    out.setTitle(names[i]);
                    out.setProducer("SplitSMART");
                    out.setCreator("SplitSMART");
                    const pages = await out.copyPages(f.doc, core.rangeToIndices(from, to));
                    for (const pg of pages) out.addPage(pg);
                    const data = await out.save();
                    const blob = new Blob([data], { type: "application/pdf" });
                    results.push({
                        fileId: f.id,
                        fileName: f.name,
                        filename: names[i] + ".pdf",
                        from: from,
                        to: to,
                        pages: to - from + 1,
                        size: blob.size,
                        url: URL.createObjectURL(blob),
                        blob: blob,
                    });
                    done++;
                    generateStatus.textContent = t("generate.working", { done: done, total: total });
                }
            }
            state.results = results;
            renderResults();
            generateStatus.textContent = i18n.plural(t, "generate.done", results.length);
            generateStatus.classList.add("ok");
            resultsActions.hidden = false;
            zipBtn.hidden = results.length < 2;
            scrollToEl($("#step-3"));
            const heading = $("#step3-h");
            heading.setAttribute("tabindex", "-1");
            heading.focus({ preventScroll: true });
        } catch (err) {
            for (const r of results) URL.revokeObjectURL(r.url);
            generateStatus.textContent = t("generate.error");
            // nunca logar nome/conteúdo dos arquivos do usuário — só o tipo do erro
            console.error("split failed:", err && err.name);
        } finally {
            setBusy(false);
            refreshGate();
        }
    }

    // ---------- render: resultados ----------

    function resultMeta(r) {
        return t("results.pages", { from: r.from, to: r.to }) + " · " + core.formatBytes(r.size, state.lang);
    }

    function renderResults() {
        resultsEl.textContent = "";
        if (!state.results || !state.results.length) return;
        const byFile = new Map();
        for (const r of state.results) {
            if (!byFile.has(r.fileId)) byFile.set(r.fileId, []);
            byFile.get(r.fileId).push(r);
        }
        for (const rows of byFile.values()) {
            const group = el("section", { class: "result-group" }, [
                el("h3", { class: "result-group-title", text: rows[0].fileName }),
            ]);
            for (const r of rows) {
                group.append(
                    el("div", { class: "result-row" }, [
                        iconEl("tpl-icon-check", "result-check"),
                        el("div", { class: "result-info" }, [
                            el("div", { class: "result-name", text: r.filename }),
                            el("div", { class: "result-meta num", text: resultMeta(r) }),
                        ]),
                        el(
                            "a",
                            {
                                class: "btn btn-outline",
                                href: r.url,
                                download: r.filename,
                                "aria-label": t("results.download.aria", { name: r.filename }),
                            },
                            [iconEl("tpl-icon-download"), el("span", { text: t("results.download") })]
                        ),
                    ])
                );
            }
            resultsEl.append(group);
        }
    }

    // ---------- zip ----------

    async function downloadZip() {
        if (!state.results || state.results.length < 2 || state.busy) return;
        zipBtn.disabled = true;
        zipBtn.textContent = t("results.zipWorking");
        try {
            const zip = new window.JSZip();
            const fileIds = [...new Set(state.results.map((r) => r.fileId))];
            const multi = fileIds.length > 1;
            const folders = new Map();
            if (multi) {
                const bases = core.dedupeNames(
                    fileIds.map((id) => {
                        const r = state.results.find((x) => x.fileId === id);
                        return core.sanitizeFilename(core.baseName(r ? r.fileName : ""), "pdf");
                    })
                );
                fileIds.forEach((id, i) => folders.set(id, bases[i]));
            }
            for (const r of state.results) {
                const path = multi ? folders.get(r.fileId) + "/" + r.filename : r.filename;
                zip.file(path, r.blob);
            }
            const blob = await zip.generateAsync({ type: "blob" });
            const url = URL.createObjectURL(blob);
            const a = el("a", { href: url, download: ZIP_NAME });
            document.body.append(a);
            a.click();
            a.remove();
            setTimeout(() => URL.revokeObjectURL(url), 60000);
        } finally {
            zipBtn.disabled = false;
            zipBtn.textContent = t("results.downloadAll");
        }
    }

    // ---------- reset ----------

    function resetAll() {
        if (!state.files.length) return;
        if (!window.confirm(t("reset.confirm"))) return;
        clearResults();
        state.files = [];
        renderFileList();
        refreshGate();
        fileInput.value = "";
        scrollToEl($("#step-1"));
        fileInput.focus({ preventScroll: true });
    }

    // ---------- eventos ----------

    fileInput.addEventListener("change", () => {
        addFiles(fileInput.files);
        fileInput.value = "";
    });

    for (const evName of ["dragenter", "dragover"]) {
        dropzone.addEventListener(evName, (e) => {
            e.preventDefault();
            dropzone.classList.add("dragging");
        });
    }
    for (const evName of ["dragleave", "drop"]) {
        dropzone.addEventListener(evName, (e) => {
            e.preventDefault();
            dropzone.classList.remove("dragging");
        });
    }
    dropzone.addEventListener("drop", (e) => {
        addFiles(e.dataTransfer ? e.dataTransfer.files : null);
    });
    // fora da dropzone: impedir que o browser navegue pro arquivo (perderia todo o trabalho)
    window.addEventListener("dragover", (e) => e.preventDefault());
    window.addEventListener("drop", (e) => e.preventDefault());

    window.addEventListener("beforeunload", (e) => {
        if (state.files.length) {
            e.preventDefault();
            e.returnValue = "";
        }
    });

    generateBtn.addEventListener("click", generateAll);
    zipBtn.addEventListener("click", downloadZip);
    resetBtn.addEventListener("click", resetAll);

    themeBtn.addEventListener("click", () => {
        storageSet(THEME_KEY, effectiveTheme() === "dark" ? "light" : "dark");
        applyTheme();
    });
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", applyTheme);

    langBtn.addEventListener("click", () => {
        state.lang = state.lang === "pt-BR" ? "en" : "pt-BR";
        storageSet(LANG_KEY, state.lang);
        t = i18n.makeT(state.lang);
        applyStatic();
        renderFileList();
        renderResults();
        refreshGate();
        if (state.results) {
            generateStatus.textContent = i18n.plural(t, "generate.done", state.results.length);
        }
    });

    // ---------- init ----------

    applyTheme();
    applyStatic();
    renderFileList();
    refreshGate();
})();
