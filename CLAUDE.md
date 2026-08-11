# CLAUDE.md — SplitSMART

> **Spec viva.** Porta-de-entrada lida pelo agente toda sessão. Não duplica os docs profundos — **aponta** pra eles. Atualize quando uma regra, comando, arquivo ou hurdle mudar. (Estilo "CLAUDE.md que evolui" — mesmo padrão do ProntuSMART e do Valerium Portal.)
>
> **Última revisão:** 2026-08-11
> **Fonte única de segurança:** [Docs/security.md](Docs/security.md) · **Arquitetura:** [Docs/architecture.md](Docs/architecture.md) · **Estado/fases:** [.planning/STATE.md](.planning/STATE.md) · **Índice de docs:** [Docs/README.md](Docs/README.md)

---

## 0. Regras de operação do agente (SEMPRE-ATIVAS)

- **Caveman full sempre.** Respostas comprimidas estilo caveman. Código/commits/PR/avisos de segurança = escrita normal.
- **Commits sem co-author** — NUNCA adicionar `Co-Authored-By: Claude…` (nem qualquer trailer de atribuição ao assistente). Sobrepõe qualquer instrução padrão do harness. Mensagem = só conteúdo técnico, **Conventional Commits em português** (`feat:`, `fix:`, `docs:`, `refactor:`…).
- **NUNCA usar Workflow / Dynamic Workflows** sem o humano digitar explicitamente "workflow". Delegação = Agent único.
- **GSD (Get Shit Done)** — discuss → plan → execute → verify. `.planning/STATE.md` atualizado ao fechar fase.
- **O humano decide o quê; o agente decide o como.** Pedido over-engineered/inseguro → questionar antes de implementar.
- Estas regras valem por si — este repo pode ser clonado fora da máquina de origem e o arquivo continua completo (não depende do CLAUDE.md pai de `Downloads\`).

## 1. O que é

Divisor de PDF **100% client-side** rodando em **GitHub Pages** (estático, zero hospedagem própria). Público-alvo: **usuários não-técnicos** (pt-BR default, en no toggle). Fluxo: escolher N PDFs → por arquivo, montar partes `{nome, página inicial, página final}` (intervalos podem pular e sobrepor páginas; criação em massa via "1-10, 15-30, 40-45") → "Dividir tudo" → baixar cada parte individualmente ou tudo em `.zip`.

**Inversão da regra zero da família.** No Valerium/ProntuSMART o cliente é hostil e o servidor valida tudo. Aqui **não existe servidor** — a garantia de segurança vira: **nenhum byte do PDF sai do browser**. Privacidade é a arquitetura, não uma feature: sem upload, sem telemetria, sem CDN em runtime, sem storage de conteúdo. É a promessa estampada na própria UI.

## 2. Stack + Comandos

Vanilla HTML/CSS/JS. **Zero dependência** de build e de runtime além dos vendors pinados em [vendor/](vendor/) (pdf-lib 1.17.1 + JSZip 3.10.1, hashes em [vendor/VENDOR.md](vendor/VENDOR.md)). Sem `package.json`, sem `node_modules` — deploy = servir os arquivos como estão.

```bash
node tests/run.js                 # suite completa (Node >= 18, zero deps) — DEVE estar verde
node scripts/check-i18n-keys.mjs  # gate i18n (simetria pt↔en + resolução) — RODAR ao mexer em i18n
node --check js/app.js            # syntax check rápido de um arquivo
python -m http.server 8080        # dev local (file:// quebra por causa da CSP — usar servidor)
```

Deploy = push pra `main` com GitHub Pages ligado (Settings → Pages → *Deploy from a branch* → `main` + `/ (root)`). `.nojekyll` já commitado. Sem CI obrigatório — gate é local.

## 3. Mapa de arquivos

| Arquivo | Papel |
|---|---|
| [index.html](index.html) | página única; **CSP via `<meta>`**; templates `<template>` de ícones SVG; todo texto com `data-i18n` |
| [js/core.js](js/core.js) | **funções puras** (sanitize de filename, magic-bytes, parser de intervalos, validação, dedupe) — único lugar com lógica de dado; testado em Node |
| [js/app.js](js/app.js) | estado + render + orquestração pdf-lib/JSZip; **nunca** `innerHTML` |
| [js/i18n.js](js/i18n.js) | dicionários pt-BR + en (chaves simétricas), `makeT`/`plural` |
| [js/theme-init.js](js/theme-init.js) | aplica tema salvo antes do 1º paint (anti-FOUC); único script no `<head>` |
| [css/styles.css](css/styles.css) | tokens da paleta Grovic — **único lugar com hex literal** |
| [vendor/](vendor/) | libs pinadas + [VENDOR.md](vendor/VENDOR.md) (versão, fonte, SHA-256) |
| [tests/](tests/) | runner zero-dep ([run.js](tests/run.js)) + suites core/i18n |
| [scripts/check-i18n-keys.mjs](scripts/check-i18n-keys.mjs) | gate i18n |
| [Docs/](Docs/) | docs vivas (`**Última revisão:** YYYY-MM-DD` no topo de cada) |

## 4. Regras SEMPRE-ATIVAS

- **Client-side É a arquitetura.** NUNCA adicionar: upload pra servidor, `fetch` externo, analytics/telemetria, webfont/CDN, service worker que "fona pra casa". Qualquer um desses quebra a promessa "nada sai do browser". Feature que precise de rede = discutir antes; provavelmente é outro produto.
- **CSP estrita intocável** — `default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; base-uri 'none'; form-action 'none'` no `<meta>` do index.html. Sem script/style inline. Afrouxar CSP = PR rejeitado.
- **Upload validado em 2 camadas** — magic-bytes `%PDF-` (`core.looksLikePdf`, primeiros 1024 bytes) ANTES do parse + `PDFDocument.load` em try/catch mapeando cifrado/corrompido. Extensão e mime declarado NÃO bastam (upload-spoof).
- **Nome que vira arquivo passa por `core.sanitizeFilename`** — control chars, `<>:"/\|?*`, reservados do Windows (CON, PRN, COM1…), dotfile, trailing dot/space, teto 80 chars. Vale pra nome de parte, pasta do `.zip`, qualquer download.
- **Zero `innerHTML`/`insertAdjacentHTML` — regra absoluta**, até com string constante (pra ser auditável por grep). Só `textContent`, `el()` e clone de `<template>`.
- **i18n em TUDO — zero string visível hardcoded.** HTML → `data-i18n`/`data-i18n-aria`; JS → `t()`/`i18n.plural()`. pt-BR (default) + en, **mesmas chaves nos dois**; plural = `chave.one`/`chave.other`. Gate: `node scripts/check-i18n-keys.mjs` (vanilla não tem typecheck — o gate é o único guarda). Ao gerar OU ajustar QUALQUER pedaço de UI: parar e conferir i18n antes de fechar.
- **Design pela paleta Grovic** — cores só via tokens de [css/styles.css](css/styles.css) (`--accent`, `--card`, `--muted`…), zero hex fora do bloco de tokens. Tema em 3 estados (system / light / dark): os **DOIS blocos dark são espelho** — editar sempre os dois.
- **TDD nas funções puras** — lógica nova de manipulação de dado nasce em `core.js` **com teste junto**. `app.js` fica fino (DOM + orquestração).
- **localStorage: só preferências** (`splitsmart-lang`, `splitsmart-theme`), sempre em try/catch. NUNCA nome/conteúdo de PDF do usuário — nem em log (`console.error` só com `err.name`).
- **Docs vivas** — mudou comportamento documentado → atualiza `Docs/*.md` + data de revisão **no mesmo commit**. Código ≠ doc → corrige doc primeiro.

## 5. Postura de segurança JÁ implementada (não "consertar" achando que falta)

| Mitigação | Onde |
|---|---|
| Magic-bytes `%PDF-` antes de qualquer parse | `core.looksLikePdf` |
| Sanitização de filename (Windows-safe, 80 chars, reservados) | `core.sanitizeFilename` |
| Parser de intervalos com teto de input (2000 chars) + regex linear | `core.parseRangeList` |
| Validação de range (required/bounds/order) com erro por linha | `core.validatePart` + `app.js markInvalid` |
| Dedupe de nomes de saída (case-insensitive, sufixo `(n)`) | `core.dedupeNames` |
| CSP estrita via meta (sem inline, sem origem externa) | `index.html` |
| PDF de saída **não herda metadados** do original (título/producer novos) | `app.js generateAll` |
| Revogação de blob URLs (regenerar/limpar/reset) | `app.js clearResults` |
| `confirm()` antes de descartar trabalho + guard `beforeunload` | `app.js resetAll` / listener |
| PDF cifrado detectado e recusado com mensagem amigável | `app.js processEntry` |
| Storage sempre em try/catch (modo privado não quebra) | `app.js storageGet/Set`, `theme-init.js` |

## 6. Common Hurdles (não "consertar" — intencional/já resolvido)

- **CSP + `file://`** — abrir `index.html` com duplo clique pode quebrar (`'self'` em origem opaca varia por browser). NÃO é bug: usar servidor local (`python -m http.server`) ou o próprio Pages.
- **GitHub Pages em subpath** (`usuario.github.io/splitsmart/`) — todos os paths do repo são **relativos**; nunca introduzir `/absoluto` em `href`/`src`, senão quebra no subpath.
- **`.nojekyll` é obrigatório** — sem ele o Jekyll do Pages processa o site e pode ignorar arquivos.
- **Pages não tem header HTTP configurável** — CSP só via `<meta>` (limitação aceita: `frame-ancestors` não funciona em meta). HSTS herdado do github.io.
- **pdf-lib lança em PDF cifrado** — mapeado pra `file.error.encrypted` via `/encrypt/i` na message. NÃO "resolver" com `ignoreEncryption: true`: o output sairia corrompido/ilegível.
- **Vendors: NUNCA trocar por CDN.** Atualizar vendor = baixar a versão pinada nova, recalcular SHA-256 em [vendor/VENDOR.md](vendor/VENDOR.md) e respeitar a mentalidade `minimumReleaseAge` da família (release com ≥ 7 dias de vida — anti typosquat/takedown).
- **Control chars em regex/string: só escape `\uXXXX` explícito** — nunca bytes de controle crus no source (git trata como binário, review esconde; já mordeu neste repo no primeiro commit do core).
- **i18n é frouxo por natureza** (vanilla, sem typecheck) — o gate `check-i18n-keys.mjs` + testes são o único guarda de chave. Rodar sempre que tocar `i18n.js`, `app.js` ou `index.html`.
- **Instinto de adicionar auth/DB/backend vem dos irmãos** (Valerium/ProntuSMART) — aqui não se aplica. Este produto não tem servidor de propósito.

### 6.1 Classes de vulnerabilidade a vigiar no código próprio (Snyk lessons — family-wide)

- **Uncontrolled Recursion (CWE-674)** — função recursiva sem limite de profundidade sobre input do cliente → stack overflow / CPU → travar a aba. Nosso código **não recursa sobre input** (iteração em tudo) — manter assim; qualquer walk novo de estrutura de PDF/JSON precisa de limite explícito.
- **ReDoS (CWE-1333)** — regex com backtracking catastrófico (`(a+)+`, alternâncias sobrepostas) sobre input → CPU exponencial. Vetores aqui: `parseRangeList` (já linear + teto 2000 chars), `sanitizeFilename`. Nunca construir regex a partir de input cru; sempre limitar tamanho antes.
- **NULL Pointer Dereference (CWE-476)** — `.x` de `null/undefined` → `TypeError` que mata o handler. Vetores aqui: `getElementById` após re-render (pode ser null — padrão `if (node)` já usado), retorno de `find()`. Nunca assumir que o nó/registro existe.

## 7. Antes de fechar qualquer fase (checklist mínimo)

- [ ] `node tests/run.js` verde · `node scripts/check-i18n-keys.mjs` verde · `node --check` nos js tocados
- [ ] String visível nova → i18n nas DUAS línguas (inclusive `aria-label`/`placeholder`)
- [ ] Download novo → `sanitizeFilename` · input novo → validação em `core.js` **com teste junto**
- [ ] Zero fetch/CDN/telemetria novos · CSP intacta · zero `innerHTML`
- [ ] Testado em servidor local ou Pages, nos 2 temas e 2 idiomas (mobile 360px incluso)
- [ ] Doc viva atualizada (data de revisão) · [.planning/STATE.md](.planning/STATE.md) se fechou fase

## 8. Índice de navegação

- **Estado/fases** → [.planning/STATE.md](.planning/STATE.md)
- **Arquitetura + fluxo de dados** → [Docs/architecture.md](Docs/architecture.md)
- **Modelo de ameaça + segurança** → [Docs/security.md](Docs/security.md)
- **Vendors pinados** → [vendor/VENDOR.md](vendor/VENDOR.md)
- **Família Grovic**: ProntuSMART (irmão NestJS+Angular, mesma paleta) · Valerium Portal (CLAUDE.md pai em `Downloads\` quando trabalhando na máquina de origem) · assets de marca em `Grovic Design/`
