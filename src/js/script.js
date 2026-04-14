// script.js - JavaScript Compartilhado (homepage.html e servicos.html)

// Anti-clickjacking
if (window.top !== window.self) window.top.location = window.self.location;

// CONFIG centralizado (congelado)

var CONFIG = Object.freeze({
    nome: 'Mariah (Maia) Katharine',
    profissao: 'Nutricionista',
    whatsapp: '+5534996399306',
    instagram: 'maianutricionista/',
    email: 'nutrimariahkatharine@gmail.com',
    ano: '2026',

    // Carrossel - liste apenas os arquivos desejados de img
    carrossel: Object.freeze([
        Object.freeze({ arquivo: 'maia_nutri.jpg', descricao: 'Foto da Nutricionista' }),
        Object.freeze({ arquivo: 'alimentacao.jpg', descricao: 'Alimentação saudável e equilibrada' })
    ])
});

Object.defineProperty(window, 'CONFIG', { writable: false, configurable: false });

// Sanitização anti-XSS 

function sanitizarTexto(texto) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(texto));
    return div.innerHTML;
}

// Aplica CONFIG em todo o site (links, textos, meta tags)

function aplicarConfigGlobal() {
    var nomeCompleto = CONFIG.profissao + ' ' + CONFIG.nome;
    var primeiroNome = CONFIG.nome.split(' ')[0]; //"Mariah"
    var whatsBase = 'https://wa.me/' + CONFIG.whatsapp;
    var instaUrl = 'https://instagram.com/' + CONFIG.instagram;

    // Links Whatsapp com mensagens contextuais
    document.querySelectorAll('[data-link="whatsapp"]').forEach(function (el) {
        var contexto = el.getAttribute('data-whatsapp-context') || '';
        var texto;

        if (contexto === 'servico') {
            var nomeServico = el.getAttribute('data-servico') || 'o serviço';
            texto = 'Olá ' + primeiroNome + ', tudo bem? me chamo [SEU NOME] e gostaria de saber mais sobre ' + nomeServico + '.';
        } else if (contexto === 'depoimento') {
            texto = 'Olá ' + primeiroNome + ', tudo bem? me chamo [SEU NOME] e vim por conta dos depoimentos que vi no seu site.';
        } else if (contexto === 'blog') {
            // Usado pelo blog; o título do post é passado via data-post-titulo
            var tituloPost = el.getAttribute('data-post-titulo') || 'o post';
            texto = 'Olá ' + primeiroNome + ', tudo bem? me chamo [SEU NOME] e vim por que vi o post "' + tituloPost + '" e gostaria de agendar um atendimento.';
        } else {
            // mantém data-whatsapp-text legado ou sem texto específico
            texto = el.getAttribute('data-whatsapp-text') || '';
        }

        el.href = whatsBase + (texto ? '?text=' + encodeURIComponent(texto) : '');
        el.target = '_blank';
        el.rel = 'noopener noreferrer';
    });

    // Links Instagram (data-link="instagram")
    document.querySelectorAll('[data-link="instagram"]').forEach(function (el) {
        el.href = instaUrl;
        el.target = '_blank';
        el.rel = 'noopener noreferrer';
    });

    // Elementos marcados com data-config
    document.querySelectorAll('[data-config]').forEach(function (el) {
        switch (el.getAttribute('data-config')) {
            case 'nomeCompleto':
                el.textContent = nomeCompleto;
                break;
            case 'copyright':
                el.textContent = '\u00A9' + CONFIG.ano + ' ' + nomeCompleto + '. \u2014 Todos os direitos reservados.';
                break;
        }
    });

    // Atualiza <title>se contiver nome antigo 

    if (document.title) {
        document.title = document.title.replace(/Nutricionista\s+[^\u2014\-]+/i, nomeCompleto);
    }

    // Atualiza <meta name"description"
    var metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
        var conteudo = metaDesc.getAttribute('content');
        metaDesc.setAttribute('content', conteudo.replace(/Nutricionista\s+[^\u2014\-]+/i, nomeCompleto));
    }

    //Atualiza Open Graph title
    var ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
        var ogConteudo = ogTitle.getAttribute('content');
        ogTitle.setAttribute('content', ogConteudo.replace(/Nutricionista\s+[^\u2014\-]+/i, nomeCompleto));
    }
}

