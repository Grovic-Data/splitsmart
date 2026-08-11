<div align="center">

# ✂️ SplitSMART

**Divida PDFs em partes com nome — 100% no seu navegador.**

![GitHub Pages](https://img.shields.io/badge/deploy-GitHub%20Pages-4E32A8)
![Vanilla JS](https://img.shields.io/badge/stack-vanilla%20HTML%2FCSS%2FJS-6E56CF)
![Privacidade](https://img.shields.io/badge/privacidade-nenhum%20upload-8F7EE2)
![i18n](https://img.shields.io/badge/i18n-pt--BR%20%2B%20en-C1BDF6)

</div>

---

Escolha um ou vários PDFs, monte as partes que quiser de cada um (ex.: páginas **1–10** viram *Anatomia*, **15–30** viram *Gamers*, **40–45** viram *Faculdade*) e baixe cada parte pronta — uma a uma ou tudo num `.zip`.

> 🔒 **Seus arquivos nunca saem do seu computador.** Todo o processamento acontece dentro do navegador (via [pdf-lib](https://pdf-lib.js.org/)). Nada é enviado a servidor nenhum — o site é 100% estático.

## Como usar

1. **Escolha os PDFs** — arraste pra área pontilhada ou clique pra escolher (vários de uma vez).
2. **Monte as partes** — pra cada PDF, defina nome + página inicial + página final de cada parte. Dica: use *"Criar várias partes de uma vez"* e digite `1-10, 15-30, 40-45`.
3. **Divida e baixe** — clique em **Dividir tudo** e baixe cada parte, ou tudo junto em `.zip`.

Intervalos podem pular páginas e até se sobrepor. O app fala **português** e **inglês** (botão no topo) e tem tema claro/escuro.

## Publicar no GitHub Pages (passo a passo)

Não precisa de hospedagem nem de saber programar:

1. Crie uma conta no [github.com](https://github.com) (se ainda não tiver).
2. Crie um repositório novo (ex.: `splitsmart`), público.
3. Envie **todos os arquivos desta pasta** pro repositório (botão *Add file → Upload files*, ou `git push`).
4. No repositório: **Settings → Pages → Build and deployment → Deploy from a branch** → branch `main`, pasta `/ (root)` → **Save**.
5. Aguarde ~1 minuto. Seu app estará em `https://SEU-USUARIO.github.io/splitsmart/`.

Toda atualização futura = enviar os arquivos de novo pra `main`. O arquivo `.nojekyll` já está incluído (necessário pro Pages servir tudo como está).

## Rodar no seu computador (desenvolvimento)

Por causa da política de segurança (CSP), abra por um servidor local — não por duplo clique:

```bash
python -m http.server 8080
# → http://localhost:8080
```

(ou a extensão *Live Server* do VS Code.)

### Testes e gates

```bash
node tests/run.js                 # suite de testes (Node >= 18, zero dependências)
node scripts/check-i18n-keys.mjs  # valida i18n (simetria pt-BR ↔ en + resolução de chaves)
```

## Estrutura

```
index.html            página única (CSP estrita via <meta>)
css/styles.css        tokens da paleta Grovic · tema claro/escuro
js/core.js            funções puras (validação, sanitização, parser) — testadas
js/app.js             estado + interface
js/i18n.js            dicionários pt-BR + en
js/theme-init.js      anti-flash de tema
vendor/               pdf-lib + JSZip pinados (versões e SHA-256 em VENDOR.md)
tests/  scripts/      suite zero-dep + gate de i18n
Docs/                 documentação viva (arquitetura, segurança)
```

## Segurança (resumo)

- Nenhum dado sai do browser; sem analytics, sem CDN em runtime, sem cookies.
- CSP estrita (`default-src 'none'` + `'self'`), zero script/style inline.
- Arquivo validado por **magic bytes** `%PDF-` antes de qualquer parse; PDF com senha é recusado com aviso.
- Nomes de parte sanitizados (seguros pra Windows/macOS/Linux) antes de virarem arquivo.
- Bibliotecas vendoradas com versão pinada e hash registrado — modelo completo em [Docs/security.md](Docs/security.md).

---

<div align="center">Projeto da família <strong>Grovic</strong> · irmão do ProntuSMART</div>
