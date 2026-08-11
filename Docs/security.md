# Segurança — SplitSMART

**Última revisão:** 2026-08-11

## Modelo de ameaça

**O ativo é a privacidade do conteúdo dos PDFs do usuário** (podem conter prontuário, contrato, prova — o público da família Grovic lida com dado sensível). Não há servidor, conta, nem dado nosso a proteger; o que existe pra defender é:

1. **Confidencialidade**: nenhum byte do arquivo pode sair do browser.
2. **Integridade do output**: o arquivo baixado é o que o usuário pediu, com nome seguro pro SO dele.
3. **Disponibilidade da aba**: input malicioso/acidental não pode travar ou explorar a página.

**Inversão da regra zero da família:** sem servidor, "nunca confiar no frontend" vira "**o frontend é tudo — então nada pode sair dele**". A mitigação de exfiltração não é validação de request: é a **ausência estrutural de rede** (CSP sem origem externa + zero fetch no código + vendors locais).

## Mitigação por camada

| Ameaça | Mitigação | Onde |
|---|---|---|
| Exfiltração de conteúdo | CSP `default-src 'none'` + `connect-src 'self'` (sem fetch no código); sem CDN/webfont/analytics | `index.html`, revisão de PR |
| Upload-spoof (arquivo mascarado de PDF) | Magic bytes `%PDF-` nos primeiros 1024 bytes ANTES de qualquer parse; mime/extensão não bastam | `core.looksLikePdf` |
| PDF malformado/cifrado explorando o parser | `PDFDocument.load` sempre em try/catch; cifrado → recusa amigável (`/encrypt/i`); corrompido → recusa; nunca `ignoreEncryption` | `app.js processEntry` |
| Path traversal / nome hostil no download e no ZIP | `core.sanitizeFilename`: remove control chars (`\u0000`–`\u001F`, `\u007F`), `<>:"/\|?*`, barra/backslash, dotfile, trailing dot/space, reservados Windows (CON, PRN, AUX, NUL, COM1-9, LPT1-9), teto 80 chars, fallback | `core.sanitizeFilename` + testes |
| XSS via nome de arquivo/parte | **Zero `innerHTML`** no repo (regra absoluta, auditável por `grep -r innerHTML js/`); só `textContent`/`el()`/clone de `<template>` | `app.js` |
| ReDoS (CWE-1333) | Regex de intervalo linear (sem backtracking catastrófico) + teto de 2000 chars no input do parser | `core.parseRangeList` + teste de input gigante |
| Recursão descontrolada (CWE-674) | Nenhuma função recursa sobre input (tudo iterativo) | `core.js` |
| Null deref (CWE-476) travando handler | `if (node)` após todo `getElementById` pós-render; `find()` checado | `app.js` |
| Vazamento pra storage | `localStorage` só com `splitsmart-lang`/`splitsmart-theme`, em try/catch; nunca nome/conteúdo de arquivo | `app.js`, `theme-init.js` |
| Vazamento pra console | Log de erro só com `err.name` — nunca nome/conteúdo do arquivo | `app.js generateAll` |
| Supply-chain dos vendors | Versão pinada + SHA-256 registrado + release ≥ 7 dias (mentalidade `minimumReleaseAge` da família) | [vendor/VENDOR.md](../vendor/VENDOR.md) |
| Perda de trabalho do usuário | `confirm()` no reset + guard `beforeunload` + `preventDefault` de drop fora da zona (browser navegaria pro arquivo) | `app.js` |
| Metadado sensível herdado no output | Documento de saída é novo; título/producer/creator definidos do zero | `app.js generateAll` |

## CSP completa (index.html)

```
default-src 'none';
script-src 'self';
style-src 'self';
img-src 'self' data:;
connect-src 'self';
base-uri 'none';
form-action 'none'
```

Limitações do GitHub Pages (sem headers configuráveis): CSP só via `<meta>` — `frame-ancestors` não funciona em meta (aceito; clickjacking de uma página sem sessão/estado tem impacto ~nulo). TLS/HSTS herdados de `github.io`.

## Fora de escopo (honestidade do modelo)

- Browser/SO comprometido do usuário (extensão maliciosa lê o DOM — nenhum site escapa disso).
- O que o usuário faz com as partes depois de baixar.
- DoS da própria aba com arquivo gigante — custo é local do usuário; mitigado com aviso (> 150 MB), não bloqueio.

## Checklist pra toda mudança (espelha CLAUDE.md §7)

- Nova entrada de dado do usuário → validação em `core.js` + teste junto (golden path + erro).
- Novo download → `sanitizeFilename` + dedupe.
- Nova string → i18n nas duas línguas + gate.
- Zero rede nova, CSP intacta, zero `innerHTML` (grep antes de fechar).
