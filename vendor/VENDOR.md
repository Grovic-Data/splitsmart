# Vendors pinados — SplitSMART

**Última revisão:** 2026-08-11

Bibliotecas de runtime servidas localmente (CSP `script-src 'self'` — CDN proibido, ver [Docs/security.md](../Docs/security.md)).

| Arquivo | Versão | SHA-256 | Fonte |
|---|---|---|---|
| `pdf-lib.min.js` | 1.17.1 | `0f9a5cad07941f0826586c94e089d89b918c46e5c17cf2d5a3c6f666e3bc694f` | `https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js` |
| `jszip.min.js` | 3.10.1 | `acc7e41455a80765b5fd9c7ee1b8078a6d160bbbca455aeae854de65c947d59e` | `https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js` |

Globais expostos: `window.PDFLib` · `window.JSZip`.

## Procedimento de atualização

1. Só atualizar versão com **≥ 7 dias de release** (mentalidade `minimumReleaseAge` da família — janela anti typosquat/release malicioso).
2. Baixar do jsDelivr/unpkg pela URL versionada exata.
3. Recalcular SHA-256 (`sha256sum vendor/*.js` no Git Bash) e atualizar esta tabela + data de revisão.
4. Rodar `node tests/run.js` + smoke manual (upload → dividir → baixar → zip) antes de commitar.
