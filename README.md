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
├── gerador.html      gerador de fotos com a moldura da campanha
├── participe.html    formulário que abre o WhatsApp
├── 404.html          página de erro
├── robots.txt        liberação para buscadores
├── sitemap.xml       mapa do site
├── styles.css        identidade visual e responsividade
├── script.js         animações, interações e SITE_CONFIG
├── gerador.css       estilos da aba do gerador (só ela carrega)
├── gerador.js        motor de composição em canvas
├── gerador-campanha.js   molduras, cores e dados do candidato
├── analytics.js      Google Analytics 4 (inativo até preencher o ID)
└── assets/           favicon e imagem de compartilhamento
```

## Gerador de fotos

A aba `/gerador` deixa o apoiador escolher uma foto do aparelho, ajustar dentro
da moldura da campanha e baixar a arte pronta em 1080×1080, 1080×1440 ou
1080×1920. Não existe back-end nem upload: a montagem acontece no navegador do
próprio apoiador, então nenhuma imagem sai do aparelho e nenhum dado pessoal é
armazenado.

As molduras não são arquivos de imagem. Elas são desenhadas no canvas a partir
dos tokens de `dist/gerador-campanha.js` (cores, textura, formato da janela,
selo e assinatura), o que traz três vantagens: a mesma moldura sai nítida em
qualquer formato, criar uma moldura nova é acrescentar um objeto na lista, e
reaproveitar o gerador em outra campanha é editar um único arquivo.

Para mexer nas molduras, abra `dist/gerador-campanha.js`:

```js
{
  id: '01',
  nome: 'MOVIMENTO',
  fundo: ['#2f44ad', '#151f61'],   // degradê do fundo
  textura: 'grade',                // grade | pontos | anel | listras | nenhuma
  janela: 'circulo',               // circulo | arco | janela
  canto: ['#ffd02f', '#00ad63'],   // faixa diagonal do rodapé
  selo:  { texto, fundo, tinta, borda },
  placa: { fundo, cargoFundo, cargoTinta, nome, destaque,
           numeroFundo, numeroTinta, numeroSombra, assinatura, risco }
}
```

A assinatura se dimensiona sozinha a partir do texto: nome mais longo reduz a
fonte em vez de estourar a arte. O "P" da marca é desenhado a partir do mesmo
caminho SVG usado no cabeçalho do site.

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
