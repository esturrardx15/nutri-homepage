//blog.js - Lógica do Blog (blog.html + blog-post.html)

//Config do blog - lê do localStorage (mesma config do admin)

var CONFIG_BLOG = {
    APPS_SCRIPT_URL: (function () {
        // Tenta ler do localStorage (configurado no /admin)
        var urlSalva = localStorage.getItem('admin_api_url');
        if (urlSalva && urlSalva.startsWith('https://script.google.com/')) {
            return urlSalva;
        }
        // Fallback: pode configurar manualmente aqui se preferir
        return 'https://script.google.com/macros/s/AKfycbwrcsz86zByoVw53VMpuNJxqadhpQmnUMMyA8LjzOYAz0DVr0RqtdXAZGsZg7oTTOl7/exec';
    })(),
    POSTS_POR_PAGINA: 9,
    DEBOUNCE_BUSCA_MS: 350
};

console.log('Blog usando API:', CONFIG_BLOG.APPS_SCRIPT_URL);

// Impede reatribuição acidental
Object.defineProperty(window, "CONFIG_BLOG", { writable: false, configurable: false });

// Fetch com timeout (15s) - evita travamento infinito
function fetchComTimeout(url, opcoes, ms) {
    ms = ms || 15000;
    var ctrl = new AbortController();
    var timer = setTimeout(function () { ctrl.abort(); }, ms);
    opcoes = opcoes || {};
    opcoes.signal = ctrl.signal;
    return fetch(url, opcoes).finally(function () { clearTimeout(timer); });
}

var _blogState = {
    todos: [], // todos os posts publicados (cache local)
    filtrados: [], // posts após busca/filtro
    paginaAtual: 1,
    temaAtivo: null,
    termoBusca: ''
};

function sanitizarHTML(html) {
    var parser = new DOMParser();
    var doc = parser.parseFromString(html, 'text/html');
    // Remove scripts e iframes do conteúdo do post
    doc.querySelectorAll('script, iframe, object, embed, form').forEach(function (el) {
        el.remove();
    });
    // Remove event handlers inline (on*)
    doc.querySelectorAll("*").forEach(function (el) {
        Array.from(el.attributes).forEach(function (attr) {
            if (/^on/i.test(attr.name)) el.removeAttribute(attr.name);
        });
    });
    return doc.body.innerHTML;
}

function calcTempoLeitura(texto) {
    var palavras = texto.replace(/<[^>]*>/g, '').trim().split(/\s+/).length;
    var minutos = Math.max(1, Math.ceil(palavras / 200));
    return minutos + ' min de leitura';
}

function formatarData(iso) {
    if (!iso) return '';
    var partes = iso.split('T')[0].split('-');
    if (partes.length < 3) return iso;
    return partes[2] + '/' + partes[1] + '/' + partes[0];
}

function debounce(fn, ms) {
    var timer;
    return function () {
        var args = arguments; ctx = this;
        clearTimeout(timer);
        timer = setTimeout(function () {
            fn.apply(ctx, args);
        }, ms);
    };
}



function carregarPosts(callback) {
    // Se a URL não está configurada, retorna imediatamente sem fetch
    if (!_urlConfigurada()) {
        callback(new Error('URL não configurada'), []);
        return;
    }
    var url = CONFIG_BLOG.APPS_SCRIPT_URL + '?action=posts_publicados';
    fetchComTimeout(url).then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
    }).then(function (data) {
        var lista = Array.isArray(data) ? data : (data.posts || []);
        callback(null, lista);
    }).catch(function (err) {
        callback(err, []);
    });
}

function carregarPostPorId(id, callback) {
    if (!_urlConfigurada()) {
        callback(new Error('URL não configurada'), null);
        return;
    }
    var url = CONFIG_BLOG.APPS_SCRIPT_URL + '?action=post&id=' + encodeURIComponent(id);
    fetchComTimeout(url).then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
    })
        .then(function (data) { callback(null, data); })
        .catch(function (err) { callback(err, null); });
}

