/*
 * SplitSMART — page.js
 * Chrome das páginas estáticas (como-funciona, privacidade): tema + idioma.
 * Espelha as mesmas chaves de storage do app.js; NÃO carrega pdf-lib/app.
 * O título do documento vem de <body data-doc-title="chave.i18n">.
 */
(function () {
    "use strict";

    const i18n = window.SplitI18n;
    const LANG_KEY = "splitsmart-lang";
    const THEME_KEY = "splitsmart-theme";

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

    function initialLang() {
        const saved = storageGet(LANG_KEY);
        if (saved === "pt-BR" || saved === "en") return saved;
        const nav = String(navigator.language || "").toLowerCase();
        return nav.startsWith("pt") || nav === "" ? "pt-BR" : "en";
    }

    let lang = initialLang();
    let t = i18n.makeT(lang);

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
        const sun = document.getElementById("icon-sun");
        const moon = document.getElementById("icon-moon");
        if (sun) sun.hidden = !dark;
        if (moon) moon.hidden = dark;
        const meta = document.querySelector('meta[name="theme-color"]');
        if (meta) meta.content = getComputedStyle(document.documentElement).getPropertyValue("--bg").trim();
    }

    function applyStatic() {
        document.documentElement.lang = lang;
        const titleKey = document.body.getAttribute("data-doc-title");
        if (titleKey) document.title = t(titleKey);
        document.querySelectorAll("[data-i18n]").forEach((node) => {
            node.textContent = t(node.getAttribute("data-i18n"));
        });
        document.querySelectorAll("[data-i18n-aria]").forEach((node) => {
            node.setAttribute("aria-label", t(node.getAttribute("data-i18n-aria")));
        });
        const langBtn = document.getElementById("lang-toggle");
        if (langBtn) langBtn.textContent = lang === "pt-BR" ? "EN" : "PT";
    }

    const themeBtn = document.getElementById("theme-toggle");
    if (themeBtn) {
        themeBtn.addEventListener("click", () => {
            storageSet(THEME_KEY, effectiveTheme() === "dark" ? "light" : "dark");
            applyTheme();
        });
    }
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", applyTheme);

    const langBtn = document.getElementById("lang-toggle");
    if (langBtn) {
        langBtn.addEventListener("click", () => {
            lang = lang === "pt-BR" ? "en" : "pt-BR";
            storageSet(LANG_KEY, lang);
            t = i18n.makeT(lang);
            applyStatic();
        });
    }

    applyTheme();
    applyStatic();
})();