// Fallback de imagens (data-fallback="next|hide")
function iniciarFallbackImagens() {
    document.querySelectorAll('img[data-fallback]').forEach(function (img) {
        img.addEventListener('error', function () {
            var tipo = this.getAttribute('data-fallback');
            this.style.display = 'none'; // Esconde a imagem quebrada
            if (tipo === 'next' && this.nextElementSibling) {
                this.nextElementSibling.style.display = 'flex'; // Exibe o próximo elemento (pode ser um placeholder)
            }
        });
    });
}

// Animação de scroll (IntersectionObserver)

function iniciarAnimacaoScroll(seletor) {
    var elementos = document.querySelectorAll(seletor);
    if (elementos.length === 0) return

    var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('visivel');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.125 });

    elementos.forEach(function (el) {
        observer.observe(el);
    });
}

// Scroll unificado (header, progresso, botão topo)

function iniciarScrollUnificado() {
    var headerEl = document.querySelector('header');
    var barraProgresso = document.getElementById('scrollProgress');
    var btnTopo = document.getElementById('btnTopo');

    if (!headerEl) return;

    var ticking = false;
    var isCompact = false;
    var lastScrollY = 0;
    var scrollTimeout;

    function updateHeaderHeight() {
        document.documentElement.style.setProperty('--header-height', headerEl.offsetHeight + 'px');
    }

    updateHeaderHeight();

    function handleScroll() {
        try {
            var scrollY = window.scrollY;
            if (Math.abs(scrollY - lastScrollY) < 1) { ticking = false; return; }
            lastScrollY = scrollY;

            if (!isCompact && scrollY > 120) {
                headerEl.classList.add('compacto');
                isCompact = true;
                clearTimeout(scrollTimeout);
                scrollTimeout = setTimeout(updateHeaderHeight, 300);
            } else if (isCompact && scrollY <= 50) {
                headerEl.classList.remove('compacto');
                isCompact = false;
                clearTimeout(scrollTimeout);
                scrollTimeout = setTimeout(updateHeaderHeight, 300);
            }

            if (barraProgresso) {
                var alturaTotal = document.documentElement.scrollHeight - window.innerHeight;
                var progresso = alturaTotal > 0 ? (scrollY / alturaTotal) * 100 : 0;
                barraProgresso.style.width = Math.max(0, Math.min(100, progresso)).toFixed(2) + '%';
            }

            if (btnTopo) btnTopo.classList.toggle('visivel', scrollY > 400);
        } catch (e) { /* scroll seguro - nunca quebra a página */ }
        ticking = false;
    }

    window.addEventListener('scroll', function () {
        if (!ticking) {
            requestAnimationFrame(handleScroll);
            ticking = true;
        }
    }, { passive: true });

    //Recalcula altura em resize
    var resizeTimeout;
    window.addEventListener('resize', function () {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(updateHeaderHeight, 150);
    }, { passive: true });

    // Clique no botão topo
    if (btnTopo) {
        btnTopo.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
}

// Nav - destaque do link ativo (InteresctionObserver)

function iniciarNavAtivo() {
    var linksNav = document.querySelectorAll('nav a[href^="#"]');
    var secoesNav = document.querySelectorAll('section[id]');

    if (linksNav.length === 0 || secoesNav.length === 0) return;

    var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                linksNav.forEach(function (link) { link.classList.remove('ativo'); });
                var linkAtivo = document.querySelector('nav a[href="#' + entry.target.id + '"]');
                if (linkAtivo) linkAtivo.classList.add('ativo');
            }
        });
    }, { threshold: 0.3, rootMargin: '-20% 0px -50% 0px' });

    secoesNav.forEach(function (s) { observer.observe(s); });
}

// FAQ - Accordion

