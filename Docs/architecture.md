# Arquitetura — SplitSMART

**Última revisão:** 2026-08-11

## Contexto

App estático de página única pra dividir PDFs em partes nomeadas, hospedado em GitHub Pages. Requisito de produto: rodar **sem hospedagem própria** e ser operável por **usuário não-técnico**. Requisito de segurança: **nenhum byte do PDF sai do browser** (ver [security.md](security.md)).

## Fluxo de dados

```
FileList (input/drag&drop)
  → File.arrayBuffer() → Uint8Array
  → core.looksLikePdf (magic bytes %PDF- no 1º KB)          [recusa: notPdf]
  → PDFLib.PDFDocument.load(bytes)                           [recusa: encrypted | corrupt]
  → entry { doc, pageCount, parts: [{name, from, to}] }      (estado em memória, nada persiste)
  → "Dividir tudo":
      por parte: PDFDocument.create() → copyPages(doc, índices) → save()
      → Blob(application/pdf) → URL.createObjectURL → <a download>
  → ZIP opcional: JSZip.file(pasta?/nome.pdf, blob) → generateAsync → download
```

- Páginas são 1-based na UI; `core.rangeToIndices` converte pra 0-based do pdf-lib.
- Intervalos podem **pular e sobrepor** páginas (decisão de produto — o exemplo canônico do usuário pula 11–14 e 31–39).
- O PDF de saída é um documento **novo**: não herda metadados do original (título = nome da parte, producer/creator = SplitSMART).
- Blob URLs são revogadas em regeneração/remoção/reset (`clearResults`) — sem vazamento de memória entre rodadas.

## Modelo de estado (app.js)

```js
state = {
  lang: "pt-BR" | "en",
  files: [{ id, name, size, status: "loading"|"ready"|"error", errorKey,
            doc, pageCount, warnBig, parts: [{ id, name, from, to }],
            quickValue, quickError, quickOpen }],
  results: null | [{ fileId, fileName, filename, from, to, pages, size, url, blob }],
  busy: bool,
}
```

Render = reconstrução das seções dinâmicas a partir do estado (`renderFileList`, `renderResults`). Reconstrução completa só em mudança **estrutural** (add/remove arquivo ou parte, troca de idioma); digitação atualiza estado + validação in-place (sem perder foco). Durante `busy`, seções de entrada ficam `inert`.

## Separação de camadas

| Camada | Arquivo | Regra |
|---|---|---|
| Funções puras | `js/core.js` | zero DOM, zero pdf-lib; 100% testável em Node; TDD |
| i18n | `js/i18n.js` | só dicionários + `makeT`/`plural`; chaves simétricas pt↔en |
| UI/orquestração | `js/app.js` | DOM via `el()`/`textContent`/`<template>`; nunca `innerHTML` |
| Tema (anti-FOUC) | `js/theme-init.js` | único script no `<head>`, aplica `data-theme` salvo antes do paint |

## Decisões (tradeoffs)

- **Zero build/framework.** O app tem 1 tela; vanilla elimina supply-chain de build, deixa o deploy = cópia de arquivos e o repo legível por qualquer um. Custo: sem typecheck — compensado por testes + gate de i18n.
- **Vendors locais, não CDN.** pdf-lib/JSZip pinados em `vendor/` com SHA-256 registrado ([VENDOR.md](../vendor/VENDOR.md)). Motivo: CSP `script-src 'self'`, funcionamento offline, imunidade a takedown/rug-pull de CDN. Mentalidade `minimumReleaseAge` da família pra updates.
- **Tema em 3 estados** (system/light/dark): tokens no `:root` (light), espelho dark em `@media (prefers-color-scheme) + :not([data-theme="light"])` E em `[data-theme="dark"]`. Toggle grava escolha explícita em `localStorage`; sem escolha → segue o sistema.
- **i18n em runtime** (`data-i18n` + `t()`): dicionários planos, plural `.one`/`.other`. Sem framework de i18n — o gate `scripts/check-i18n-keys.mjs` cobre simetria e resolução.
- **Sequencial, não paralelo**, no processamento de arquivos/partes: PDFs grandes já saturam CPU/memória de uma aba; paralelizar só piora. Progresso reportado por parte (`aria-live`).

## Limites conhecidos

- PDF protegido por senha é recusado (pdf-lib lança; decisão: não usar `ignoreEncryption`, output sairia inválido).
- Arquivos muito grandes (> 150 MB) recebem aviso de lentidão, não bloqueio — o custo é do próprio usuário (client-side).
- Sem preview de página (exigiria pdf.js, +2 MB). Candidato de roadmap — ver [.planning/STATE.md](../.planning/STATE.md).