function votarPost(postId, tipo) {
    if (!_urlConfigurada()) return;
    var payload = JSON.stringify({ action: 'votar', id: postId, tipo: tipo });
    fetchComTimeout(CONFIG_BLOG.APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: payload
    }).then(function (r) { return r.json(); })
        .then(function (data) {
            // Atualiza contador na tela se retornado
            if (data && typeof data.likes !== 'undefined') {
                var el = document.getElementById('likeCount');
                if (el) el.textContent = data.likes;
            }
        })
        .catch(function () {
            // Silencia erros de rede - a marcação local ainda fica salva
        });
}

function renderizarCards(posts, pagina) {
    var grid = document.getElementById('blog-grid');
    var estado = document.getElementById('blogEstado');
    if (!grid) return;

    var inicio = (pagina - 1) * CONFIG_BLOG.POSTS_POR_PAGINA;
    var fim = inicio + CONFIG_BLOG.POSTS_POR_PAGINA;
    var slice = posts.slice(inicio, fim);

    grid.innerHTML = '';
    estado.textContent = '';
    estado.className = 'blog-estado';

    if (posts.length === 0) {
        estado.textContent = 'Nenhum post encontrado.';
        return;
    }

    // Aplicar likes salvos no localStorage sobre os dados demo
    posts.forEach(function (post) {
        var chave = 'blog_votado_' + post.id;
        var votou = localStorage.getItem(chave);
        var ajuste = localStorage.getItem('blog_likes_' + post.id);
        if (ajuste !== null) {
            post.likes = parseInt(ajuste);
        }
    });

    estado.textContent = 'Exibindo ' + posts.length + (posts.length === 1 ? ' post' : ' posts') +
        (_blogState.termoBusca ? ' para "' + _blogState.termoBusca + '"' : '') +
        (_blogState.temaAtivo ? ' no tema "' + _blogState.temaAtivo + '"' : '');

    slice.forEach(function (post, idx) {
        var card = document.createElement('a');
        card.className = 'post-card';
        card.href = '/blog/post?id=' + encodeURIComponent(post.id);
        card.setAttribute('aria-label', 'Ler post:' + (post.titulo || 'Post'));
        card.style.animationDelay = (idx * 0.06) + 's';

        var thumbHtml;
        if (post.img_lateral_b64) {
            thumbHtml = '<img class="post-card-thumb" src="' + post.img_lateral_b64 + '" alt="Imagem do post ' + escapeAttr(post.titulo || '') + ' " loading="lazy">';
        } else {
            thumbHtml = '<div class="post-card-thumb-placeholder" aria-hidden="true">🥦</div>';
        }

        var excerpt = (post.conteudo || '').replace(/<[^>]*>/g, '').trim();
        excerpt = excerpt.length > 110 ? excerpt.substring(0, 110).trim() + '...' : excerpt;

        card.innerHTML =
            thumbHtml +
            '<div class="post-card-corpo">' +
            '<div class="post-card-meta">' +
            '<span class="post-card-tema">' + escapeHTML(post.tema || 'Geral') + '</span>' +
            '<span class="post-card-data">' + formatarData(post.data) + '</span>' +
            '<span class="post-card-tempo">' +
            '<i class="fas fa-clock" aria-hidden="true"></i> ' +
            calcTempoLeitura(post.conteudo || '') +
            '</span>' +
            '</div>' +
            '<h3 class="post-card-titulo">' + escapeHTML(post.titulo || '') + '</h3>' +
            '<p class="post-card-excerpt">' + escapeHTML(excerpt) + '</p>' +
            '<div class="post-card-rodape">' +
            '<span class="post-card-reacoes">' +
            '<span title="Curtidas" aria-label="' + (post.likes || 0) + ' curtidas">' + '<i class="fas fa-thumbs-up" aria-hidden="true"></i> ' + (post.likes || 0) +
            '</span>' +
            '</span>' +
            '<span class="post-card-ler"></span>Ler <i class="fas fa-arrow-right" aria-hidden="true"></i></span>' +
            '</div>' +
            '</div>';

        grid.appendChild(card);
    });

    renderizarPaginacao(posts.length, pagina);
}