function iniciarFAQ() {
    var perguntas = document.querySelectorAll('.faq-pergunta');
    if (perguntas.length === 0) return;

    perguntas.forEach(function (btn) {
        btn.addEventListener('click', function () {
            var item = this.closest('.faq-item');
            var estaAberto = item.classList.contains('aberto');

            // Fecha todos
            document.querySelectorAll('.faq-item').forEach(function (i) {
                i.classList.remove('aberto');
                i.querySelector('.faq-pergunta').setAttribute('aria-expanded', 'false');
            });

            // Se não estava aberto, abre este
            if (!estaAberto) {
                item.classList.add('aberto');
                btn.setAttribute('aria-expanded', 'true');
            }
        });

        // Navegação por teclado (Enter e Espaço já funcionam em <button>)
        // Adiciona navegação por setas entre perguntas
        btn.addEventListener('keydown', function (e) {
            var allPerguntas = Array.from(document.querySelectorAll('.faq-pergunta'));
            var idx = allPerguntas.indexOf(this);
            if (e.key === 'ArrowDown' && idx < allPerguntas.length - 1) {
                e.preventDefault();
                allPerguntas[idx + 1].focus();
            } else if (e.key === 'ArrowUp' && idx > 0) {
                e.preventDefault();
                allPerguntas[idx - 1].focus();
            }
        });
    });
}

// Validação do formulário de contato

function iniciarValidacaoFormulario() {
    var form = document.getElementById('formContato');
    if (!form) return;

    var campoNome = document.getElementById('nome');
    var campoEmail = document.getElementById('email');
    var campoMensagem = document.getElementById('mensagem');
    var campoHoneypot = document.getElementById('website'); // Campo oculto para bots
    var btnEnviar = document.getElementById('btnEnviar');
    var charCounter = document.getElementById('charCount');
    var regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Rate-limit: impede reenvio em menos de 30 segundos
    var ultimoEnvio = 0;
    var INTERVALO_MIN = 30000;
    var MAX_MENSAGEM = 2000;

    // Character counter
    if (campoMensagem && charCounter) {
        campoMensagem.addEventListener('input', function () {
            var len = this.value.length;
            charCounter.textContent = len + '/' + MAX_MENSAGEM;
            charCounter.classList.toggle('limite', len >= MAX_MENSAGEM * 0.9);
        });
    }

    // Remove erro ao digitar
    [campoNome, campoEmail, campoMensagem].forEach(function (campo) {
        if (!campo) return;
        campo.addEventListener('input', function () {
            this.classList.remove('campo-erro');
            var erroEl = this.closest('.campo-grupo') && this.closest('.campo-grupo').querySelector('.erro-texto');
            if (erroEl) erroEl.classList.remove('visivel');
        });
    });

    function mostrarErro(campo, idErro) {
        campo.classList.add('campo-erro');
        campo.setAttribute('aria-invalid', 'true');
        var erroEl = document.getElementById(idErro);
        if (erroEl) erroEl.classList.add('visivel');
    }

    function limpaErros() {
        document.querySelectorAll('.campo-erro').forEach(function (c) {
            c.classList.remove('campo-erro');
            c.removeAttribute('aria-invalid');
        });
        document.querySelectorAll('.erro-texto').forEach(function (e) { e.classList.remove('visivel'); });
    }

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        limpaErros();

        // Honeypot anti-bot
        if (campoHoneypot && campoHoneypot.value !== '') {
            document.getElementById('msgSucesso').style.display = 'block';
            return;
        }

        // Rate-limit
        var agora = Date.now();
        if (agora - ultimoEnvio < INTERVALO_MIN) {
            btnEnviar.disabled = true;
            btnEnviar.innerHTML = '<i class="fas fa-clock"></i> Aguarde antes de reenviar...';
            setTimeout(function () {
                btnEnviar.disabled = false;
                btnEnviar.innerHTML = '<i class="fas fa-paper-plane"></i> Enviar por E-mail';
            }, 3000);
            return;
        }

        // Sanitização
        var nome = sanitizarTexto(campoNome.value.trim());
        var email = sanitizarTexto(campoEmail.value.trim());
        var assunto = sanitizarTexto(document.getElementById('assunto').value.trim()) || 'Contato pelo site';
        var mensagem = sanitizarTexto(campoMensagem.value.trim());
        var valido = true;

        if (nome.length < 2) {
            mostrarErro(campoNome, 'erroNome');
            valido = false;
        }

        if (!regexEmail.test(email)) {
            mostrarErro(campoEmail, 'erroEmail');
            valido = false;
        }

        if (mensagem.length < 5) {
            mostrarErro(campoMensagem, 'erroMensagem');
            valido = false;
        }

        if (mensagem.length > MAX_MENSAGEM) {
            mostrarErro(campoMensagem, 'erroMensagem');
            valido = false;
        }

        if (!valido) {
            var primeiroErro = form.querySelector('.campo-erro');
            if (primeiroErro) primeiroErro.focus();
            return;
        }

        // Monta o mailto
        var corpo = 'Olá, ' + CONFIG.nome.split(' ')[0] + '!\n\nMeu nome é ' + nome + ' e meu email é ' + email + '.\n\n' + mensagem;
        var mailto = 'mailto:' + CONFIG.email + '?subject=' + encodeURIComponent(assunto) + '&body=' + encodeURIComponent(corpo);

        // Feedback visual
        btnEnviar.disabled = true;
        btnEnviar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Abrindo e-mail...';
        window.location.href = mailto;

        ultimoEnvio = Date.now(); // Registra o horário do envio para rate-limit

        setTimeout(function () {
            document.getElementById('msgSucesso').style.display = 'block';
            btnEnviar.disabled = false;
            btnEnviar.innerHTML = '<i class="fas fa-paper-plane"></i> Enviar por E-mail';
        }, 1500);
    });
}

