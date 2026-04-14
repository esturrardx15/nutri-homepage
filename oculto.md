# 🔐 MaiaNutri - Documentação Técnica Interna

**⚠️ ARQUIVO CONFIDENCIAL - NÃO FAZER PUSH PARA GIT**

Este documento contém instruções detalhadas para customização e manutenção do projeto MaiaNutri, incluindo localização de arquivos, como alterar imagens, cores, textos e configurações sensíveis.

---

## Descrição Geral

O MaiaNutri é uma plataforma web para nutricionista especializada, com arquitetura moderna separada em Frontend (HTML/CSS/JS) e Backend (Google Apps Script). Este documento guia o desenvolvedor através de todas as customizações necessárias.

**Stack Tecnológico:**
- **Frontend**: HTML5, CSS3, JavaScript Vanilla
- **Backend**: Google Apps Script (serverless)
- **Dados**: Google Sheets
- **Hospedagem**: Vercel
- **Versionamento**: Git + GitHub

---

# 🛠️ GUIA DE CUSTOMIZAÇÃO PRÁTICO

## 1️⃣ MUDAR CORES DO TEMA

### Localização: `src/css/styles.css`

**Passo 1**: Abra o arquivo `styles.css`

**Passo 2**: Procure pela seção de variáveis CSS (início do arquivo):

```css
:root {
  --color-dark-green: #2D5C32;      /* Verde escuro - títulos, footer */
  --color-medium-green: #4F7D48;    /* Verde médio - botões, links */
  --color-light-green: #A8C498;     /* Verde claro - backgrounds */
  --color-beige: #F5F0E6;           /* Bege - fundo principal */
  --color-white: #FFFFFF;           /* Branco - textos em escuro */
}
```