function renderizarPaginacao(totalPosts, paginaAtual) {
    var nav = document.getElementById('blogPaginacao');
    if (!nav) return;

    var totalPags = Math.ceil(totalPosts / CONFIG_BLOG.POSTS_POR_PAGINA);
    nav.innerHTML = '';

    if (totalPags <= 1) return;

    function criarBtn(label, pagAlvo, ativo, disabled) {
        var btn = document.createElement('button');
        btn.className = 'pag-btn' + (ativo ? ' ativo' : '');
        btn.textContent = label;
        btn.disabled = disabled || false;
        if (!disabled) {
            btn.setAttribute('aria-label', 'Página' + pagAlvo);
            btn.addEventListener('click', function () {
                _blogState.paginaAtual = pagAlvo;
                renderizarCards(_blogState.filtrados, pagAlvo);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }
        nav.appendChild(btn);
    }

    criarBtn('‹ Anterior', paginaAtual - 1, false, paginaAtual === 1);

    for (var p = 1; p <= totalPags; p++) {
        criarBtn(String(p), p, p === paginaAtual, false);
    }

    criarBtn('Próxima ›', paginaAtual + 1, false, paginaAtual === totalPags);
}

function aplicarFiltro() {
    var termo = _blogState.termoBusca.toLowerCase().trim();
    var tema = _blogState.temaAtivo;

    _blogState.filtrados = _blogState.todos.filter(function (post) {
        var buscaOk = !termo ||
            (post.titulo || '').toLowerCase().includes(termo) ||
            (post.conteudo || '').toLowerCase().includes(termo) ||
            (post.tema || '').toLowerCase().includes(termo);

        var temaOk = !tema || (post.tema || '') === tema;
        return buscaOk && temaOk;
    });

    _blogState.paginaAtual = 1;
    renderizarCards(_blogState.filtrados, 1);
}

function renderizarTemas(posts, ordenacao) {
    var lista = document.getElementById('temasLista');
    if (!lista) return;

    // Conta posts por tema
    var contagem = {};
    var ultimaData = {};
    posts.forEach(function (post) {
        var t = post.tema || 'Geral';
        contagem[t] = (contagem[t] || 0) + 1;
        if (!ultimaData[t] || post.data > ultimaData[t]) {
            ultimaData[t] = post.data || '';
        }
    });

    var temas = Object.keys(contagem);

    if (ordenacao === 'alfabetico') {
        temas.sort(function (a, b) { return a.localeCompare(b, 'pt'); });
    } else if (ordenacao === 'data') {
        temas.sort(function (a, b) { return (ultimaData[b] || '').localeCompare(ultimaData[a] || ''); });
    } else if (ordenacao === 'quantidade') {
        temas.sort(function (a, b) { return contagem[b] - contagem[a]; });
    }

    lista.innerHTML = '';

    // Item "Todos"
    var liTodos = document.createElement('li');
    var btnTodos = document.createElement('button');
    btnTodos.className = 'tema-btn' + (!_blogState.temaAtivo ? ' ativo' : '');
    btnTodos.textContent = 'Todos os temas';
    btnTodos.setAttribute('aria-pressed', !_blogState.temaAtivo ? 'true' : 'false');
    btnTodos.addEventListener('click', function () {
        _blogState.temaAtivo = null;
        lista.querySelectorAll('.tema-btn').forEach(function (b) {
            b.classList.remove('ativo');
            b.setAttribute('aria-pressed', 'false');
        });
        btnTodos.classList.add('ativo');
        btnTodos.setAttribute('aria-pressed', 'true');
        aplicarFiltro();
    });
    liTodos.appendChild(btnTodos);
    lista.appendChild(liTodos);

    temas.forEach(function (tema) {
        var li = document.createElement('li');
        var btn = document.createElement('button');
        btn.className = 'tema-btn' + (_blogState.temaAtivo === tema ? ' ativo' : '');
        btn.setAttribute('aria-pressed', _blogState.temaAtivo === tema ? ' true' : 'false');

        var span = document.createElement('span');
        span.textContent = tema;

        var count = document.createElement('span');
        count.className = 'tema-count';
        count.textContent = contagem[tema];
        count.setAttribute('aria-label', contagem[tema] + ' posts');

        btn.appendChild(span);
        btn.appendChild(count);

        btn.addEventListener('click', function () {
            _blogState.temaAtivo = tema;
            lista.querySelectorAll('.tema-btn').forEach(function (b) {
                b.classList.remove('ativo');
                b.setAttribute('aria-pressed', 'false');
            });
            btn.classList.add('ativo');
            btn.setAttribute('aria-pressed', 'true');
            aplicarFiltro();
        });

        li.appendChild(btn);
        lista.appendChild(li);
    });
}

function renderizarRecentes(posts) {
    var lista = document.getElementById('recentesLista');
    if (!lista) return;

    var recentes = posts.slice().sort(function (a, b) {
        return (b.data || '').localeCompare(a.data || '');
    }).slice(0, 5);

    lista.innerHTML = '';

    recentes.forEach(function (post) {
        var li = document.createElement('li');
        var a = document.createElement('a');
        a.className = 'recente-link';
        a.href = '/blog/post?id=' + encodeURIComponent(post.id);
        a.textContent = post.titulo || 'Post sem título';
        li.appendChild(a);
        lista.appendChild(li);
    });
}

function escapeHTML(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function escapeAttr(str) {
    return String(str)
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function inicialozarBlog() {
    var campoBusca = document.getElementById('campoBusca');
    var btnLimpar = document.getElementById('btnLimparBusca');
    var seletor = document.getElementById('ordenarTemas');
    var gridEl = document.getElementById('blog-grid');
    var estadoEl = document.getElementById('blogEstado');

    if (!gridEl) return; // Não é a página do blog

    // Exibe estado do carregamento
    if (estadoEl) {
        estadoEl.textContent = 'Carregando posts...';
    }

    carregarPosts(function (err, lista) {
        if (err || lista.length == 0) {
            // Dados de demonstração quando o Apps Script não está configurado
            lista = [{
                id: 'demo-1',
                titulo: 'Como monstar um prato colorido e nutritivo',
                conteudo: '<p>Um prato colorido garante variedade de nutrientes essenciais. Inclua folhas verdes, legumes alaranjados e proteínas de qualidade. A diversidade de cores indica presença de difenretes vitaminas, minerais e antioxidantes que seu corpo precisa diariamente.</p><p>Experimente incluir pelo menos 5 cores diferentes no almoço e no jantar. Você vai se surpreender com os resultados a médio prazo!</p>',
                tema: 'Dicas práticas',
                data: '2026-04-03',
                likes: 12,
                img_lateral_b64: '',
                img_fundo_b64: '',
                img_lado: 'esquerda'
            },
            {
                id: 'demo-2',
                titulo: 'Hidratação: por que a água é o melhor suplemento',
                conteudo: '<p>Antes de investir lorem ipsum dolor sit amet, certifique-se de que está bebendo água o suficiente.</p><p>Experimente incluir pelo menos </p>',
                tema: 'Hidratação',
                data: '2026-04-03',
                likes: 8,
                img_lateral_b64: '',
                img_fundo_b64: '',
                img_lado: 'direita'
            },
            {
                id: 'demo-3',
                titulo: 'Reeducação alimentar vs dieta: qual a diferença?',
                conteudo: '<p>Um prato colorido garante variedade de nutrientes essenciais. Inclua folhas verdes, legumes alaranjados e proteínas de qualidade. A diversidade de cores indica presença de difenretes vitaminas, minerais e antioxidantes que seu corpo precisa diariamente.</p><p>Experimente incluir pelo menos 5 cores diferentes no almoço e no jantar. Você vai se surpreender com os resultados a médio prazo!</p>',
                tema: 'Reeducação',
                data: '2026-04-03',
                likes: 20,
                img_lateral_b64: '',
                img_fundo_b64: '',
                img_lado: 'esquerda'
            },
            {
                id: 'demo-4',
                titulo: 'Receita: bowl proteico pós-treino',
                conteudo: '<p>Um prato colorido garante variedade de nutrientes essenciais. Inclua folhas verdes, legumes alaranjados e proteínas de qualidade. A diversidade de cores indica presença de difenretes vitaminas, minerais e antioxidantes que seu corpo precisa diariamente.</p><p>Experimente incluir pelo menos 5 cores diferentes no almoço e no jantar. Você vai se surpreender com os resultados a médio prazo!</p>',
                tema: 'Receitas',
                data: '2026-04-03',
                likes: 30,
                img_lateral_b64: '',
                img_fundo_b64: '',
                img_lado: 'esquerda'
            },
            {
                id: 'demo-5',
                titulo: 'Nutrição esportiva: o que comer antes do treino',
                conteudo: '<p>Um prato colorido garante variedade de nutrientes essenciais. Inclua folhas verdes, legumes alaranjados e proteínas de qualidade. A diversidade de cores indica presença de difenretes vitaminas, minerais e antioxidantes que seu corpo precisa diariamente.</p><p>Experimente incluir pelo menos 5 cores diferentes no almoço e no jantar. Você vai se surpreender com os resultados a médio prazo!</p>',
                tema: 'Dicas práticas',
                data: '2026-04-03',
                likes: 12,
                img_lateral_b64: '',
                img_fundo_b64: '',
                img_lado: 'direita'
            },
            {
                id: 'demo-6',
                titulo: 'Como ler rótulos de alimentos sem erro',
                conteudo: '<p>Um prato colorido garante variedade de nutrientes essenciais. Inclua folhas verdes, legumes alaranjados e proteínas de qualidade. A diversidade de cores indica presença de difenretes vitaminas, minerais e antioxidantes que seu corpo precisa diariamente.</p><p>Experimente incluir pelo menos 5 cores diferentes no almoço e no jantar. Você vai se surpreender com os resultados a médio prazo!</p>',
                tema: 'Educação Nutricional',
                data: '2026-04-03',
                likes: 18,
                img_lateral_b64: '',
                img_fundo_b64: '',
                img_lado: 'esquerda'
            },
            ];

            if (err && estadoEl) {
                estadoEl.className = 'blog-estado aviso';
                if (CONFIG_BLOG.APPS_SCRIPT_URL.includes('SEU_DEPLOYMENT_ID_AQUI')) {
                    estadoEl.innerHTML = '⚠️ <strong>Posts de demonstração.</strong> Para ver posts reais, configure a URL do Apps Script no <a href="/admin" style="color: #7a4520; text-decoration: underline;">painel admin</a>.';
                } else {
                    estadoEl.innerHTML = '⚠️ <strong>Erro ao carregar posts.</strong> Mostrando posts de demonstração. Verifique a configuração da API ou tente mais tarde.';
                }
                console.warn('Usando possts demo. Erro:', err);
            } else if (estadoEl) {
                estadoEl.style.display = 'none';
            }
        }

        _blogState.todos = lista;
        _blogState.filtrados = lista;
        renderizarCards(lista, 1);
        renderizarTemas(lista, 'alfabetico');
        renderizarRecentes(lista);
    });

    // Busca com debounce
    if (campoBusca) {
        var buscaDebounced = debounce(function () {
            _blogState.termoBusca = campoBusca.value;
            if (btnLimpar) btnLimpar.style.display = campoBusca.value ? '' : 'none';
            aplicarFiltro();
        }, CONFIG_BLOG.DEBOUNCE_BUSCA_MS);

        campoBusca.addEventListener('input', buscaDebounced);

        // Também reage ao Enter imediatamente
        campoBusca.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                clearTimeout(buscaDebounced._timer);
                _blogState.termoBusca = campoBusca.value;
                aplicarFiltro();
            }
        });
    }

    // Limpar busca
    if (btnLimpar) {
        btnLimpar.addEventListener('click', function () {
            campoBusca.value = '';
            btnLimpar.style.display = 'none';
            _blogState.termoBusca = '';
            aplicarFiltro();
            campoBusca.focus();
        });
    }

    // Ordenar temas
    if (seletor) {
        seletor.addEventListener('change', function () {
            renderizarTemas(_blogState.todos, seletor.value);
        });
    }
}

function inicializarPost() {
    var wrapper = document.getElementById('postConteudoWrapper');
    var carregando = document.getElementById('postCarregando');
    var erroEl = document.getElementById('postErro');

    if (!wrapper) return; // Não é a página do post

    // Lê o ID da URL
    var params = new URLSearchParams(window.location.search);
    var postId = params.get('id');

    if (!postId) {
        mostrarErroPost(carregando, erroEl);
        return;
    }

    // Tenta encontrar no cache da listagem (se vier do blog.html)
    carregarPostPorId(postId, function (err, post) {
        if (err || !post) {
            // Fallback: usa posts de demo para não quebrar a UI
            post = _postsDeDemo().find(function (p) { return p.id === postId; });
        }

        if (!post) {
            mostrarErroPost(carregando, erroEl);
            return;
        }

        renderizarPost(post, carregando, wrapper, erroEl);

        // Carrega posts relacionados (mesmo tema)
        carregarPostsRelacionados(post);
    });
}

function _postsDeDemo() {
    // Compratilha os mesmos dados de demo de inicializarBlog
    // usados como fallback quando a API não está configurada
    return [
        { id: 'demo-1', titulo: 'Como monstar um prato colorido e nutritivo', conteudo: '<p>Um prato colorido garante variedade de nutrientes essenciais.</p>', tema: 'Dicas práticas', data: '2026-04-03', likes: 12, img_fundo_b64: '', img_lateral_b64: '', img_lado: 'esquerda' },
        { id: 'demo-2', titulo: 'Hidratação: Por que água é o melhor suplemento', conteudo: '<p>Antes de investir em suplementos caros, certifique-se de que está bebendo água o suficiente.</p>', tema: 'Hidratação', data: '2026-04-03', likes: 8, img_lateral_b64: '', img_fundo_b64: '', img_lado: 'direita' },
        { id: 'demo-3', titulo: 'Reeducação alimentar vs dieta: qual a diferença?', conteudo: '<p>Dietas restritivas trazem resultados rápidos, mas raramente sustentáveis a longo prazo.</p>', tema: 'Reeducação', data: '2026-04-03', likes: 20, img_lateral_b64: '', img_fundo_b64: '', img_lado: 'direita' },
        { id: 'demo-4', titulo: 'Receita: bowl proteico pós-treino', conteudo: '<p>O pós-treino é o momento ideal para repor proteínas e carboidratos.</p>', tema: 'Receitas', data: '2026-04-03', likes: 30, img_lateral_b64: '', img_fundo_b64: '', img_lado: 'esquerda' }
    ];
}

function mostrarErroPost(carregando, erroEl) {
    if (carregando) carregando.style.display = 'none';
    if (erroEl) erroEl.style.display = 'block';
}

function renderizarPost(post, carregando, wrapper, erroEl) {
    // Atualiza <title> e meta description
    document.title = (post.titulo || 'Post') + ' _ Blog Nutricionista';
    var metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
        var excerpt = (post.conteudo || '').replace(/<[^>]*>/g, '').trim().substring(0, 160);
        metaDesc.setAttribute('content', excerpt);
    }

    // Atualiza Open Graph
    var ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', post.titulo || 'Post');

    // JSON-LD BlogPosting
    var ldEl = document.getElementById('jsonLdPost');
    if (ldEl) {
        ldEl.textContent = JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            'headline': post.titulo || '',
            'datePublished': post.data || '',
            'author': {
                '@type': 'Person',
                'name': 'Mariah Katharine'
            },
            'description': (post.conteudo || '').replace(/<[^>]*>/g, '').trim().substring(0, 200)
        });
    }

    // Preenche header do header da página
    var postTituloHeader = document.getElementById('postTituloHeader');
    if (postTituloHeader) postTituloHeader.textContent = post.titulo || 'Blog';

    // Preenche acmpos do post
    var elTitulo = document.getElementById('postTitulo');
    var elTema = document.getElementById('postTemaBadge');
    var elData = document.getElementById('postData');
    var elTempo = document.getElementById('postTempoLeitura');
    var elAutor = document.getElementById('postAutor');
    var elTexto = document.getElementById('postTexto');

    if (elTitulo) elTitulo.textContent = post.titulo || '';
    if (elTema) elTema.textContent = post.tema || 'Geral';
    if (elData) elData.textContent = formatarData(post.data);
    if (elTempo && elTempo.querySelector('span')) {
        elTempo.querySelector('span').textContent = calcTempoLeitura(post.conteudo || '');
    }
    if (elAutor) elAutor.textContent = 'Mariah (Maia) Katharine - Nutricionista';
    if (elTexto) elTexto.innerHTML = sanitizarHTML(post.conteudo || '');

    // Imagem de fundo semi-transparente
    var fundoEl = document.getElementById('postFundoImg');
    if (fundoEl && post.img_fundo_b64) {
        fundoEl.style.backgroundImage = 'url("' + post.img_fundo_b64 + '")';
        fundoEl.style.display = 'block';
    }

    // Imagem lateral
    var lateralWrapper = document.getElementById('postImgLateral');
    var lateralImg = document.getElementById('postImgLateralEl');
    if (lateralWrapper && lateralImg && post.img_lateral_b64) {
        lateralImg.src = post.img_lateral_b64;
        lateralImg.alt = 'Imagem do post ' + (post.titulo || '');
        lateralWrapper.style.display = 'block';
        if (post.img_lado === 'direita') {
            lateralWrapper.classList.add('direita');
        }
    }

    // Botão voltar ao layout - após imagem lateral
    var layout = document.getElementById('postCorpoLayout');
    if (layout && lateralWrapper && post.img_lateral_b64 && post.img_lado === 'direita') {
        layout.appendChild(lateralWrapper); // Move para depois do texto
    }

    // Likes com toggle - restaura estado local
    var chaveLocal = 'blog_votado_' + post.id;
    var jaVotou = localStorage.getItem(chaveLocal);
    var btnLike = document.getElementById('btnLike');
    var likeCount = document.getElementById('likeCount');

    if (likeCount) likeCount.textContent = post.likes || 0;

    if (jaVotou === 'like' && btnLike) btnLike.setAttribute('aria-pressed', 'true');

    if (btnLike) {
        btnLike.addEventListener('click', function () {
            var votadoAtualmente = localStorage.getItem(chaveLocal);

            if (votadoAtualmente === 'like') {
                // Já votou - remove like (toggle)
                this.setAttribute('aria-pressed', 'false');
                var novoValor = parseInt(likeCount.textContent || 0) - 1;
                if (likeCount) likeCount.textContent = Math.max(0, novoValor);
                localStorage.removeItem(chaveLocal);
                votarPost(post.id, 'unlike'); // Envia unlike ao servidor
            } else {
                // Não votou - adiciona like
                this.setAttribute('aria-pressed', 'true');
                if (likeCount) likeCount.textContent = parseInt(likeCount.textContent || 0) + 1;
                localStorage.setItem(chaveLocal, 'like');
                votarPost(post.id, 'like');
            }
        });
    }

    // Copiar link
    var btnCopiar = document.getElementById('btnCopiarLink');
    if (btnCopiar) {
        btnCopiar.addEventListener('click', function () {
            var span = this.querySelector('span');
            navigator.clipboard.writeText(window.location.href).then(function () {
                if (span) { span.textContent = 'Copiado!'; setTimeout(function () { span.textContent = 'Copiar link'; }, 2000); }
            }).catch(function () {
                // Fallback para navegadores sem clipboard API
                if (span) span.textContent = 'Copie da barra de endereço ou tente em outro navegador.';
                setTimeout(function () { if (span) span.textContent = 'Copiar link'; }, 2500);
            });
        });
    }

    // Compartilhar no whatsapp
    var btnWppCompartilhar = document.getElementById('btnCompartilharWpp');
    if (btnWppCompartilhar) {
        var textoComp = 'Veja este post sobre nutrição: ' + (post.titulo || '') + '_' + window.location.href;
        btnWppCompartilhar.href = 'https://wa.me/?text=' + encodeURIComponent(textoComp);
    }

    // Whastsapp contextual do post (botão no corpo + flutuante)
    var tituloPost = post.titulo || 'um post';
    var wppPost = document.getElementById('btnWppPost');
    var wppFlutu = document.getElementById('wppFlutuantePost');
    var wppBase = 'https://wa.me/' + (window.CONFIG && CONFIG.whatsapp ? CONFIG.whatsapp : '');
    var msgPost = 'Olá Maia, tudo bem? me chamo [SEU NOME] e vim porquê vi o post "' + tituloPost + '" e gostaria de agendar um atendimento.';
    var wppUrl = wppBase + '?text=' + encodeURIComponent(msgPost);

    if (wppPost) { wppPost.href = wppUrl; wppPost.target = '_blank'; wppPost.rel = 'noopener noreferrer'; }
    if (wppFlutu) { wppFlutu.href = wppUrl; wppFlutu.target = '_blank'; wppFlutu.rel = 'noopener noreferrer'; }

    // Exibe o conteúdo
    if (carregando) carregando.style.display = 'none';
    if (wrapper) wrapper.style.display = 'block';
}