// Carrossel de imagens (auto-slide, setas, dots, swipe)

function iniciarCarrossel() {
    var container = document.querySelector('.carrossel');
    if (!container) return;

    var track = container.querySelector(".carrossel-track");
    var btnPrev = container.querySelector(".carrossel-prev");
    var btnNext = container.querySelector(".carrossel-next");
    var dotsBox = container.querySelector(".carrossel-dots");

    // Monta as imagens a partir do CONFIG
    var lista = CONFIG.carrossel || [];
    if (lista.length === 0) { container.style.display = 'none'; return; }

    track.innerHTML = '';
    lista.forEach(function (item) {
        var img = document.createElement('img');
        img.src = '/img/' + item.arquivo;
        img.alt = item.descricao || '';
        img.loading = 'lazy';
        img.setAttribute('width', '800');
        img.setAttribute('height', '300');
        track.appendChild(img);
    });

    var imagens = track.querySelectorAll('img');
    var total = imagens.length;
    var atual = 0;
    var timer;

    // Cria indicadores (dots) dinamicamente
    for (var i = 0; i < total; i++) {
        var dot = document.createElement('button');
        dot.className = 'carrossel-dot' + (i === 0 ? ' ativo' : '');
        dot.setAttribute('aria-label', 'Imagem ' + (i + 1) + ' de ' + total);
        dot.setAttribute('role', 'tab');
        dot.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
        dot.dataset.index = i;
        dotsBox.appendChild(dot);
    }

    var dots = dotsBox.querySelectorAll('.carrossel-dot');

    function irPara(idx) {
        if (idx < 0) idx = total - 1;
        if (idx >= total) idx = 0;
        atual = idx;
        track.style.transform = 'translateX(-' + (atual * 100) + '%)';
        dots.forEach(function (d, j) {
            d.classList.toggle('ativo', j === atual);
            d.setAttribute('aria-selected', j === atual ? 'true' : 'false');
        });
        // Announce para screen readers
        var imgAtual = imagens[atual];
        if (imgAtual && imgAtual.alt) {
            container.setAttribute('aria-label', 'Galeria de fotos - ' + imgAtual.alt);
        }
    }

    function proximo() { irPara(atual + 1); }
    function anterior() { irPara(atual - 1); }

    function iniciarAuto() { timer = setInterval(proximo, 4000); }
    function pararAuto() { clearInterval(timer); }

    if (btnPrev) btnPrev.addEventListener('click', function () { pararAuto(); anterior(); iniciarAuto(); });
    if (btnNext) btnNext.addEventListener('click', function () { pararAuto(); proximo(); iniciarAuto(); });

    dotsBox.addEventListener('click', function (e) {
        var dot = e.target.closest('.carrossel-dot');
        if (dot) {
            pararAuto();
            irPara(parseInt(dot.dataset.index));
            iniciarAuto();
        }
    });

    //keyboard navigation for carrossel
    container.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowLeft') { pararAuto(); anterior(); iniciarAuto(); }
        if (e.key === 'ArrowRight') { pararAuto(); proximo(); iniciarAuto(); }
    });

    container.addEventListener('mouseenter', pararAuto);
    container.addEventListener('mouseleave', iniciarAuto);

    // Swipe (touch) para mobile
    var touchStartX = 0;
    container.addEventListener('touchstart', function (e) {
        touchStartX = e.changedTouches[0].screenX;
        pararAuto();
    }, { passive: true });
    container.addEventListener('touchend', function (e) {
        var deltaX = e.changedTouches[0].screenX - touchStartX;
        if (deltaX > 50) anterior();
        else if (deltaX < -50) proximo();
        iniciarAuto();
    });

    // Pausa quando a página não está visivel (economia de recursos)
    document.addEventListener('visibilitychange', function () {
        if (document.hidden) { pararAuto }
        else { iniciarAuto(); }
    });

    iniciarAuto();
}

