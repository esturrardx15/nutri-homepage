# 🥑 nutri-homepage - Plataforma Web de Nutrição

[![GitHub License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Status](https://img.shields.io/badge/status-active-success.svg)]()
[![Deploy](https://img.shields.io/badge/deploy-vercel-black.svg)](https://maianutrі.vercel.app)

Um site profissional e responsivo para nutricionista especializado em bem-estar e saúde, construído com tecnologias web modernas e otimizado para performance, segurança e SEO.

**[🌐 Acesse o Site](https://maianutrі.vercel.app)** | **[📧 Contato](mailto:contato@maianutrі.com.br)**

---

## 🌟 Funcionalidades

- ✅ **Homepage responsiva** com hero section e destaques
- ✅ **Página de Serviços** com cards interativos
- ✅ **Blog dinâmico** integrado com Google Sheets
- ✅ **Painel Administrativo** para gerenciar conteúdo
- ✅ **Newsletter** com captura de emails
- ✅ **Design moderno** com paleta temática em tons de abacate
- ✅ **Mobile-first** - Funciona perfeitamente em todos os dispositivos
- ✅ **Performance otimizada** - Carregamento rápido e eficiente
- ✅ **Segurança avançada** - Headers HTTP e CSP implementados
- ✅ **SEO-friendly** - Estruturado para motores de busca

---

## 🛠 Tecnologias

| Camada | Tecnologias |
|--------|-------------|
| **Frontend** | HTML5, CSS3, JavaScript (Vanilla) |
| **Backend** | Google Apps Script |
| **Dados** | Google Sheets |
| **Hospedagem** | Vercel (Frontend) |
| **Segurança** | HTTPS, CSP, Headers de Segurança |
| **Versionamento** | Git + GitHub |

---

## 📁 Estrutura do Projeto

```
MaiaNutri/
├── src/
│   ├── html/                  # Arquivos HTML
│   │   ├── homepage.html      # Página principal
│   │   ├── servicos.html      # Serviços oferecidos
│   │   ├── blog.html          # Listagem de posts
│   │   ├── blog-post.html     # Detalhe de post
│   │   ├── admin.html         # Painel administrativo
│   │   └── 404.html           # Página de erro
│   ├── css/                   # Estilos CSS
│   │   ├── styles.css         # Estilos globais
│   │   ├── homepage.css       # Estilos homepage
│   │   ├── servicos.css       # Estilos serviços
│   │   ├── blog.css           # Estilos blog
│   │   └── admin.css          # Estilos admin
│   ├── js/                    # Scripts JavaScript
│   │   ├── script.js          # Utilidades globais
│   │   ├── blog.js            # Lógica do blog
│   │   └── admin.js           # Lógica do painel
│   └── apps-script/
│       └── Codigo.gs          # Backend (Google Apps Script)
├── img/                       # Imagens e ícones
├── vercel.json                # Configuração Vercel
└── README.md                  # Este arquivo
```

---

## 🚀 Como Executar Localmente

### Pré-requisitos
- Git instalado
- Navegador moderno (Chrome, Firefox, Edge, Safari)
- Python 3+ (para servidor local)

### Passos

1. **Clone o repositório**
```bash
git clone https://github.com/esturrardx15/nutri-homepage.git
cd nutri-homepage
```

2. **Inicie um servidor local**
```bash
python -m http.server 8000
```

> Se usar Python 3 em Windows: `python3 -m http.server 8000`

3. **Abra no navegador**
```
http://localhost:8000/src/html/homepage.html
```

### Alternativas de Servidor Local

**Node.js + http-server**
```bash
npx http-server -p 8000
```

**VS Code + Live Server**
- Instale a extensão "Live Server"
- Clique com direito em `homepage.html` → "Open with Live Server"

---

## 🎨 Design & UX

### Paleta de Cores
- **Verde Escuro**: `#2D5C32` - Títulos e elementos principais
- **Verde Médio**: `#4F7D48` - Botões e destaques
- **Verde Claro**: `#A8C498` - Backgrounds e textos secundários
- **Bege Suave**: `#F5F0E6` - Fundo principal
- **Branco**: `#FFFFFF` - Contraste de texto

### Responsividade
- 📱 Mobile: até 640px
- 📱 Tablet: 641px a 1024px
- 💻 Desktop: acima de 1025px

---

## 📝 Como Contribuir

1. **Fork** do repositório
2. Crie uma **branch** para sua feature
   ```bash
   git checkout -b feature/minha-feature
   ```
3. Faça **commits** descritivos
   ```bash
   git commit -m "Add: nova seção no blog"
   ```
4. **Push** para sua branch
   ```bash
   git push origin feature/minha-feature
   ```
5. Abra um **Pull Request**

### Guia de Commits
- `Add:` - Novas funcionalidades
- `Fix:` - Correção de bugs
- `Refactor:` - Melhoria de código
- `Docs:` - Documentação
- `Style:` - Estilos CSS
- `Perf:` - Otimização de performance

---

## 🔒 Segurança

O projeto implementa as seguintes medidas de segurança:

✅ **HTTPS obrigatório** em produção  
✅ **Content Security Policy (CSP)** contra XSS  
✅ **Headers de segurança** HTTP configurados  
✅ **Validação de entrada** no backend  
✅ **Proteção CSRF** ativada  
✅ **Sem dados sensíveis** no código-fonte  

---

## ⚡ Performance

Otimizações implementadas:

- 🖼️ Compressão de imagens
- ⚙️ Minificação de CSS/JS
- 💾 Cache de 1 ano para imagens estáticas
- 🔄 Lazy loading de imagens
- 📦 Reescrita de URLs para évitar requisições desnecessárias

**Resultado**: Carregamento rápido em todos os dispositivos

---

## 📊 Responsividade Testada

- ✅ Chrome (Desktop & Mobile)
- ✅ Firefox (Desktop & Mobile)
- ✅ Safari (Desktop & Mobile)
- ✅ Edge (Desktop)
- ✅ Navegadores mobile padrão

---


## 📞 Contato & Suporte

- **Email**: est.teodoro@gmail.com
- **Website**: [maianutri.vercel.app](https://maianutri.vercel.app)
- **Instagram**: [@obladepontokom](https://www.instagram.com/obladepontokom/)

---

## 📄 Licença

Este projeto está licenciado sob a **Licença MIT** - veja o arquivo [LICENSE](LICENSE) para detalhes.

---

## 👤 Autor

**Eduardo Teodoro**  
Software Engineer

---


[⬆ Voltar ao topo](#maianutrі---plataforma-web-de-nutrição)

</div>
