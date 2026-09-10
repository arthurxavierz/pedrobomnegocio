# Pedro Bom Negócio

Site institucional estático da pré-candidatura de Pedro Bom Negócio (Patrocínio, Minas Gerais).

**Stack:** HTML + CSS + JS puros. Sem build step, sem dependências, sem backend.

## Estrutura

```
netlify.toml          configuração de deploy (headers, cache, redirects, 404)
dist/                 diretório publicado
├── index.html        página inicial
├── propostas.html    propostas detalhadas
├── sobre.html        história de Pedro
├── participe.html    formulário que abre o WhatsApp
├── 404.html          página de erro
├── robots.txt        liberação para buscadores
├── sitemap.xml       mapa do site
├── styles.css        identidade visual e responsividade
├── script.js         animações, interações e SITE_CONFIG
├── analytics.js      Google Analytics 4 (inativo até preencher o ID)
└── assets/           favicon e imagem de compartilhamento
```

## Rodar localmente

Não precisa instalar nada. Abra `dist/index.html` com a extensão **Live Server** do VS Code, ou:

```bash
npx serve dist
```

## Configuração da campanha

Tudo o que precisa ser preenchido está no topo de `dist/script.js`:

```js
const SITE_CONFIG = {
  whatsappNumber: '',     // 55 + DDD + número, só dígitos. Ex.: '5534999999999'
  whatsappGroupUrl: ''    // link chat.whatsapp.com do grupo oficial
};
```

- **`whatsappNumber` vazio:** o formulário ainda funciona — abre o WhatsApp com a mensagem
  pronta e deixa o visitante escolher o destinatário. Preencher é o comportamento desejado.
- **`whatsappGroupUrl` vazio:** o botão "Entrar no grupo" exibe um aviso de que o convite
  ainda será divulgado, em vez de quebrar.

O Google Analytics fica desligado (nenhum cookie criado) até você colar o ID em
`dist/analytics.js`.

## Deploy

Ver [DEPLOY.md](DEPLOY.md).