// Hamburger menu (mobile)

function iniciarHamburger() {
    var btn = document.getElementById('btnHamburger');
    var nav = document.getElementById('navPrincipal');
    if (!btn || !nav) return;

    function fecharMenu() {
        nav.classList.remove('nav-aberto');
        btn.classList.remove('aberto');
        btn.setAttribute('aria-expanded', 'false');
        btn.setAttribute('aria-label', 'Abrir menu de navegação');
    }

    btn.addEventListener('click', function () {
        var aberto = nav.classList.toggle('nav-aberto');
        btn.classList.toggle('aberto', aberto);
        btn.setAttribute('aria-expanded', aberto ? 'true' : 'false');
        btn.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu de navegação');
    });

    nav.querySelectorAll('a').forEach(function (link) { link.addEventListener('click', fecharMenu); });

    document.addEventListener('click', function (e) {
        if (!nav.contains(e.target) && !btn.contains(e.target) && nav.classList.contains('nav-aberto')) fecharMenu();
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && nav.classList.contains('nav-aberto')) fecharMenu(); btn.focus();
    });
}

// Smooth scroll para âncoras

function iniciarSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
        link.addEventListener('click', function (e) {
            var targetId = this.getAttribute('href');
            if (targetId === '#') return;
            var target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                var headerH = document.querySelector('header');
                var offset = headerH ? headerH.offsetHeight + 16 : 80;
                var top = target.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({ top: top, behavior: 'smooth' });
                // Set focus for accessibility
                target.setAttribute('tabindex', '-1');
                target.focus({ preventScroll: true });
            }
        });
    });
}

// Toggle de tema claro/escuro

function iniciarTemaToggle() {
    var btn = document.getElementById('btnTema');
    if (!btn) return;

    // Restaura preferência salva (ignora se o valor for inválido)
    var temaSalvo = localStorage.getItem('tema');
    if (temaSalvo === 'claro' || temaSalvo === 'escuro') {
        document.documentElement.setAttribute('data-tema', temaSalvo);
    }

    btn.addEventListener('click', function () {
        var temaAtual = document.documentElement.getAttribute('data-tema');
        // Detecta o tema do sistema caso nenhuma preferência manual esteja salva
        var sistemaEscuro = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

        var novoTema;
        if (temaAtual === 'escuro') {
            novoTema = 'claro';
        } else if (temaAtual === 'claro') {
            novoTema = 'escuro';
        } else {
            // Ainda sem preferência manual: inverte o tema atual do sistema
            novoTema = sistemaEscuro ? 'claro' : 'escuro';
        }

        document.documentElement.setAttribute('data-tema', novoTema);
        localStorage.setItem('tema', novoTema);
    });
}

