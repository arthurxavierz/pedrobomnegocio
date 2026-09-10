# Deploy — Pedro Bom Negócio

Padrão Achilles Media: **GitHub → Netlify → Cloudflare DNS**.
Supabase não é usado neste projeto (o formulário abre o WhatsApp, não grava nada).

Domínio provisório: `pedrobomnegocio.achillesmedia.com.br`
Domínio definitivo (quando validado): `pedrobomnegocio.com.br`

---

## 1. GitHub

```bash
git remote add origin https://github.com/arthurxavierz/pedrobomnegocio.git
git push -u origin main
```

O `git init` e o commit inicial já estão feitos. Repositório **privado** até a
validação do candidato.

---

## 2. Netlify

1. **Add new site → Import an existing project → GitHub** → selecione o repositório.
2. As configurações de build vêm do `netlify.toml` — não altere no painel:
   - Build command: *(vazio)*
   - Publish directory: `dist`
3. Deploy. O site sobe em `<nome-aleatorio>.netlify.app`.
4. **Site settings → General → Site name:** renomeie para `pedro-bom-negocio`
   (fica `pedro-bom-negocio.netlify.app` — use esse nome no CNAME abaixo).

O `netlify.toml` já entrega:
- headers de segurança (HSTS, nosniff, frame-options, permissions-policy);
- cache imutável em `/assets/*` e revalidação em HTML (deploy novo aparece na hora);
- URLs limpas (`/propostas` serve `/propostas.html`);
- `404.html` como página de erro.

---

## 3. Cloudflare (DNS)

Na zona `achillesmedia.com.br`:

| Tipo  | Nome              | Conteúdo                        | Proxy                 |
|-------|-------------------|---------------------------------|-----------------------|
| CNAME | `pedrobomnegocio` | `pedro-bom-negocio.netlify.app` | **DNS only** ☁️ cinza |

> **Importante:** deixe o proxy **desligado** (nuvem cinza). Com o proxy laranja, o
> Netlify não consegue emitir/renovar o certificado Let's Encrypt e o site cai em
> erro de SSL. O Netlify já entrega CDN e HTTPS próprios.

Depois, no Netlify: **Domain management → Add a domain** → `pedrobomnegocio.achillesmedia.com.br`
→ aguarde o certificado (alguns minutos) → **Force HTTPS**.

---

## 4. Quando comprar o domínio definitivo

1. Aponte `pedrobomnegocio.com.br` para o Cloudflare (nameservers no registro.br).
2. Na zona nova, crie:
   - `CNAME  www  pedro-bom-negocio.netlify.app`  (DNS only)
   - `CNAME  @    pedro-bom-negocio.netlify.app`  (DNS only — o Cloudflare resolve o
     CNAME flattening na raiz automaticamente)
3. No Netlify, defina `pedrobomnegocio.com.br` como **primary domain** e mantenha o
   subdomínio provisório como alias (o Netlify redireciona sozinho).
4. **No código, troque o domínio de uma vez só:**
   ```bash
   # do diretório do projeto
   grep -rl "pedrobomnegocio.achillesmedia.com.br" dist/ | \
     xargs sed -i 's|pedrobomnegocio.achillesmedia.com.br|pedrobomnegocio.com.br|g'
   ```
   Isso atualiza `canonical`, `og:url`, `og:image`, `robots.txt` e `sitemap.xml`.

---

## Pendências antes de divulgar

- [ ] Preencher `SITE_CONFIG.whatsappNumber` em `dist/script.js`.
- [ ] Preencher `SITE_CONFIG.whatsappGroupUrl` quando o grupo existir.
- [ ] Preencher `GA_MEASUREMENT_ID` em `dist/analytics.js` (property GA4 deste site).
- [ ] Criar `dist/assets/og-pedro-bom-negocio.jpg` (1200×630) — a imagem de
      compartilhamento já está referenciada em todas as páginas, mas o arquivo
      ainda não existe.
- [ ] Substituir os `image-slot` (espaços reservados de foto) por imagens oficiais
      de Pedro nas páginas Início e Quem é Pedro.
- [ ] Confirmar com o jurídico da campanha se o rodapé precisa exibir CNPJ da
      campanha / número de registro da candidatura (exigência da legislação eleitoral).