function carregarPostsRelacionados(postAtual) {
    var grid = document.getElementById('relacionadosGrid');
    if (!grid) return;

    carregarPosts(function (err, todos) {
        if (err) { todos = _postsDeDemo(); }

        var relacionados = todos.filter(function (p) {
            return p.id !== postAtual.id && p.tema === postAtual.tema;
        }).slice(0, 3);


        if (relacionados.length === 0) {
            var secao = document.getElementById('postsRelacionados');
            if (secao) secao.style.display = 'none';
            return;
        }

        grid.innerHTML = '';

        relacionados.forEach(function (post) {
            var card = document.createElement('a');
            card.className = 'post-card';
            card.href = '/blog/post?id=' + encodeURIComponent(post.id);
            card.setAttribute('aria-label', 'Ler post relacionado: ' + (post.titulo || ''));

            card.innerHTML =
                '<div class="post-card-thumb-placeholder" aria-hidden="true">🥦</div>' +
                '<div class="post-card-corpo">' +
                '<div class="post-card-meta">' +
                '<span class="post-card-tema">' + escapeHTML(post.tema || 'Geral') + '</span>' +
                '<span class="post-card-data">' + formatarData(post.data) + '</span>' +
                '</div>' +
                '<h3 class="post-card-titulo">' + escapeHTML(post.titulo || ' ') + '</h3>' +
                '<span class="post-card-ler">Ler <i class="fas fa-arrow-right" aria-hidden="true"></i></span>' +
                '</div>';

            grid.appendChild(card);
        });
    });
}

document.addEventListener('DOMContentLoaded', function () {
    inicialozarBlog();
    inicializarPost();
});