// Carrossel de depoimentos (5s auto-slide, setas, dots, swipe, teclado)

function iniciarCarrosselDepoimentos() {
    var container = document.querySelector('.depoimentos-carrossel');
    if (!container) return;

    var track = container.querySelector(".depoimentos-track");
    var btnPrev = container.querySelector(".dep-prev");
    var btnNext = container.querySelector(".dep-next");
    var dotsBox = container.querySelector(".dep-dots");
    var itens = track ? track.querySelectorAll('.depoimento') : [];
    var total = itens.length;

    if (total === 0) return;

    var atual = 0;
    var timer;

    // Cria dots
    for (var i = 0; i < total; i++) {
        var dot = document.createElement('button');
        dot.className = 'dep-dot' + (i === 0 ? 'ativo' : '');
        dot.setAttribute('aria-label', 'Depoimento' + (i + 1) + ' de ' + total);
        dot.setAttribute('role', 'tab');
        dot.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
        dot.dataset.index = i;
        dotsBox.appendChild(dot);
    }

    var dots = dotsBox.querySelectorAll('.dep-dot');

    function irPara(idx) {
        if (idx < 0) idx = total - 1;
        if (idx >= total) idx = 0;
        atual = idx;
        // Cada item ocupa exatamente 100% da largura do container
        var offset = atual * 100;
        track.style.transform = 'translateX(-' + offset + '%)';
        dots.forEach(function (d, j) {
            d.classList.toggle('ativo', j === atual);
            d.setAttribute('aria-selected', j === atual ? 'true' : 'false');
        });
    }

    function proximo() { irPara(atual + 1); }
    function anterior() { irPara(atual - 1); }
    function iniciarAuto() { timer = setInterval(proximo, 5000); }
    function pararAuto() { clearInterval(timer); }

    if (btnPrev) btnPrev.addEventListener('click', function () { pararAuto(); anterior(); iniciarAuto(); });
    if (btnNext) btnNext.addEventListener('click', function () { pararAuto(); proximo(); iniciarAuto(); });

    dotsBox.addEventListener('click', function (e) {
        var dot = e.target.closest('.dep-dot');
        if (dot) {
            pararAuto();
            irPara(parseInt(dot.dataset.index, 10));
            iniciarAuto();
        }
    });

    container.addEventListener('mouseenter', pararAuto);
    container.addEventListener('mouseleave', iniciarAuto);
    container.addEventListener('focusin', pararAuto);
    container.addEventListener('focusout', iniciarAuto);

    // Swipe touch
    var touchX = 0;
    container.addEventListener('touchstart', function (e) {
        touchX = e.changedTouches[0].screenX;
        pararAuto();
    }, { passive: true });
    container.addEventListener('touchend', function (e) {
        var delta = e.changedTouches[0].screenX - touchX;
        if (delta > 50) anterior();
        else if (delta < -50) proximo();
        iniciarAuto();
    });

    // Navegação por teclado
    container.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowLeft') { pararAuto(); anterior(); iniciarAuto(); }
        if (e.key === 'ArrowRight') { pararAuto(); proximo(); iniciarAuto(); }
    });

    // Pausa quando aba não está visível
    document.addEventListener('visibilitychange', function () {
        if (document.hidden) pararAuto(); else iniciarAuto();
    });

    iniciarAuto();
}

// Botão flutuante Whatsapp - arrastar e fechar

