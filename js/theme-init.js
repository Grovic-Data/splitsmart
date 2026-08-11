/*
 * SplitSMART — theme-init.js
 * Roda no <head> (bloqueante de propósito) pra aplicar o tema salvo ANTES do primeiro paint
 * e evitar flash de tema errado. Sem escolha salva → segue o sistema (nenhum atributo).
 */
(function () {
    "use strict";
    try {
        var saved = localStorage.getItem("splitsmart-theme");
        if (saved === "light" || saved === "dark") {
            document.documentElement.setAttribute("data-theme", saved);
        }
    } catch (err) {
        // storage bloqueado (modo privado etc.) — segue o tema do sistema
    }
})();
