# STATE — SplitSMART

**Última revisão:** 2026-08-11

## Fase atual

**Fase 1 — MVP completo: CONCLUÍDA (2026-08-11)**

**Publicado (2026-08-11):** repo [github.com/G2Martins/splitsmart](https://github.com/G2Martins/splitsmart) (público) · live em **<https://g2martins.github.io/splitsmart/>** (Pages, branch `main` + `/ (root)`).

Entregue:
- App single-page vanilla (index + core/app/i18n/theme-init + styles) com CSP estrita.
- Upload multi-PDF (drag&drop + picker), magic-bytes, tratamento cifrado/corrompido.
- Editor de partes por arquivo: nome + intervalo, validação in-line, criação em massa ("1-10, 15-30, 40-45"), dedupe de nomes.
- Geração via pdf-lib (documento novo, sem metadado herdado), download individual + ZIP (JSZip, pasta por PDF quando múltiplos).
- i18n pt-BR + en (57 chaves simétricas) + gate `scripts/check-i18n-keys.mjs`.
- Tema claro/escuro (3 estados, paleta Grovic) + a11y (aria-live, labels, focus, reduced-motion).
- Testes: 35 casos zero-dep (`node tests/run.js`) — verdes.
- Governança: CLAUDE.md (padrão família §0–§8), Docs/ (architecture, security), vendor/VENDOR.md.

## Próximas fases (backlog, por ordem sugerida)

- [ ] **Fase 2 — Preview de páginas** (pdf.js vendorado ~2 MB): thumbnail da 1ª página de cada intervalo pra conferência visual. Avaliar custo/benefício do peso.
- [ ] **Fase 3 — PWA offline**: manifest + service worker *sem rede* (só cache local) pra instalar no celular. Cuidado: SW não pode violar a regra "zero fetch externo".
- [ ] Favicon .ico multi-size gerado da marca (hoje: SVG data-URI).
- [ ] Reordenar partes (drag ou botões ↑↓) — hoje a ordem é a de criação.
- [ ] Mesclar PDFs (produto irmão dentro do mesmo app? discutir escopo antes).
- [ ] CI opcional (GitHub Actions: `node tests/run.js` + gate i18n em PR) — gate hoje é local por decisão.

## Decisões travadas

- Sem backend, pra sempre — é o produto (ver CLAUDE.md §1/§4).
- Sem CDN em runtime; vendors pinados.
- pt-BR default; en no toggle.