function iniciarWhatsappFlutuante() {
    var wppBtn = document.querySelector('.whatsapp-flutuante');
    if (!wppBtn) return;

    var closeBtn = wppBtn.querySelector('.wpp-close');
    var isDragging = false;
    var hasMoved = false;
    var startX, startY, initialX, initialY;

    // Restaura posição salva
    var savedPos = localStorage.getItem('wpp-position');
    if (localStorage.getItem('wpp-hidden') === 'true') wppBtn.classList.add('hidden');

    if (savedPos) {
        try {
            var pos = JSON.parse(savedPos); wppBtn.style.left = pos.x + 'px'; wppBtn.style.bottom = pos.y + 'px';
        } catch (e) { }
    }

    wppBtn.addEventListener('click', function (e) {
        if (hasMoved) { e.preventDefault(); hasMoved = false; }
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', function (e) {
            e.preventDefault(); e.stopPropagation();
            wppBtn.classList.add('hidden');
            localStorage.setItem('wpp-hidden', 'true');

        });
    }

    document.addEventListener('dblclick', function (e) {
        if (wppBtn.classList.contains('hidden') && e.ctrlKey){
            wppBtn.classList.remove('hidden');
            localStorage.setItem('wpp-hidden', 'false');
        }
    });

    wppBtn.addEventListener('mousedown', startDrag);
    wppBtn.addEventListener('touchstart', startDrag);

    function startDrag(e) {
        if (e.target.classList.contains('wpp-close')) return;
        isDragging = true;
        hasMoved = false;
        wppBtn.classList.add('dragging');
        var rect = wppBtn.getBoundingClientRect();
        initialX = rect.left; initialY = window.innerHeight - rect.bottom;
        startX = e.type === 'mousedown' ? e.clientX : e.touches[0].clientX;
        startY = e.type === 'mousedown' ? e.clientY : e.touches[0].clientY;
        e.preventDefault();
    }

    document.addEventListener('mousemove', drag);
    document.addEventListener('touchmove', drag);

    function drag(e) {
        if (!isDragging) return;
        var cx = e.type === 'mousemove' ? e.clientX : e.touches[0].clientX;
        var cy = e.type === 'mousemove' ? e.clientY : e.touches[0].clientY;
        var dx = cx - startX, dy = cy - startY;
        if (Math.abs(dx) > 5 || Math.abs(dy) > 5) hasMoved = true;
        var nx = Math.max(0, Math.min(initialX + dx, window.innerWidth - wppBtn.offsetWidth));
        var ny = Math.max(0, Math.min(initialY - dy, window.innerHeight - wppBtn.offsetHeight));
        wppBtn.style.left = nx + 'px'; wppBtn.style.bottom = ny + 'px';
    }

    document.addEventListener('mouseup', endDrag);
    document.addEventListener('touchend', endDrag);

    function endDrag() {
        if (!isDragging) return;
        isDragging = false;
        wppBtn.classList.remove('dragging');
        if (hasMoved) {
            var rect = wppBtn.getBoundingClientRect();
            localStorage.setItem('wpp-position', JSON.stringify({ x: rect.left, y: window.innerHeight - rect.bottom }));
        }
    }
}

// Cards de serviços clicáveis (homepage)

function iniciarCardsServicos() {
    var cards = document.querySelectorAll('#servicos .servico');
    cards.forEach(function (card) {
        card.addEventListener('click', function (e) {
            if (e.target.tagName === 'A') return;
            window.location.href = 'servicos.html';
        });
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');
        card.setAttribute('title', 'Clique para ver todos os serviços');
        card.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {e.preventDefault(); window.location.href = 'servicos.html'; }
        });
    });
}

// Blog Destaques (homepage) - mostra os 3 posts com mais likes