**Passo 3**: Use uma ferramenta de cores
- [Color Picker](https://htmlcolorcodes.com) - Gera códigos hex
- [Colordot](https://color.hailpixel.com) - Visualiza paletas

**Passo 4**: Substitua os valores hex conforme desejar

**Exemplo - Alterar para tons mais quentes:**
```css
:root {
  --color-dark-green: #8B4513;      /* Terra escura */
  --color-medium-green: #CD853F;    /* Peru */
  --color-light-green: #DEB887;     /* Burlywood */
  --color-beige: #FFF8DC;           /* Cornsilk */
  --color-white: #FFFFFF;
}
```

**Passo 5**: Salve (`Ctrl + S`) - as mudanças refletem em tempo real se usar Live Server

### Cores por componente:

| Componente | Arquivo | Observação |
|-----------|---------|-----------|
| Navegação | `styles.css` + `homepage.css` | Fundo: `--color-dark-green` |
| Botões | `styles.css` | Background: `--color-medium-green` |
| Cards de Serviço | `servicos.css` | Bordas: `--color-light-green` |
| Hero Image | `homepage.css` | Overlay: ajustar opacity |
| Footer | `styles.css` | Background: `--color-dark-green` |

---

## 2️⃣ ALTERAR IMAGENS

### Estrutura de Pastas: `img/`

```
img/
├── baner.jpg          # Hero image da homepage
├── servicos/
│   ├── consultoria.jpg
│   ├── acompanhamento.jpg
│   └── ...
├── blog/
│   └── posts/
│       ├── post-1.jpg
│       └── post-2.jpg
└── icones/
    ├── facebook.svg
    └── instagram.svg
```

### Substituir Imagem Principal (Hero Banner)

**Arquivo**: `src/html/homepage.html`

1. Procure por:
```html
<section class="hero" style="background-image: url('../../img/baner.jpg')">
```

2. Substitua `../../img/baner.jpg` pela sua nova imagem:
   - Salve a imagem em `img/` com nome descritivo
   - Atualize o caminho no HTML
   
3. **Tamanho recomendado**: 1920x600px (otimizado para web)

### Alterar Logo/Ícone

**Arquivo**: `src/html/homepage.html` (e outras páginas)

Procure por:
```html
<link rel="icon" href="data:image/svg+xml, <svg xmlns='...'><text>🥑</text></svg>">
```

Opções:
- **Trocar emoji**: Substitua `🥑` por outro (ex: `🍎`, `🥗`, `💪`)
- **Usar arquivo**: `href="../../img/favicon.png"` (criar arquivo 32x32px)

### Imagens nos Serviços

**Arquivo**: `src/html/servicos.html`

```html
<div class="service-card">
  <img src="../../img/servicos/consultoria.jpg" alt="Consultoria">
  <h3>Nome do Serviço</h3>
  <!-- ... -->
</div>
```

**Como trocar:**
1. Adicione sua imagem a `img/servicos/`
2. Atualize o atributo `src` com o caminho correto
3. Modifique o `alt` com descrição adequada (importante para SEO/acessibilidade)

### Otimizar Imagens

**Ferramentas recomendadas:**
- [TinyPNG](https://tinypng.com) - Compressão sem perda (máx 100KB)
- [ImageResizer](https://imageresizer.com) - Redimensionar para web
- [SVGO](https://jakearchibald.github.io/svgomg/) - Otimizar SVGs

**Tamanhos recomendados:**
- Hero banner: 1920x600px
- Card de serviço: 400x300px
- Logo: 200x200px
- Ícones: 64x64px

---

## 3️⃣ ALTERAR TEXTOS E CONTEÚDO

### Textos da Homepage

**Arquivo**: `src/html/homepage.html`

```html
<!-- HERO SECTION -->
<h1>Mariah (Maia) Katharine - Nutricionista</h1>
<p class="hero-subtitle">Acompanhamento nutricional personalizado</p>
```

Encontre e substitua os textos diretamente no HTML.

### Alterar Informações Profissionais

Procure no arquivo e atualize:

```html
<!-- Meta tags (importante para SEO) -->
<meta name="description" content="Nutricionista Mariah Katharine (CRN 35446) - Acompanhamento...">

<!-- Schema JSON-LD -->
{
  "name": "Nutricionista Mariah Katharine",
  "priceRange": "$$"
}
```

### Textos dos Serviços

**Arquivo**: `src/html/servicos.html`

```html
<div class="service-card">
  <h3>Nome do Serviço</h3>
  <p>Descrição breve do serviço</p>
  <p class="price">R$ XXX</p>
  <button>Agendar</button>
</div>
```

### Textos do Footer

**Arquivo**: `src/html/homepage.html` (e outras)

```html
<footer>
  <p>&copy; 2026 Mariah Katharine - Nutricionista. Todos os direitos reservados.</p>
  <p>CRN: 35446</p>
  <p>Email: contato@maianutrі.com.br</p>
</footer>
```

**Onde encontrar footer:**
- Procure por `<footer>` ou `class="footer"`
- Atualize nome, CRN, email, telefone, redes sociais

---

## 4️⃣ ALTERAR REDES SOCIAIS E CONTATOS

### Arquivo: `src/html/homepage.html`

Procure por:

```html
<a href="https://instagram.com/maianutrі" target="_blank">
  <i class="fab fa-instagram"></i>
</a>
```

**Substituições necessárias:**

| Rede | Campo | Exemplo |
|------|-------|---------|
| Instagram | `href` | `https://instagram.com/seu-usuario` |
| WhatsApp | `href` | `https://wa.me/5511999999999` |
| Facebook | `href` | `https://facebook.com/seu-pagina` |
| Email | `href` | `mailto:seu-email@domain.com` |
| Telefone | `href` | `tel:+5511999999999` |

**Formato WhatsApp completo:**
```html
<a href="https://wa.me/55XXXXXXXXXXX?text=Olá%20gostaria%20de%20agendar">
  <i class="fab fa-whatsapp"></i> Agendar
</a>
```

---

## 5️⃣ CUSTOMIZAR FORMULÁRIOS

### Arquivo: `src/html/homepage.html` ou `src/html/admin.html`

```html
<form id="contact-form">
  <input type="text" name="nome" placeholder="Seu Nome" required>
  <input type="email" name="email" placeholder="seu@email.com" required>
  <textarea name="mensagem" placeholder="Sua mensagem..."></textarea>
  <button type="submit">Enviar</button>
</form>
```

### Adicionar Novos Campos

1. **Adicione no HTML:**
```html
<input type="tel" name="telefone" placeholder="(11) 99999-9999" required>
<select name="servico" required>
  <option>Selecione um serviço</option>
  <option>Consultoria</option>
  <option>Acompanhamento</option>
</select>
```

2. **Valide no JavaScript** (`src/js/admin.js`):
```javascript
function validarFormulario() {
  const telefone = document.querySelector('[name="telefone"]').value;
  if (!/^\(\d{2}\) \d{4,5}-\d{4}$/.test(telefone)) {
    alert('Telefone inválido');
    return false;
  }
  return true;
}
```

3. **Processe no Apps Script** (`src/apps-script/Codigo.gs`):
```javascript
function enviarFormulario(dados) {
  // Salvar em planilha Google
  const aba = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Contatos');
  aba.appendRow([dados.nome, dados.email, dados.telefone, dados.servico]);
}
```

---

## 6️⃣ CONFIGURAR BLOG DINAMICAMENTE

### Arquivo: `src/js/blog.js`

**URL do API do Apps Script:**

```javascript
const API_CONFIG = {
  BASE_URL: 'https://script.googleapis.com/macros/s/SEU_SCRIPT_ID_AQUI/usercache/latest',
  ENDPOINTS: {
    POSTS: '?action=get-posts',
    POST_DETALHE: (id) => `?action=get-post&id=${id}`,
    SERVICOS: '?action=get-services',
  }
};
```

**Onde obter SEU_SCRIPT_ID_AQUI:**
1. Acesse https://script.google.com
2. Seu projeto MaiaNutri Backend
3. Clique em "Deploy" → "Web deployments"
4. Copie o ID da URL (parte após `/s/` até `/usercopy`)

### Estrutura de Dados - Posts no Google Sheets

**Aba "posts"** deve ter colunas:

```
A: id | B: titulo | C: conteudo | D: tema | E: data | F: status | 
G: likes | H: dislikes | I: img_fundo | J: img_lateral | K: autor
```

**Exemplo de dados:**
```
1 | "5 Alimentos Essenciais" | "Lorem ipsum..." | "Nutrição" | "2026-04-10" | 
"publicado" | 12 | 0 | "https://..." | "https://..." | "Maia"
```

### Filtro de Posts

**Arquivo**: `src/html/blog.html`

```html
<select id="filter-categoria">
  <option value="">Todas</option>
  <option value="Nutrição">Nutrição</option>
  <option value="Receitas">Receitas</option>
  <option value="Bem-estar">Bem-estar</option>
</select>
```

**JavaScript** (`src/js/blog.js`):
```javascript
document.getElementById('filter-categoria').addEventListener('change', (e) => {
  const categoria = e.target.value;
  carregarPosts(categoria);
});
```

---

## 7️⃣ ALTERAR ESTILOS CSS

### Estrutura de CSS

```
src/css/
├── styles.css      # Estilos globais (variáveis, reset)
├── homepage.css    # Específicos da homepage
├── blog.css        # Blog
├── servicos.css    # Serviços
└── admin.css       # Admin
```

### Exemplo - Aumentar Tamanho de Fonte

**Arquivo**: `src/css/styles.css` ou específico

```css
/* Antes */
h1 {
  font-size: 2rem;
}

/* Depois */
h1 {
  font-size: 3rem;
}
```

### Exemplo - Alterar Espaçamento

```css
/* Padding */
.container {
  padding: 20px 40px; /* Antes */
  padding: 40px 80px; /* Depois - maior espaço */
}

/* Margin */
.card {
  margin: 10px;  /* Antes */
  margin: 20px;  /* Depois */
}
```

### Exemplo - Mudar Borda/Sombra

```css
.card {
  border: 1px solid var(--color-light-green);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  
  /* Nova versão com sombra maior */
  border: 2px solid var(--color-medium-green);
  box-shadow: 0 8px 16px rgba(0,0,0,0.15);
}
```

---

## 8️⃣ CONFIGURAR GOOGLE APPS SCRIPT

### Arquivo: `src/apps-script/Codigo.gs`

**Passo 1**: Copie o código para https://script.google.com

**Passo 2**: Configure o ID da planilha

```javascript
// Na linha 15 aprox:
var SHEET_ID = "1em2t4iSeDKBok8Ux6-86_KZdpishuVumjAgajBePgB4";
```

**Como obter SHEET_ID:**
1. Abra sua planilha em Google Sheets
2. Copie da URL: `docs.google.com/spreadsheets/d/ESTE_ID_AQUI/edit`
3. Cole em `SHEET_ID`

**Passo 3**: Alterar Nome das Abas

```javascript
var ABA_POSTS = 'posts';      // Mude se sua aba tem outro nome
var ABA_CONFIG = 'config';    // Mude se sua aba tem outro nome
```

**Passo 4**: Deploy

1. Clique em "Deploy" → "New deployment"
2. Type: "Web app"
3. Execute as: sua conta
4. Grant access: "Anyone"
5. Copy URL e salve em segurança

---

## 9️⃣ ADICIONAR NOVAS PÁGINAS

### Passo 1: Criar arquivo HTML

Crie `src/html/nova-pagina.html`:

```html
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nova Página - MaiaNutri</title>
    <link rel="stylesheet" href="../css/styles.css">
    <link rel="stylesheet" href="../css/nova-pagina.css">
</head>
<body>
    <!-- Copie a navegação de outro arquivo -->
    <nav><!-- navigation aqui --></nav>
    
    <!-- Seu conteúdo -->
    <main>
        <h1>Conteúdo da Nova Página</h1>
    </main>
    
    <!-- Copie o footer -->
    <footer><!-- footer aqui --></footer>
    
    <script src="../js/script.js"></script>
</body>
</html>
```

### Passo 2: Criar CSS

Crie `src/css/nova-pagina.css` com estilos específicos

### Passo 3: Registrar em Vercel

**Arquivo**: `vercel.json`

Adicione no array `rewrites`:

```json
{
  "source": "/nova-pagina",
  "destination": "/src/html/nova-pagina.html"
}
```

### Passo 4: Adicionar Link na Navegação

**Arquivo**: `src/html/homepage.html`

```html
<nav class="navbar">
  <a href="/">Home</a>
  <a href="/servicos">Serviços</a>
  <a href="/nova-pagina">Nova Página</a> <!-- ADICIONE -->
</nav>
```

---

## 🔟 CONFIGURAÇÕES SENSÍVEIS (Variáveis de Ambiente)

### Credenciais (Nunca expor no código)

Crie arquivo `.env.local` (fora do Git):

```
VITE_APPS_SCRIPT_URL=https://script.googleapis.com/macros/s/ABC123.../usercopy
VITE_ANALYTICS_ID=GA-XXXXX
VITE_CONTACT_EMAIL=admin@maianutrі.com.br
```

### Usar em JavaScript

```javascript
const apiUrl = process.env.VITE_APPS_SCRIPT_URL;
```

### No Vercel (Produção)

1. Vá para projeto
2. Settings → Environment Variables
3. Adicione as mesmas variáveis

---

## 1️⃣1️⃣ CHECKLIST DE CUSTOMIZAÇÃO

- [ ] Mudar paleta de cores em `styles.css`
- [ ] Trocar imagem principal (hero banner)
- [ ] Atualizar nome, CRN, email profissional
- [ ] Configurar redes sociais (Instagram, WhatsApp)
- [ ] Ajustar texto da homepage
- [ ] Adicionar serviços da profissional
- [ ] Configurar Google Apps Script
- [ ] Testar formulários
- [ ] Testar blog dinâmico
- [ ] Fazer deploy em Vercel
- [ ] Registrar domínio
- [ ] Configurar Google Analytics
- [ ] Testar em mobile

---

## 1️⃣2️⃣ TROUBLESHOOTING COMUM

| Problema | Solução |
|----------|---------|
| Cores não mudam | Limpe cache: `Ctrl + F5` |
| Imagens não carregam | Verifique caminho da imagem (relativo vs absoluto) |
| Blog não mostra posts | Verifique Sheet ID e nome da aba |
| Formulário não funciona | Valide Google Apps Script deployment |
| Links quebrados | Use caminhos relativos: `../../img/` |
| Responsividade ruim | Teste em diferentes breakpoints (640px, 1024px) |

---

## 1️⃣3️⃣ RECURSOS E LINKS ÚTEIS

**Documentação:**
- [MDN Web Docs](https://developer.mozilla.org)
- [Google Apps Script Docs](https://developers.google.com/apps-script)
- [CSS Variables](https://developer.mozilla.org/en-US/docs/Web/CSS/--*)

**Ferramentas:**
- [Color Picker](https://htmlcolorcodes.com)
- [Image Compressor](https://tinypng.com)
- [Responsive Checker](https://www.responsively.app)

---

**Última atualização**: 13 de abril de 2026  
**Mantido por**: Tim de Desenvolvimento MaiaNutri

```
MaiaNutri/
├── src/
│   ├── html/
│   │   ├── homepage.html         # Página principal do site
│   │   ├── servicos.html         # Listagem e descrição de serviços
│   │   ├── blog.html             # Página de listagem de posts
│   │   ├── blog-post.html        # Template para posts individuais
│   │   ├── admin.html            # Dashboard administrativo
│   │   └── 404.html              # Página de erro 404
│   ├── css/
│   │   ├── styles.css            # Estilos globais (reset, variáveis)
│   │   ├── homepage.css          # Estilos específicos da homepage
│   │   ├── servicos.css          # Estilos da página de serviços
│   │   ├── blog.css              # Estilos do blog
│   │   └── admin.css             # Estilos do painel administrativo
│   ├── js/
│   │   ├── script.js             # JavaScript global (utilidades)
│   │   ├── blog.js               # Funções específicas do blog
│   │   └── admin.js              # Funções do painel administrativo
│   └── apps-script/
│       └── Codigo.gs             # Backend em Google Apps Script
├── img/                          # Imagens e ícones do site
├── vercel.json                   # Configuração de deploy e segurança
└── README.md                     # Este arquivo
```

### Detalhamento dos diretórios

**`src/html/`** — Contém todos os arquivos HTML do projeto
- `homepage.html`: Página de entrada do site com hero image, destaques e CTA (Call To Action)
- `servicos.html`: Apresenta os serviços oferecidos com cards informativos
- `blog.html`: Exibe a listagem de artigos com filtros e busca
- `blog-post.html`: Template dinâmico para visualizar posts individuais
- `admin.html`: Interface para gerenciar conteúdo, posts e usuários

**`src/css/`** — Estilos estruturados por página
- `styles.css`: Define variáveis CSS, reset de estilos padrão e componentes reutilizáveis
- Cada arquivo específico (`homepage.css`, `blog.css`, etc.) contém estilos únicos da página
- Utiliza flexbox e grid para layouts responsivos

**`src/js/`** — Lógica interativa
- `script.js`: Funções utilitárias compartilhadas entre todas as páginas
- `blog.js`: Gerencia carregamento dinâmico de posts e interações
- `admin.js`: Controla a interface administrativo (formulários, validações)

**`src/apps-script/`** — Backend serverless
- `Codigo.gs`: Implementa endpoints REST para integração com planilhas Google
- Processa requisições do front-end e retorna dados em JSON

## Deploy na Vercel (passo a passo)

### Pré-requisitos

Antes de fazer o deploy, certifique-se de que:
- O repositório está no GitHub, GitLab ou Bitbucket
- Você possui uma conta no Vercel (https://vercel.com)
- Todos os arquivos estão commitados no repositório Git
- O arquivo `vercel.json` está presente na raiz do projeto

### Passos para Deploy

#### 1. Acesse a plataforma Vercel

1. Abra https://vercel.com
2. Clique em "Log in" se já tiver conta ou "Sign up" para criar uma nova conta
3. Escolha autenticar com GitHub, GitLab ou Bitbucket (recomenda-se a plataforma onde seu repositório está)

#### 2. Importe o repositório

1. Após fazer login, clique em "Add New Project"
2. Selecione a opção "Import Git Repository"
3. Conecte sua conta GitHub/GitLab/Bitbucket se necessário
4. Procure pelo repositório "MaiaNutri"
5. Clique em "Import"

#### 3. Configure o projeto

Na tela de configuração do projeto:

- **Project Name**: Deixe como `MaiaNutri` ou escolha um nome personalizado
- **Framework Preset**: Selecione "Other" (pois é um site estático)
- **Root Directory**: Deixe em branco (a raiz já é `/`)
- **Build Command**: Deixe em branco (não precisa build)
- **Output Directory**: Deixe em branco (serve os arquivos diretamente)
- **Environment Variables**: Adicione se necessário (ex: URL do Apps Script)

#### 4. Inicie o deploy

1. Clique em "Deploy"
2. Aguarde o Vercel processar e fazer o upload dos arquivos (geralmente leva 1-2 minutos)
3. Após conclusão, você receberá uma URL como `https://maianutrі.vercel.app`

#### 5. Configure o domínio personalizado (opcional)

1. No dashboard do Vercel, vá para o projeto MaiaNutri
2. Clique em "Settings" → "Domains"
3. Adicione seu domínio (ex: `maianutrі.com.br`)
4. Siga as instruções para configurar registros DNS com seu provedor de domínio

#### 6. Verifique os headers de segurança

O arquivo `vercel.json` já define os headers de segurança. Para verificar se foram aplicados:

```bash
curl -I https://seu-dominio.vercel.app
```

Você deve ver headers como:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Content-Security-Policy: ...`

### Deployment automático

Após a primeira configuração, todos os push para a branch principal (geralmente `main` ou `master`) acionarão um novo deploy automático.

Para gerenciar qual branch faz deploy:
1. Vá para o projeto no Vercel
2. Settings → Git
3. Configure a "Production Branch" desejada

## Como abrir

### Abrindo localmente

#### Opção 1: Direto no navegador (sem servidor)

1. Navegue até a pasta do projeto: `C:\Users\Administrador\Estudos\Git\MaiaNutri`
2. Dentro de `src/html/`, clique com o botão direito em `homepage.html`
3. Selecione "Abrir com" e escolha seu navegador preferido (Chrome, Firefox, Edge, etc.)

**Limitações**: Se o site usar fetches de API ou carregamentos de arquivos via JavaScript, pode haver problemas de CORS.

#### Opção 2: Usando servidor local com Python (recomendado)

Python é built-in em muitos sistemas. Siga os passos:

1. Abra o terminal (cmd, PowerShell ou Git Bash)
2. Navegue até a pasta do projeto:
```bash
cd C:\Users\Administrador\Estudos\Git\MaiaNutri
```

3. Inicie o servidor:
```bash
python -m http.server 8000
```

Se receber um erro, tente:
```bash
python3 -m http.server 8000
```

4. Abra o navegador e acesse:
```
http://localhost:8000/src/html/homepage.html
```

**Vantagens**: Evita erros de CORS e simula um ambiente de produção mais realista.

#### Opção 3: Usando Node.js (alternativa)

Se tiver Node.js instalado:

1. Instale o servidor global:
```bash
npm install -g http-server
```

2. Navegue até a pasta do projeto e execute:
```bash
http-server -p 8000
```

3. Acesse `http://localhost:8000/src/html/homepage.html`

#### Opção 4: Usando VS Code Live Server

Se estiver usando VS Code:

1. Instale a extensão "Live Server" (by Ritwick Dey)
2. Clique com o botão direito em qualquer arquivo HTML
3. Selecione "Open with Live Server"
4. O navegador abrirá automaticamente em `http://127.0.0.1:5500`

### Navegando pelo site localmente

Após iniciar o servidor, você pode navegar entre as páginas:

- **Página inicial**: `http://localhost:8000/src/html/homepage.html`
- **Serviços**: `http://localhost:8000/src/html/servicos.html`
- **Blog**: `http://localhost:8000/src/html/blog.html`
- **Post individual**: `http://localhost:8000/src/html/blog-post.html`
- **Administração**: `http://localhost:8000/src/html/admin.html`

Se o site tiver links internos configurados corretamente, você pode clicar nos menus para navegar.

### Rotas configuradas no Vercel

Uma vez deployado na Vercel, as URLs simplificadas funcionarão:

- `/` → Homepage
- `/servicos` → Página de serviços
- `/blog` → Página do blog
- `/blog/post` → Página de post individual
- `/admin` → Painel administrativo

Isso é configurado automaticamente pelo arquivo `vercel.json` via rewrites.

## Configuração Centralizada

### Arquivo: `vercel.json`

O arquivo `vercel.json` é o coração da configuração centralizada do MaiaNutri. Ele define como a Vercel processa requisições, aplica segurança e otimiza o desempenho.

### Estrutura e Explicação

#### 1. Rewrites (Reescritas de URL)

Os rewrites redirecionam requisições internas sem mudar a URL no navegador:

```json
"rewrites": [
  {
    "source": "/",
    "destination": "/src/html/homepage.html"
  },
  {
    "source": "/servicos",
    "destination": "/src/html/servicos.html"
  },
  {
    "source": "/blog",
    "destination": "/src/html/blog.html"
  },
  {
    "source": "/blog/post",
    "destination": "/src/html/blog-post.html"
  },
  {
    "source": "/admin",
    "destination": "/src/html/admin.html"
  }
]
```

**O que faz**: Quando um usuário acessa `/servicos`, a Vercel internamente serve o arquivo `/src/html/servicos.html` sem redirecionar visualmente. Isso mantém URLs limpas e seofriendly.

#### 2. Redirects (Redirecionamentos)

Redirects mudam a URL no navegador permanente ou temporariamente:

```json
"redirects": [
  {
    "source": "/index.html",
    "destination": "/",
    "permanent": true
  },
  {
    "source": "/homepage.html",
    "destination": "/",
    "permanent": false
  }
]
```

- **`permanent: true`** (código HTTP 301): Para SEO, indica que a URL antiga foi permanentemente substituída
- **`permanent: false`** (código HTTP 302): Redirecionamento temporário

#### 3. Headers de Segurança

Os headers HTTP adicionam proteção contra ataques comuns:

```json
"headers": [
  {
    "source": "/(.*)",
    "headers": [
      {
        "key": "X-Content-Type-Options",
        "value": "nosniff"
      },
      {
        "key": "X-Frame-Options",
        "value": "DENY"
      },
      {
        "key": "X-XSS-Protection",
        "value": "1; mode=block"
      },
      {
        "key": "Referrer-Policy",
        "value": "strict-origin-when-cross-origin"
      },
      {
        "key": "Content-Security-Policy",
        "value": "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; ..."
      }
    ]
  }
]
```

**Explicação de cada header**:

- **X-Content-Type-Options: nosniff** → Previne o navegador de adivinhar o tipo de conteúdo (previne ataques MIME sniffing)
- **X-Frame-Options: DENY** → Proíbe que a página seja embutida em iframes (previne clickjacking)
- **X-XSS-Protection: 1; mode=block** → Ativa proteção contra XSS no navegador
- **Referrer-Policy: strict-origin-when-cross-origin** → Controla quais informações de referência são enviadas a outros sites
- **Content-Security-Policy** → Define quais recursos (scripts, estilos, imagens) podem ser carregados e de onde

#### 4. Cache de Recursos Estáticos

```json
{
  "source": "/img/(.*)",
  "headers": [
    {
      "key": "Cache-Control",
      "value": "public, max-age=31536000, immutable"
    }
  ]
}
```

- **`public`** → Todos podem cachear
- **`max-age=31536000`** → Cacheia por 1 ano (31536000 segundos)
- **`immutable`** → O recurso nunca muda, navegador não verifica atualizações

Para CSS e JS, usa-se um período menor (7 dias) para permitir atualizações mais rápidas.

### Modificando a configuração

Para adicionar novas rotas ou mudar a configuração:

1. Abra `vercel.json` no editor
2. Adicione novos rewrites/redirects conforme necessário
3. Faça commit e push para o repositório
4. O Vercel detectará a mudança e reaplicará automaticamente

**Exemplo: Adicionar nova página**

```json
{
  "source": "/contato",
  "destination": "/src/html/contato.html"
}
```

## Paleta de cores - Tema abacate

O tema visual do MaiaNutri foi inspirado em paletas naturais focadas em nutrição e bem-estar. As cores de abacate transmitem saúde, frescura e naturalidade.

### Cores principais

| Cor | Hex | RGB | Uso | Nota |
|-----|-----|-----|-----|------|
| Verde Escuro | `#2D5C32` | rgb(45, 92, 50) | Títulos, footer, elementos principais | Tom mais profundo e formal |
| Verde Médio | `#4F7D48` | rgb(79, 125, 72) | Botões, links, destaques | Tom equilibrado |
| Verde Claro | `#A8C498` | rgb(168, 196, 152) | Backgrounds suaves, textos secundários | Tom pastel |
| Bege Suave | `#F5F0E6` | rgb(245, 240, 230) | Background principal, cards | Tom neutro e acolhedor |
| Branco | `#FFFFFF` | rgb(255, 255, 255) | Texto em fundo escuro, espaços em branco | Contraste total |

### Implementação no CSS

As cores estão definidas como variáveis CSS em `src/css/styles.css`:

```css
:root {
  --color-dark-green: #2D5C32;
  --color-medium-green: #4F7D48;
  --color-light-green: #A8C498;
  --color-beige: #F5F0E6;
  --color-white: #FFFFFF;
  
  /* Cores complementares para alertas */
  --color-error: #E74C3C;      /* Vermelho */
  --color-warning: #F39C12;    /* Laranja */
  --color-success: #27AE60;    /* Verde positivo */
  --color-info: #3498DB;       /* Azul */
}
```

### Guia de uso por componente

#### Navegação

- **Background**: `--color-dark-green`
- **Texto**: `--color-white`
- **Hover (links)**: `--color-light-green`

#### Botões primários

- **Background**: `--color-medium-green`
- **Texto**: `--color-white`
- **Hover**: `--color-dark-green`
- **Active**: `--color-dark-green` com opacidade

#### Cards de serviços

- **Background**: `--color-white`
- **Bordas**: `--color-light-green`
- **Título**: `--color-dark-green`
- **Texto**: `--color-medium-green`

#### Footer

- **Background**: `--color-dark-green`
- **Texto**: `--color-white`
- **Links**: `--color-light-green`

#### Backgrounds de seções

- **Fundo geral**: `--color-beige`
- **Seções alternadas**: `--color-white`
- **Destaque**: `--color-light-green` com opacidade baixa

### Acessibilidade e Contraste

As cores foram escolhidas respeitando o WCAG 2.1 (Web Content Accessibility Guidelines):

- Contraste entre `--color-dark-green` e `--color-white`: **Excelente** (7.5:1)
- Contraste entre `--color-medium-green` e `--color-white`: **Bom** (4.5:1)
- Contraste entre `--color-light-green` e `--color-beige`: **Legível** para texto grande

### Variações e Estados

A paleta permite criar variações para diferentes estados:

```css
/* Estados dos botões */
.btn-default { background-color: var(--color-medium-green); }
.btn-default:hover { background-color: var(--color-dark-green); }
.btn-default:active { background-color: var(--color-dark-green); opacity: 0.8; }
.btn-default:disabled { background-color: var(--color-light-green); cursor: not-allowed; }

/* Links */
a { color: var(--color-medium-green); }
a:visited { color: var(--color-dark-green); }
a:hover { color: var(--color-dark-green); text-decoration: underline; }
```

### Personalização

Para alterar a paleta de cores:

1. Abra `src/css/styles.css`
2. Localize o bloco `:root { ... }`
3. Modifique os valores hex das cores
4. As mudanças se aplicarão em todo o site automaticamente

**Exemplo: Mudar para tons mais claros**

```css
:root {
  --color-dark-green: #5A8C6D;
  --color-medium-green: #7BA88A;
  --color-light-green: #B8D4C5;
  /* ... */
}
```

## Funcionalidades implementadas

### Homepage

- Hero section com imagem de destaque e call-to-action (CTA)
- Seção de apresentação do projeto MaiaNutri
- Destaques de serviços principais com cards interativos
- Newsletter signup (integrado com Google Apps Script)
- Testimonials de clientes (estático ou dinâmico)
- Link direto para agendamento/contato

### Página de Serviços

- Listagem de todos os serviços oferecidos
- Cada serviço é um card com:
  - Ícone ou imagem
  - Título e descrição
  - Preço (se aplicável)
  - Botão "Conhecer mais" ou "Agendar"
- Filtros por categoria (opcional)
- Busca rápida de serviços

### Blog

- Listagem dinâmica de posts/artigos
- Cada post exibe:
  - Imagem de capa
  - Título e resumo
  - Data de publicação
  - Autor(a)
  - Categoria/tag
- Sistema de paginação (múltiplas páginas)
- Busca de posts por palavra-chave
- Filtro por categoria

### Post Individual (Blog Post)

- Template responsivo para leitura de artigos
- Breadcrumb (caminho de navegação)
- Conteúdo formatado (títulos, parágrafos, listas)
- Sidebar com posts relacionados
- Seção de comentários (desativada ou integrada)
- Botão de compartilhamento em redes sociais
- Indicador de tempo de leitura

### Painel Administrativo

- Dashboard com informações gerais (estatísticas)
- Gerenciador de posts (criar, editar, deletar)
- Gerenciador de serviços
- Gerenciador de usuários/clientes
- Formulários validados
- Autenticação básica (integrado com Apps Script)
- Exportação de dados
- Logs de atividades

### Recursos JavaScript

- **Validação de formulários**: Verifica email, telefone, campos obrigatórios
- **Carregamento dinâmico**: AJAX para carregar posts sem recarregar página
- **Menu responsivo**: Hamburger menu para mobile
- **Smooth scroll**: Animação suave ao clicar em links internos
- **Lazy loading**: Carregamento otimizado de imagens
- **Local storage**: Salva preferências do usuário
- **Dark mode (opcional)**: Toggle entre temas claro/escuro

### Segurança implementada

- Headers HTTP de segurança via `vercel.json`
- Content Security Policy (CSP) para prevenir XSS
- HTTPS obrigatório na Vercel
- Validação no servidor via Google Apps Script
- Proteção contra CSRF
- Sanitização de inputs

### Otimizações de Performance

- Minificação de CSS e JavaScript
- Compressão de imagens
- Cache de recursos estáticos (1 ano para imagens)
- Cache de 7 dias para CSS/JS
- Rewrite de URLs para evitar múltiplas requisições
- Carregamento assíncrono de scripts

### Responsividade

- Design mobile-first
- Breakpoints para:
  - Mobile: até 640px
  - Tablet: 641px - 1024px
  - Desktop: acima de 1025px
- Navegação adaptável (menu hamburger em mobile)
- Imagens responsivas com `srcset`
- Layout flexível com CSS Flexbox e Grid

## Configuração do backend (Google Apps Script passo a passo)

Google Apps Script é um ambiente serverless que permite executar código JavaScript no Google Cloud, ideal para processar dados, integrar com Google Workspace e criar APIs REST.

### O que é Google Apps Script?

- **Plataforma serverless** da Google baseada em JavaScript
- **Integração nativa** com Google Sheets, Docs, Gmail, Calendar
- **Hospedagem gratuita** de scripts e web apps
- **Deploy como Web App** para servir como backend REST

### Pré-requisitos

- Conta Google pessoal ou corporativa
- Acesso ao Google Drive
- Conhecimento básico de JavaScript

### Passo 1: Acessar o Google Apps Script

1. Abra https://script.google.com
2. Faça login com sua conta Google
3. Clique em "New project"
4. Nomeie o projeto como `MaiaNutri Backend` ou similar
5. Você será direcionado ao editor (IDE) do Apps Script

### Passo 2: Entender a estrutura do arquivo Codigo.gs

O arquivo `src/apps-script/Codigo.gs` contém:

```javascript
// Variáveis globais
const SHEET_ID = "seu-sheet-id-aqui";
const SHEET_NAME_POSTS = "Posts";
const SHEET_NAME_SERVICES = "Servicos";

// Função principal que recebe requisições HTTP
function doGet(e) {
  const action = e.parameter.action;
  
  // Roteamento de ações
  switch(action) {
    case 'get-posts':
      return getPosts();
    case 'get-services':
      return getServices();
    case 'get-post':
      return getPost(e.parameter.id);
    default:
      return notFound();
  }
}

// Recebe dados POST
function doPost(e) {
  const action = e.parameter.action;
  
  switch(action) {
    case 'create-post':
      return createPost(e.postData.contents);
    case 'update-post':
      return updatePost(e.parameter.id, e.postData.contents);
    case 'delete-post':
      return deletePost(e.parameter.id);
    default:
      return notFound();
  }
}

// Funções específicas
function getPosts() {
  // Lê dados da planilha e retorna JSON
}

function getServices() {
  // Retorna lista de serviços
}

// ... mais funções
```

### Passo 3: Copiar o código para o Apps Script

1. Abra `src/apps-script/Codigo.gs` em seu editor
2. Copie TODO o conteúdo do arquivo
3. No Apps Script online, Cole no arquivo `Code.gs`
4. **Importante**: Configure os IDs e nomes de planilhas conforme necessário

### Passo 4: Criar e configurar a Planilha Google Sheets

1. Abra https://sheets.google.com
2. Crie uma nova planilha com nome "MaiaNutri"
3. Crie abas (sheets) conforme necessário:
   - **Posts**: Colunas: ID, Título, Conteúdo, Autor, Data, Categoria, Imagem
   - **Servicos**: Colunas: ID, Nome, Descrição, Preço, Ícone, Status
   - **Usuarios**: Colunas: ID, Nome, Email, Senha (hash), Perfil
   - **Newsletter**: Colunas: Email, Data

4. Preencha alguns dados de teste
5. Copie o Sheet ID da URL:
   - URL: `https://docs.google.com/spreadsheets/d/SHEET_ID_AQUI/edit`

6. No arquivo `Codigo.gs`, atualize:
```javascript
const SHEET_ID = "SHEET_ID_AQUI";
```

### Passo 5: Configurar permissões

1. No editor do Apps Script, clique em "Project Settings"
2. Anote o Script ID (será usado no deploy)
3. Clique em "Enable APIs"
4. Procure pela "Google Sheets API"
5. Ative-a

### Passo 6: Deploy como Web App

1. No editor do Apps Script, clique em "Deploy"
2. Selecione "New deployment"
3. Clique na engrenagem (⚙️) e selecione "Web app"
4. Configure:
   - **Execute as**: Escolha sua conta Google
   - **Who has access**: "Anyone" (para aceitar requisições do site)
5. Clique em "Deploy"
6. Copie a URL gerada (exemplo: `https://script.googleapis.com/macros/s/ABC123...`)

### Passo 7: Configurar a URL no front-end

1. Abra `src/js/script.js` (ou o arquivo de configuração)
2. Adicione a URL do Apps Script:
```javascript
// Configuração centralizada
const API_CONFIG = {
  BASE_URL: 'https://script.googleapis.com/macros/s/SEU_SCRIPT_ID_AQUI/usercache/latest',
  ENDPOINTS: {
    POSTS: 'exec?action=get-posts',
    SERVICES: 'exec?action=get-services',
    POST_DETAIL: (id) => `exec?action=get-post&id=${id}`,
  }
};
```

### Passo 8: Testar requisições básicas

Abra o terminal/console do navegador (F12) e teste:

```javascript
// Teste GET
fetch(`${API_CONFIG.BASE_URL}/${API_CONFIG.ENDPOINTS.POSTS}`)
  .then(res => res.json())
  .then(data => console.log('Posts:', data))
  .catch(err => console.error('Erro:', err));
```

### Estrutura esperada de respostas

**GET /exec?action=get-posts**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "titulo": "5 Alimentos para Saúde",
      "conteudo": "...",
      "autor": "Dr. João",
      "data": "2024-04-08",
      "categoria": "Nutrição",
      "imagem": "https://..."
    }
  ]
}
```

**POST /exec?action=create-post**

Corpo da requisição (JSON):
```json
{
  "titulo": "Novo Post",
  "conteudo": "Conteúdo aqui",
  "autor": "Admin",
  "categoria": "Saúde"
}
```

Resposta esperada:
```json
{
  "success": true,
  "message": "Post criado com sucesso",
  "id": 42
}
```

### Debugging e logs

Para ver erros e logs do Apps Script:

1. No editor, clique em "Executions" (Execuções)
2. Visualize o histórico de execuções
3. Clique em uma execução para ver o log detalhado
4. Procure por erros no console

Você também pode adicionar logs no código:

```javascript
function getPosts() {
  console.log("Buscando posts...");
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME_POSTS);
  console.log("Sheet encontrada:", sheet.getName());
  // ... resto do código
}
```

### Atualizar o deployment

Se fizer mudanças no `Codigo.gs`:

1. Edite o arquivo no Apps Script
2. Clique em "Deploy"
3. Selecione "Edit deployment"
4. Escolha o Web App deployment existente
5. Clique em "Save"
6. As mudanças estarão disponíveis em poucos segundos

## Testando os endpoints

Após configurar o Google Apps Script e fazer deploy como Web App, é importante testar todos os endpoints para garantir que o backend e front-end se comunicam corretamente.

### Formas de testar

#### 1. Console do Navegador (Browser DevTools)

**Mais acessível e prático para desenvolvimento rápido.**

1. Abra o site no navegador (local ou Vercel)
2. Pressione `F12` para abrir o Developer Tools
3. Vá para a aba "Console"
4. Copie e cole um dos testes abaixo

**Teste GET - Buscar todos os posts:**

```javascript
const API_URL = "https://script.googleapis.com/macros/s/SEU_SCRIPT_ID_AQUI/usercache/latest";

fetch(`${API_URL}?action=get-posts`)
  .then(response => response.json())
  .then(data => {
    console.log("✓ Sucesso! Posts recebidos:", data);
    console.table(data.data); // Exibe em forma de tabela
  })
  .catch(error => {
    console.error("✗ Erro ao buscar posts:", error);
  });
```

**Teste GET - Buscar um post específico:**

```javascript
fetch(`${API_URL}?action=get-post&id=1`)
  .then(response => response.json())
  .then(data => console.log("Post encontrado:", data))
  .catch(error => console.error("Erro:", error));
```

**Teste GET - Buscar serviços:**

```javascript
fetch(`${API_URL}?action=get-services`)
  .then(response => response.json())
  .then(data => console.log("Serviços:", data))
  .catch(error => console.error("Erro:", error));
```

**Teste POST - Criar novo post:**

```javascript
const novoPost = {
  titulo: "Teste de Post",
  conteudo: "Este é um post de teste",
  autor: "Testador",
  categoria: "Teste"
};

fetch(`${API_URL}?action=create-post`, {
  method: 'POST',
  payload: JSON.stringify(novoPost)
})
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      console.log("✓ Post criado com ID:", data.id);
    } else {
      console.error("✗ Erro:", data.message);
    }
  })
  .catch(error => console.error("✗ Erro na requisição:", error));
```

#### 2. cURL (Terminal/Prompt de Comando)

**Ideal para recursos limitados ou testes diretos sem GUI.**

Abra o terminal (cmd, PowerShell ou Git Bash) e execute:

**Teste GET - Buscar posts:**

```bash
curl "https://script.googleapis.com/macros/s/SEU_SCRIPT_ID_AQUI/usercache/latest?action=get-posts"
```

**Teste GET - Com formatação JSON legível:**

```bash
curl -s "https://script.googleapis.com/macros/s/SEU_SCRIPT_ID_AQUI/usercache/latest?action=get-posts" | python -m json.tool
```

Se usar PowerShell, troque `python -m json.tool` por `| ConvertTo-Json`

**Teste POST - Criar post:**

```bash
curl -X POST "https://script.googleapis.com/macros/s/SEU_SCRIPT_ID_AQUI/usercache/latest?action=create-post" \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "Novo Post Teste",
    "conteudo": "Testando via curl",
    "autor": "API Tester",
    "categoria": "Teste"
  }'
```

#### 3. Postman

**Ferramenta profissional com interface visual.**

1. Baixe e instale o Postman: https://www.postman.com/downloads/
2. Crie uma nova requisição (New → Request)

**Configurar teste GET:**

- **Method**: GET
- **URL**: `https://script.googleapis.com/macros/s/SEU_SCRIPT_ID_AQUI/usercache/latest?action=get-posts`
- Clique em "Send"
- A resposta aparecerá em "Response"

**Configurar teste POST:**

- **Method**: POST
- **URL**: `https://script.googleapis.com/macros/s/SEU_SCRIPT_ID_AQUI/usercache/latest?action=create-post`
- Vá para aba **Body**
- Selecione **raw** e escolha **JSON** no dropdown
- Cole:
```json
{
  "titulo": "Post Postman",
  "conteudo": "Criado via Postman",
  "autor": "Testador",
  "categoria": "API"
}
```
- Clique em "Send"

#### 4. Insomnia

**Alternativa open-source ao Postman.**

1. Baixe em https://insomnia.rest/
2. Crie uma requisição (Ctrl+N)
3. Configure URL e método como em Postman
4. Envie e verifique a resposta

#### 5. VS Code - REST Client Extension

**Para quem usa VS Code.**

1. Instale a extensão "REST Client" (by Huachao Mao)
2. Crie um arquivo `test.http` na raiz do projeto
3. Adicione:

```http
### Buscar todos os posts
GET https://script.googleapis.com/macros/s/SEU_SCRIPT_ID_AQUI/usercache/latest?action=get-posts

### Buscar um post específico
GET https://script.googleapis.com/macros/s/SEU_SCRIPT_ID_AQUI/usercache/latest?action=get-post&id=1

### Criar novo post
POST https://script.googleapis.com/macros/s/SEU_SCRIPT_ID_AQUI/usercache/latest?action=create-post
Content-Type: application/json

{
  "titulo": "Novo Post",
  "conteudo": "Conteúdo do post",
  "autor": "Admin",
  "categoria": "Nutrição"
}

### Buscar serviços
GET https://script.googleapis.com/macros/s/SEU_SCRIPT_ID_AQUI/usercache/latest?action=get-services
```

4. Clique em "Send Request" acima de cada teste
5. Reposta aparecerá no lado direito

### Checklist de testes essenciais

Após cada alteração no backend, execute estes testes:

- [ ] **Conectividade**: Endpoint responde sem timeout
- [ ] **Status HTTP**: Retorna 200 para sucesso, 4xx para erro
- [ ] **Formato JSON**: Resposta é JSON válido (não HTML ou texto)
- [ ] **GET Posts**: Retorna lista de posts com estrutura correta
- [ ] **GET Detalhes**: Recurso específico retorna dados corretos
- [ ] **POST Criar**: Novo recurso é criado na planilha
- [ ] **PUT/UPDATE**: Atualização modifica dados existentes
- [ ] **DELETE**: Remoção funciona corretamente
- [ ] **Validação**: Campos obrigatórios são validados
- [ ] **Erro Handling**: Erros retornam mensagens claras
- [ ] **CORS**: Front-end consegue acessar o backend
- [ ] **Performance**: Respostas são rápidas (< 3s)

### Solução de problemas comuns

**Erro 403 Forbidden**
- Verifique se o deployment tem "Who has access" como "Anyone"
- Confirme que está usando o URL correto do deployment

**Erro CORS**
- Apps Script Web Apps devem retornar CORS headers
- Adicione ao `Codigo.gs`:
```javascript
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({...}))
    .setMimeType(ContentService.MimeType.JSON);
}
```

**Erro 500 Internal Server Error**
- Verifique os logs em "Executions" no Apps Script
- Confirme que os IDs de planilha estão corretos
- Verifique sintaxe do JavaScript

**Resposta vazia ou nula**
- Confirme que a planilha tem dados
- Verifique que os nomes das abas (sheets) correspondem ao código
- Teste manualmente a planilha para garantir dados

### Monitoramento em tempo real

Para monitorar requisições do site para o backend:

1. Abra o site no navegador
2. Pressione F12 → Network
3. Interaja com o site (clique em botões, navegue)
4. Veja as requisições XHR/Fetch
5. Clique em uma requisição para ver Headers, Params, Response

Isso ajuda a identificar problemas na integração front-end/back-end de forma prática.

## Contato e Contribuições

### Reportar bugs ou sugestões

1. Abra uma issue no repositório GitHub: [GitHub Issues](https://github.com/SEU_USUARIO/MaiaNutri/issues)
2. Descreva claramente o problema ou sugestão
3. Inclua screenshots se possível
4. Mencione navegador e SO (Windows, Mac, Linux)

### Contribuir com código

1. Faça um fork do repositório
2. Crie uma branch para sua feature:
   ```bash
   git checkout -b feature/minha-feature
   ```
3. Faça commits descritivos:
   ```bash
   git commit -m "Add: nova seção no blog"
   ```
4. Push para sua branch:
   ```bash
   git push origin feature/minha-feature
   ```
5. Abra um Pull Request no repositório original

### Boas práticas de desenvolvimento

#### Commits

- Use mensagens claras: `Add:`, `Fix:`, `Refactor:`, `Docs:`
- Exemplo: `Add: validação de email no formulário`
- Evite: `fix bug`, `update`, `changes`

#### Branches

- `main` ou `master`: versão em produção
- `develop`: versão em desenvolvimento
- `feature/nome`: novas features
- `bugfix/nome`: correção de bugs
- `hotfix/nome`: correção urgente

#### Code style

- Use nomes descritivos em português ou inglês (consistente)
- Indentação: 2 espaços (configurado no projeto)
- CSS: Use variáveis CSS centralizadas
- JS: Use `const` por padrão, `let` se precisar, raramente `var`

#### Comentários

```javascript
// Bom
// Busca posts e filtra por status ativo
function getActivePosts() { }

// Ruim
// pega os posts
function getPosts() { }
```

## Recursos e documentação adicional

### Documentação oficial

- [MDN Web Docs](https://developer.mozilla.org) - HTML, CSS, JavaScript
- [Google Apps Script Docs](https://developers.google.com/apps-script) - Backend
- [Vercel Docs](https://vercel.com/docs) - Hospedagem
- [Google Sheets API](https://developers.google.com/sheets/api) - Integração

### Tutoriais úteis

- [Responsive Web Design](https://web.dev/responsive-web-design-basics/) - Web.dev
- [JavaScript Async/Await](https://javascript.info/async-await) - JavaScript.info
- [CSS Grid Layout](https://css-tricks.com/snippets/css/complete-guide-grid/) - CSS-Tricks

### Ferramentas recomendadas

- **Editor**: VS Code + Live Server extension
- **Versionamento**: Git + GitHub Desktop
- **Design**: Figma (prototipos gratuitos)
- **Testes**: DevTools do navegador, Postman
- **Performance**: Google PageSpeed Insights

## FAQ - Perguntas Frequentes

### P: Como adicionar uma nova página?

**R**: 
1. Crie `src/html/pagina.html`
2. Crie `src/css/pagina.css`
3. Adicione rewrite em `vercel.json`:
```json
{
  "source": "/pagina",
  "destination": "/src/html/pagina.html"
}
```
4. Commit e push (Vercel faz deploy automático)

### P: Como mudar a cor do tema?

**R**: Edite `src/css/styles.css` e mude as variáveis CSS:
```css
:root {
  --color-dark-green: #novo-valor;
  --color-medium-green: #novo-valor;
  /* etc */
}
```

### P: O Apps Script está retornando erro 500?

**R**: Verifique em "Executions" no Apps Script. Causas comuns:
- Sheet ID incorreto
- Nome da aba incorreto
- Sintaxe JavaScript inválida
- Falta permissão de acesso à planilha

### P: Como testar o site offline?

**R**: Use um servidor local:
```bash
python -m http.server 8000
```
Acesse `http://localhost:8000/src/html/`

### P: Posso usar cookies para autenticação?

**R**: Sim, com cuidado. Configure o header Secure e HttpOnly em produção via Apps Script.

### P: Como melhorar a performance?

**R**: 
- Comprima imagens (max 100KB)
- Minifique CSS/JS
- Use lazy loading
- Implemente cache apropriado
- Evite renderizações em loop

## Versioning

Atual: **v1.0.0**

Histórico de versões em [CHANGELOG.md](CHANGELOG.md) (se existir)

---

**Última atualização**: 9 de abril de 2026

**Mantido por**: Equipe MaiaNutri

**Licença**: MIT (ou sua licença escolhida)

