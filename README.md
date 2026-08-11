<div align="center">

# ✂️ SplitSMART

**Divida PDFs em partes com nome — 100% no seu navegador.**

🌐 **[splitsmart.grovicdata.com](https://splitsmart.grovicdata.com)**

![GitHub Pages](https://img.shields.io/badge/deploy-GitHub%20Pages-4E32A8)
![Vanilla JS](https://img.shields.io/badge/stack-vanilla%20HTML%2FCSS%2FJS-6E56CF)
![Privacidade](https://img.shields.io/badge/privacidade-nenhum%20upload-8F7EE2)
![i18n](https://img.shields.io/badge/i18n-pt--BR%20%2B%20en-C1BDF6)

</div>

---

Escolha um ou vários PDFs, monte as partes que quiser de cada um (ex.: páginas **1–10** viram *Anatomia*, **15–30** viram *Gamers*, **40–45** viram *Faculdade*) e baixe cada parte pronta — uma a uma ou tudo num `.zip`.

> 🔒 **Seus arquivos nunca saem do seu computador.** Todo o processamento acontece dentro do navegador (via [pdf-lib](https://pdf-lib.js.org/)). Nada é enviado a servidor nenhum — o site é 100% estático, sem analytics, sem cookies, sem CDN em runtime.

## Funcionalidades

- **Vários PDFs de uma vez** — arraste pra área pontilhada ou clique pra escolher.
- **Partes nomeadas** — cada parte tem nome + página inicial + página final; o nome vira o arquivo baixado.
- **Intervalos livres** — podem pular páginas e até se sobrepor (a página 5 pode estar em duas partes).
- **Criação em massa** — digite `1-10, 15-30, 40-45` e as três partes nascem de uma vez. Aceita `1 a 10`, `2 até 5` e página solta (`7`).
- **Validação na hora** — erro de intervalo aparece na própria linha, antes de gerar qualquer coisa.
- **Download individual ou ZIP** — com vários PDFs, o `.zip` organiza uma pasta por PDF de origem.
- **Bilíngue** — português (padrão) e inglês, botão no topo.
- **Tema claro/escuro** — segue o sistema, com toggle manual que persiste.
- **Acessível** — navegação por teclado, `aria-live` nos status, alvos de toque confortáveis no celular.
- **Mobile-first** — funciona em tela de 360px pra cima, sem zoom forçado no iOS.

## Como usar

1. **Escolha os PDFs** — arraste pra área pontilhada ou toque pra escolher (vários de uma vez).
2. **Monte as partes** — pra cada PDF, defina nome + página inicial + página final de cada parte. Dica: use *"Criar várias partes de uma vez"* e digite `1-10, 15-30, 40-45`.
3. **Divida e baixe** — toque em **Dividir tudo** e baixe cada parte, ou tudo junto em `.zip`.

PDFs protegidos por senha são recusados com aviso (o app não tenta quebrar proteção). Arquivos muito grandes (>150 MB) funcionam, só com aviso de lentidão.

## Privacidade e segurança

Privacidade aqui **é a arquitetura**, não uma feature:

| Garantia | Como |
|---|---|
| Nenhum byte do PDF sai do browser | Não existe servidor; processamento todo em memória via pdf-lib |
| Sem rastreamento | Zero analytics, zero cookies, zero webfont/CDN externo |
| CSP estrita | `default-src 'none'` + `'self'` via `<meta>`; zero script/style inline |
| Arquivo validado de verdade | Magic bytes `%PDF-` checados antes de qualquer parse (extensão não basta) |
| Nomes de arquivo seguros | Sanitização Windows/macOS/Linux (chars proibidos, nomes reservados, 80 chars) |
| PDF de saída limpo | Não herda metadados do original (título/producer novos) |
| Dependências auditáveis | pdf-lib + JSZip vendorados, versão pinada + SHA-256 em [vendor/VENDOR.md](vendor/VENDOR.md) |
| localStorage mínimo | Só tema e idioma — nunca nome ou conteúdo de arquivo |

Modelo de ameaça completo em [Docs/security.md](Docs/security.md).

## Rodar localmente

Não tem build, não tem `npm install` — é servir os arquivos:

```bash
python -m http.server 8080
# → http://localhost:8080
```

(ou a extensão *Live Server* do VS Code.) Abrir por duplo clique (`file://`) quebra por causa da CSP — use servidor local.

### Testes e gates

```bash
node tests/run.js                 # suite de testes (Node >= 18, zero dependências)
node scripts/check-i18n-keys.mjs  # valida i18n (simetria pt-BR ↔ en + resolução de chaves)
```

## Arquitetura

```text
index.html            página única (CSP estrita via <meta>, templates SVG)
css/styles.css        tokens da paleta Grovic · tema claro/escuro (3 estados)
js/theme-init.js      aplica tema salvo antes do 1º paint (anti-flash)
js/core.js            funções puras (validação, sanitização, parser de intervalos) — testadas em Node
js/app.js             estado + render + orquestração pdf-lib/JSZip (zero innerHTML)
js/i18n.js            dicionários pt-BR + en (chaves simétricas)
vendor/               pdf-lib 1.17.1 + JSZip 3.10.1 pinados (SHA-256 em VENDOR.md)
tests/                runner zero-dep + suites de core e i18n
scripts/              gate de i18n
Docs/                 documentação viva (arquitetura, segurança)
```

Princípios: lógica de dado mora em `core.js` (puro, testado); `app.js` fica fino (DOM + orquestração); toda string visível passa pelo i18n; cores só via tokens do CSS. Detalhe em [Docs/architecture.md](Docs/architecture.md).

## Deploy

O site vive em **[splitsmart.grovicdata.com](https://splitsmart.grovicdata.com)** — GitHub Pages servindo direto da branch `main` (raiz), com domínio custom via arquivo [CNAME](CNAME). Deploy = push pra `main`; não há CI obrigatório (gates rodam localmente).

Quer hospedar sua própria cópia? Fork → Settings → Pages → *Deploy from a branch* → `main` + `/ (root)`. O `.nojekyll` já está incluído; todos os paths são relativos, então funciona em subpath (`usuario.github.io/splitsmart/`).

---

<div align="center">Projeto da família <strong>Grovic</strong> · irmão do <a href="https://prontusmart.grovicdata.com">ProntuSMART</a> e do <a href="https://valerium.grovicdata.com">Valerium</a></div>