function iniciarBlogDestaques() {
    var grid = document.getElementById('blogDestaquesGrid');
    if (!grid) return;

    var posts = [
        {id: 'demo-1', titulo: 'Como manter um prato colorido e nutritivo', conteudo: '<p>Um prato colorido garante variedade de nutrientes essenciais. Inclua folhas verdes, legumes alaranjados e proteinas de qualidade.</p>', tema: 'Dicas práticas', data: '2026-04-06', likes: 12, icone: '🥗'},
        {id: 'demo-2', titulo: 'Como manter um prato colorido e nutritivo', conteudo: '<p>Um prato colorido garante variedade de nutrientes essenciais.</p>', tema: 'Dicas práticas', data: '2026-04-06', likes: 20, icone: '🥗'},
        {id: 'demo-3', titulo: 'Como manter um prato colorido e nutritivo', conteudo: '<p>Um prato </p>', tema: 'Dicas práticas', data: '2026-04-06', likes: 17, icone: '🥗'},
        {id: 'demo-4', titulo: 'Como manter um prato colorido e nutritivo', conteudo: '<p>Um prato colorido garante variedade de nutrientes essenciais. Inclua folhas verdes, legumes alaranjados e proteinas de qualidade.</p>', tema: 'Dicas práticas', data: '2026-04-06', likes: 12, icone: '🥗'},
        {id: 'demo-5', titulo: 'Como manter um prato colorido e nutritivo', conteudo: '<p>Um prato colorido garante variedade de nutrientes essenciais. Inclua folhas verdes, legumes alaranjados e proteinas de qualidade.</p>', tema: 'Dicas práticas', data: '2026-04-06', likes: 15, icone: '🥗'},
        {id: 'demo-6', titulo: 'Como manter um prato colorido e nutritivo', conteudo: '<p>Um prato colorido garante variedade de nutrientes essenciais. Inclua folhas verdes, legumes alaranjados e proteinas de qualidade.</p>', tema: 'Dicas práticas', data: '2026-04-06', likes: 12, icone: '🥗'}
    ];

    // Aplicar likes salvos no localStorage
    posts.forEach(function (p){
        var salvo = localStorage.getItem('blog_likes_' + p.id);
        if (salvo !== null) p.likes = parseInt(salvo);    
    });

    // Ordenar por likes (desc) e pega top 3
    var top3 = posts.sort(function (a, b) { return b.likes - a.likes; }).slice(0, 3);

    grid.innerHTML = '';
    
    top3.forEach(function (post){
        var excerpt = (post.conteudo || '').replace(/<[^>]*>/g, '').trim();
        excerpt = excerpt.length > 100 ? excerpt.substring(0, 100) + '...' : excerpt;

        var card = document.createElement('a');
        card.className = 'blog-destaque-card';
        card.href = 'blog.html?id=' + encodeURIComponent(post.id);
        card.setAttribute('aria-label', 'Ler post: ' + (post.titulo || ''));

        card.innerHTML =
        '<div class="blog-destaque-icone">' + post.icone + '</div>' +
        '<span class="blog-destaque-tema">' + sanitizarTexto(post.tema || 'Geral') + '</span>' +
        '<h3>' + sanitizarTexto(post.titulo || '') + '</h3>' +
        '<p>' + sanitizarTexto(excerpt) + '</p>' +
        '<div class="blog-destaque-rodape">' +
        '<span class="blog-destaque-likes">' +
        '<i class="fas fa-thumbs-up" aria-hidden="true"></i> ' + (post.likes || 0) +
        '</span>' +
        '<span class="blog-destaque-ler">Ler post <i class="fas fa-arrow-right"></i></span>' +
        '</div>';

        grid.appendChild(card);
        
    });
}

// Auto-inicialização

document.addEventListener('DOMContentLoaded', function () {
    aplicarConfigGlobal();
    iniciarFallbackImagens();
    iniciarScrollUnificado();
    iniciarHamburger();
    iniciarTemaToggle();
    iniciarSmoothScroll();
    iniciarWhatsappFlutuante();
    iniciarCardsServicos();
    iniciarBlogDestaques();

    // Funções com guard interno (retornam cedo se o elemento não existe)
    iniciarNavAtivo();
    iniciarFAQ();
    iniciarValidacaoFormulario();
    iniciarCarrossel();
    iniciarCarrosselDepoimentos();

    // Animação: seletor depende da página
    var isServicos = document.querySelector('.servicos-grid');
    iniciarAnimacaoScroll(isServicos ? '.card, .intro' : 'section, .hero-banner');
});
