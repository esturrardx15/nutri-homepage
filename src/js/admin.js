// admin.js - Lógica do Painel Administrativo

var _adminCfg = {
    // Tamanho máximo de imagem ANTES da compressão (200 KB)
    MAX_IMG_BYTES: 200 * 1024,
    // Dimensão máxima (maior lado) após compressão
    MAX_DIM: 800,
    // Qualidade JPEG do canvas
    IMG_QUALITY: 0.72
};

// Cache local de posts
var _adminState = {
    posts: [],
    postEmEdicao: null // id do post em edição (null = novo)
};

// Fetch com timeout (15s)
function fetchComTimeout(url, opcoes, ms) {
    ms = ms || 15000;
    var ctrl = new AbortController();
    var timer = setTimeout(function () { ctrl.abort(); }, ms);
    opcoes = opcoes || {};
    opcoes.signal = ctrl.signal;
    return fetch(url, opcoes).finally(function () { clearTimeout(timer); });
}

function lerCfgApi(){
    return {
        url: localStorage.getItem('admin_api_url') || '',
        token: sessionStorage.getItem('admin_api_token') ||'' // token apenas na sessão (apagado ao fechar aba)
    };
}

function salvarCfgApi(url, token) {
    // Validação mínima de URL
    if (url && !url.startsWith('https://script.google.com/')) return false;
    localStorage.setItem('admin_api_url', url);
    sessionStorage.setItem('admin_api_token', token); // não persiste além da aba
    return true;
}

function mostrarFeedback(elId, tipo, msg) {
    var el = document.getElementById(elId);
    if (!el) return;
    el.className = 'admin-feedback ' + tipo;
    el.innerHTML = msg;
    if (tipo === 'ok') {
        setTimeout(function () {
            el.className = 'admin-feedback info';
            el.textContent = ''; 
        }, 4000);
    }
}

function comprimirImagem(file) {
    return new Promise(function (resolve, reject) {
    if (!file) { resolve(''); return; }

    if (file.size > _adminCfg.MAX_IMG_BYTES) {
        reject(new Error('Imagem muito grande. Máximo: 200 KB'));
        return;
    }

    var reader = new FileReader();
    reader.onload = function (e) {
        var img = new Image();
        img.onload = function () {
            var w = img.width;
            var h = img.height;
            var max = _adminCfg.MAX_DIM;

            if (w > max || h > max) {
                if (w >= h) { h = Math.round(h * max / w); w = max; }
                else { w = Math.round(w * max / h); h = max; }
            }

            var canvas = document.createElement('canvas');
            canvas.width = w;
            canvas.height = h;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, w, h);
            resolve(canvas.toDataURL('image/jpeg', _adminCfg.IMG_QUALITY));
        };
        img.onerror = function () { reject(new Error('Erro ao carregar imagem')); };
        img.src = e.target.result;
    };
    reader.onerror = function () { reject(new Error('Erro ao ler imagem')); };
    reader.readAsDataURL(file);
    });
}

function sanitizarConteudoAdmin(html) {
    var parser = new DOMParser();
    var doc = parser.parseFromString(html, 'text/html');
    doc.querySelectorAll('script, iframe, object, embed, form, style').forEach(function (el) { el.remove(); } );
    doc.querySelectorAll('*').forEach(function (el) {
        Array.from(el.attributes).forEach(function (attr) {
            if (/^on/i.test(attr.name)) el.removeAttribute(attr.name);
            if (attr.name === 'href' && /^javascript:/i.test(attr.value)) el.removeAttribute(attr.name);
        });
    });
    return doc.body.innerHTML
}

function enviarParaApi(payload, callback) {
    var cfg = lerCfgApi();
    if (!cfg.url) {
        callback(new Error('URL da API não configurada. Acesse a seção "Configuração da API" acima.'), null);
        return;
    }
    if (!cfg.token) {
        callback(new Error('Token da API não configurado. Acesse a seção "Configuração da API" acima.'), null);
        return;
    }
    payload.token = cfg.token;

    fetchComTimeout(cfg.url, {
        method: 'POST',
        headers: { 'Content-type': 'text/plain' },
        body: JSON.stringify(payload)
    })
        .then(function (r) {
            if (!r.ok) {
                throw new Error('Erro HTTP ' + r.status + '. Verifique se o Apps Script está deployado corretamente.');
            }
            return r.json();
        })
        .then(function (data) { 
            if (data && data.error) {
                callback(new Error(data.error), null);
            } else {
                callback(null, data);
            }
        })
        .catch(function (err) {
            // Tratamento específico para erros CORS
            if (err.message && err.message.includes('Failed to fetch')) {
                callback(new Error('Erro de conexão (CORS). Verifique se o Apps Script está deployado como "Web App" com acesso "Anyone" e se a URL está correta.'), null);
            } else {
                callback(err, null);
            }
        });
}

function carregarPostsAdmin(callback) {
    var cfg = lerCfgApi();
    if (!cfg.url) { callback(null, []); return; }

    var url = cfg.url + '?action=todos&token=' + encodeURIComponent(cfg.token);
    fetchComTimeout(url)
        .then(function (r) { return r.json(); })
        .then(function (data) { 
            var lista = Array.isArray(data) ? data : (data.posts || []);
            callback(null, lista);
        })
        .catch(function (err) { callback(err, []); });
}

function renderizarTabela(posts) {
    var tbody = document.getElementById('tabelaPostsBody');
    var feedback = document.getElementById('feedbackLista');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (posts.length === 0) {
        if (feedback) { feedback.className = 'admin-feedback info'; feedback.textContent = 'Nenhum post encontrado.'; }
        return;
    }

    if (feedback) { feedback.textContent = ''; }

    posts.forEach(function (post) {
        var tr = document.createElement('tr');
        
        var tdTitulo = document.createElement('td');
        tdTitulo.textContent = post.titulo || '(sem título)' ;

        var tdTema = document.createElement('td');
        tdTema.textContent = post.tema || '';

        var tdStatus = document.createElement('td');
        var badge = document.createElement('span');
        badge.className = 'admin-badge-status ' + (post.status || 'rascunho');
        badge.textContent = post.status === 'publicado' ? '✅ Publicado' : '📝 Rascunho';
        tdStatus.appendChild(badge);

        var tdData = document.createElement('td');
        tdData.textContent = post.data ? post.data.split('T')[0] : '';

        var tdReacoes = document.createElement('td');
        tdReacoes.style.textAlign = 'center';
        tdReacoes.textContent = (post.likes || 0) + '/' + (post.dislikes || 0);

        var tdAcoes = document.createElement('td');
        var divAcoes = document.createElement('div');
        divAcoes.className = 'admin-acoes-row';

        var btnEditar = document.createElement('button');
        btnEditar.className = 'admin-btn-editar';
        btnEditar.textContent = '✏️ Editar';
        btnEditar.addEventListener('click', function () { carregarEdicao(post); });

        var btnToggle = document.createElement('button');
        btnToggle.className = 'admin-btn-toggle-status';
        btnToggle.textContent = post.status === 'publicado' ? '↓ Rascunho' : '↑ Publicar';
        btnToggle.addEventListener('click', function () { toggleStatusPost(post); });

        var btnExcluir = document.createElement('button');
        btnExcluir.className = 'admin-btn-excluir';
        btnExcluir.textContent = '🗑️ Excluir';
        btnExcluir.addEventListener('click', function () { excluirPost(post); });

        divAcoes.appendChild(btnEditar);
        divAcoes.appendChild(btnToggle);
        divAcoes.appendChild(btnExcluir);
        tdAcoes.appendChild(divAcoes);

        tr.appendChild(tdTitulo);
        tr.appendChild(tdTema);
        tr.appendChild(tdStatus);
        tr.appendChild(tdData);
        tr.appendChild(tdReacoes);
        tr.appendChild(tdAcoes);
        tbody.appendChild(tr);
    });
}

function carregarEdicao(post) {
    _adminState.postEmEdicao = post.id;

    var elId = document.getElementById('postId');
    var elTitulo = document.getElementById('postTitulo');
    var elTema = document.getElementById('postTema');
    var novoTema = document.getElementById('novoTema');
    var elStatus = document.getElementById('postStatus');
    var elConteudo = document.getElementById('postConteudo');
    var elH2Editor = document.getElementById('editorTitulo');

    if (elId) elId.value = post.id || '';
    if (elTitulo) elTitulo.value = post.titulo || '';
    if (elStatus) elStatus.value = post.status || 'publicado';
    if (elConteudo) elConteudo.innerHTML = sanitizarConteudoAdmin(post.conteudo || '');
    if (novoTema) novoTema.value = '';
    
    // Seleciona tema no select (se existir)
    if (elTema) {
        var encontrou = false;
        for (var i = 0; i < elTema.options.length; i++) {
            if (elTema.options[i].value === post.tema) {
                elTema.selectedIndex = i;
                encontrou = true;
                break;
            }
        }
        if (!encontrou && novoTema) novoTema.value = post.tema || '';
    }

    if (elH2Editor) elH2Editor.innerHTML = '<i class="fas fa-pen" aria-hidden="true"></i> Editando: ' + (post.titulo || 'Post');

    atualizarPreview();

    // Scroll suave até o editor
    var secao = document.getElementById('secaoEditor');
    if (secao) secao.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function toggleStatusPost(post) {
    var novoStatus = post.status === 'publicado' ? 'rascunho' : 'publicado';
    enviarParaApi({ action: 'update', id: post.id, status: novoStatus}, function (err){
        if (err) { mostrarFeedback('feedbackLista', 'erro', '❌ Erro ao alterar status.'); return; }
        mostrarFeedback('feedbackLista', 'ok', '✅ Status alterado com sucesso.');
        recarregarLista();
    });
}

function excluirPost(post) {
    if (!window.confirm('Excluir o post "' + (post.titulo || 'sem título') + '"? Esta ação não pode ser desfeita.')) return;
    enviarParaApi({ action: 'delete', id: post.id}, function (err) {
        if (err) { mostrarFeedback('feedbackLista', 'erro', '❌ Erro ao excluir post.'); return; }
        mostrarFeedback('feedbackLista', 'ok', '✅ Post excluído.');
        recarregarLista();
    });
}

function recarregarLista() {
    carregarPostsAdmin(function (err, lista){
        if (err) { mostrarFeedback('feedbackLista', 'erro', '❌ Erro ao carregar posts.'); return; }
        _adminState.posts = lista;
        aplicarFiltroAdmin();
        popularSelectTemas(lista);
    });
}

function aplicarFiltroAdmin() {
    var busca = (document.getElementById('adminBusca') || {}).value || '';
    var status = (document.getElementById('adminFiltroStatus') || {}).value || '';

    var filtrados = _adminState.posts.filter(function (p) {
        var buscaOk = !busca || (p.titulo || '').toLowerCase().includes(busca.toLowerCase());
        var statusOk = !status || (p.status || '') === status;
        return buscaOk && statusOk;
    });

    renderizarTabela(filtrados);
}

function popularSelectTemas(posts) {
    var elTema = document.getElementById('postTema');
    if (!elTema) return;

    var temas = [];
    posts.forEach(function (p) { if (p.tema && temas.indexOf(p.tema) === -1) temas.push(p.tema); });
    temas.sort(function (a, b) {return a.localeCompare(b, 'pt'); });

    var valorAtual = elTema.value;
    elTema.innerHTML = '<option value="">Selecione ou crie um tema...</option>';
    temas.forEach(function (t) {
        var opt = document.createElement('option');
        opt.value = t; opt.textContent = t;
        eltTema.appendChild(opt);
    });
    if (valorAtual) elTema.value = valorAtual;
}

function atualizarPreview () {
    var editor = document.getElementById('postConteudo');
    var preview = document.getElementById('previewConteudo');
    if (!editor || !preview) return;
    preview.innerHTML = sanitizarConteudoAdmin(editor.innerHTML);
}

function limparFormulario() {
    _adminState.postEmEdicao = null;

    var campos = ['postId', 'postTitulo'];
    campos.forEach(function (id) { var el = document.getElementById(id); if (el) el.value = ''; });

    var elTema = document.getElementById('postTema');
    if (elTema) elTema.selectedIndex = 0;

    var novoTema = document.getElementById('novoTema');
    if (novoTema) novoTema.value = '';

    var elStatus = document.getElementById('postStatus');
    if (elStatus) elStatus.value = 'publicado';

    var editor = document.getElementById('postConteudo');
    if (editor) editor.innerHTML = '';

    var preview = document.getElementById('previewConteudo');
    if (preview) preview.innerHTML = '';

    var elH2 = document.getElementById('editorTitulo');
    if (elH2) elH2.innerHTML = '<i class="fas fa-pen" aria-hidden="true"></i> Novo post';

    // Limpar imagens
    ['imgFundo', 'imgLateral'].forEach(function (id) {
        var input = document.getElementById(id);
        if (input) input.value = '';
    });
    ['nomeImgFundo', 'nomeImgLateral'].forEach (function (id) {
        var el = document.getElementById(id); if (el) el.textContent = 'Nenhuma imagem';
    });
    ['previewFundo', 'previewLateral'].forEach(function (id){
        var el = document.getElementById(id); if (el) el.style.display = 'none'; 
    });
    ['removerImgFundo', 'removerImgLateral'].forEach(function(id){
        var el = document.getElementById(id); if (el) el.style.display = 'none';
    });

    document.querySelectorAll('.erro-texto.visivel').forEach(function (e) { e.classList.remove('visivel'); });
    mostrarFeedback('feedbackPost', '', '');
}

function configurarFormulario() {
    var form = document.getElementById('formPost');
    if (!form) return;

    var btnPublicar = document.getElementById('btnPublicar');
    var btnRascunho = document.getElementById('btnRascunho');
    var editorEl = document.getElementById('postConteudo');
    
    // Define estado de publicação ao clicar em rascunho
    if (btnRascunho) {
        btnRascunho.addEventListener('click', function () {
            var elStatus = document.getElementById('postStatus');
            if (elStatus) elStatus.value = 'rascunho';
            if (btnPublicar) btnPublicar.click();
        });
    }

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        console.log('=== INÍCIO DO SUBMIT ===');

        // Desabilita botões durante envio
        if (btnPublicar) { btnPublicar.disabled = true; btnPublicar.innerHTML = '<i class=fas fa-spinner fa-spin"></i> Salvando...'; }

        // Captura valores do formulário com validação
        var elPostConteudo = document.getElementById('postConteudo');

        console.log('Tipo de elPostConteudo:', typeof elPostConteudo);
        console.log('elPostConteudo é null?', elPostConteudo === null);
        console.log('elPostConteudo é undefined?', elPostConteudo === undefined);
        console.log('Valor booleano de elPostConteudo:', !!elPostConteudo);
        console.log('Elemento postConteudo: ', elPostConteudo ? 'encontrado' : 'NÃO ENCONTRADO');
        console.log('innerHTML existe?', elPostConteudo && elPostConteudo.innerHTML !== undefined);

        if (!elPostConteudo){
            console.error('ERRO: Encontrado no bloco de erro - elPostConteudo é falsy');
            mostrarFeedback('feedbackPost', 'erro', '❌ Erro: editor de conteúdo não encontrado. Recarregue a página.');
            if (btnPublicar) { btnPublicar.disabled = false; btnPublicar.innerHTML = '<i class="fas fa-paper-plane"></i> Publicar'; }
            return;
        }

        console.log('Passou da validação do elPostConteudo');

        var titulo = (document.getElementById('postTitulo') || {}).value || '';
        var temaSelect = (document.getElementById('postTema') || {}).value || '';
        var novoTema = (document.getElementById('novoTema') || {}).value.trim() || '';
        var tema = novoTema || temaSelect;
        var status = (document.getElementById('postStatus') || {}).value || 'publicado';

        console.log('Tentando sanitizar conteúdo...');
        var conteudo = sanitizarConteudoAdmin(elPostConteudo.innerHTML || '');
        console.log('Conteúdo sanitizado com sucesso');

        var id = (document.getElementById('postId') || {}).value || '';

        console.log('Valores capturados:');
        console.log('- Título:', titulo);
        console.log('- Tema:', tema);
        console.log('- Conteúdo length:', conteudo.length);
        console.log('- Status:', status);

        // Validação
        var valido = true;

        function setErro(idEl, msg) {
            var el = document.getElementById(idEl);
            if (el) {el.textContent = msg; el.classList.add('visivel'); }
            valido = false;
        }

        if (titulo.trim().length < 3) setErro('erroTitulo', 'Título obrigatório (mínimo 3 caracteres).');
        if (!tema.trim()) setErro('erroTema', 'Selecione ou crie um tema.');
        if (!conteudo.trim()) setErro('erroConteudo', 'Conteúdo obrigatório.');

        if (!valido) {
            if (btnPublicar) { btnPublicar.disabled = false; btnPublicar.innerHTML = '<i class="fas fa-paper-plane"></i> Publicar'; }
            return;
        }

        //Limpa erros
        ['erroTitulo', 'erroTema', 'erroConteudo'].forEach(function (id2) {
            var el = document.getElementById(id2);
            if (el) el.classList.remove('visivel');
        });

        // Comprime imagens antes de enviar
        var inputFundo = document.getElementById('imgFundo');
        var inputLateral = document.getElementById('imgLateral');
        var fileFundo = inputFundo && inputFundo.files[0] ? inputFundo.files[0] : null;
        var fileLateral = inputLateral && inputLateral.files[0] ? inputLateral.files[0] : null;
        var imgLado = (document.querySelector('input[name="imgLado"]:checked') || {}).value || 'esquerda';

        var fundoPromise = fileFundo ? comprimirImagem(fileFundo) : Promise.resolve('');
        var lateralPromise = fileLateral ? comprimirImagem(fileLateral) : Promise.resolve('');

        Promise.all([fundoPromise, lateralPromise])
            .then(function (results) {
                var imgFundoB64 = results[0];
                var imgLateralB64 = results[1];

                var payload = {
                    action: id ? 'update' : 'create',
                    id: id || undefined,
                    titulo: titulo.trim(),
                    tema: tema.trim(),
                    conteudo: conteudo,
                    status: status,
                    img_fundo_b64: imgFundoB64,
                    img_lateral_b64: imgLateralB64,
                    img_lado: imgLado
                };

                enviarParaApi(payload, function (err, data){
                    if (btnPublicar) { btnPublicar.disabled = false; btnPublicar.innerHTML = '<i class="fas fa-paper-plane"></i> Publicar'; }

                    if (err) {
                        mostrarFeedback('feedbackPost', 'erro', '❌ Erro ao salvar post: ' + (err.message || 'verifique a configuração da API.'));
                        return;
                    }

                    var acao = id ? 'atualizado' : 'publicado';
                    mostrarFeedback('feedbackPost', 'ok', '✅ Post ' + acao + ' com sucesso!');
                    limparFormulario();
                    recarregarLista();
                });
            })
            .catch(function (err) {
                if (btnPublicar) { btnPublicar.disabled = false; btnPublicar.innerHTML = '<i class="fas fa-paper-plane"></i> Publicar'; }
                var idErro = fileFundo && err ? 'erroImgFundo' : 'erroImgLateral';
                var el = document.getElementById(idErro);
                if (el) el.textContent = err.message; el.classList.add('visivel');
                mostrarFeedback('feedbackPost', 'erro', '❌ ' + (err.message || 'Erro nas imagens.'));
            });
    });
}

function configurarUpload(inputId, nomeId, previewId, previewImgId, removerId, erroId){
    var inputEl = document.getElementById(inputId);
    var nomeEl = document.getElementById(nomeId);
    var previewEl = document.getElementById(previewId);
    var imgEl = document.getElementById(previewImgId);
    var removerEl = document.getElementById(removerId);
    var erroEl = document.getElementById(erroId);

    if (!inputEl) return;

    inputEl.addEventListener('change', function () {
        var file = inputEl.files[0];
        if (!file) return;

        // Limpa erro anterior
        if (erroEl) { erroEl.textContent = ''; erroEl.classList.remove('visivel'); }

        if (file.size > _adminCfg.MAX_IMG_BYTES) {
            if (erroEl) { erroEl.textContent = 'Imagem muito grande. Máximo: 200 KB'; erroEl.classList.add('visivel'); }
            this.value = '';
            return;
        }

        if (nomeEl) nomeEl.textContent = file.name;
        if (removerEl) removerEl.style.display = '';

        // Pré-visualização
        var reader = new FileReader();
        reader.onload = function (e) {
            if (imgEl) imgEl.src = e.target.result;
            if (previewEl) previewEl.style.display = '';
        };
        reader.readAsDataURL(file);
    });

    if (removerEl) {
        removerEl.addEventListener('click', function () {
            if (inputEl) inputEl.value = '';
            if (nomeEl) nomeEl.textContent = 'Nenhuma imagem';
            if (previewEl) previewEl.style.display = 'none';
            if (imgEl) imgEl.src = '';
            this.style.display = 'none';
        });
    }
}

// Retorna o elemento de bloco pai do cursor atual
function _blocoAntesDaSelecao() {
    var sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return null;
    var node = sel.getRangeAt(0).startContainer;
    if (node.nodeType === 3) node = node.parentNode;
    var BLOCOS = ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'DIV', 'BLOCKQUOTE', 'LI'];
    while (node && BLOCOS.indexOf(node.tagName) === -1) node = node.parentNode;
    return node || null;
}

// Envolve (ou remove) seleção inline em <strong> ou <em>
function _envolverInline(tagName) {
    var sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return;
    var range = sel.getRangeAt(0);
    var ancestor = range.commonAncestorContainer;
    if (ancestor.nodeType === 3) ancestor = ancestor.parentNode;
    var jaExiste = ancestor.closest ? ancestor.closest(tagName) : null;
    if (jaExiste) {
        var pai = jaExiste.parentNode;
        while (jaExiste.firstChild) pai.insertBefore(jaExiste.firstChild, jaExiste);
        pai.removeChild(jaExiste);
    } else {
        try {
            var wrapper = document.createElement(tagName);
            range.surroundContents(wrapper);
        } catch (e) {
            // Seleção cruza múltiplos blocos - fallback para execCommand
            document.execCommand(tagName === 'strong' ? 'bold' : 'italic', false, null);
        }
    }
}

// Converte o bloco da seleção para tagName (ou reverte para <p> se já for)
function _formatarBloco(tagName) {
    var bloco = _blocoAntesDaSelecao();
    if (!bloco || !bloco.parentNode) return;
    var destino = bloco.tagName.toLowerCase() === tagName ? 'p' : tagName;
    var novo = document.createElement(destino);
    novo.innerHTML = bloco.innerHTML;
    bloco.parentNode.replaceChild(novo, bloco);
    var sel = window.getSelection();
    var r = document.createRange();
    r.selectNodeContents(novo);
    r.collapse(false);
    sel.removeAllRanges();
    sel.addRange(r);
}

function configurarToolbar() {
    var toolbar = document.querySelector('.admin-toolbar');
    var editor = document.getElementById('postConteudo');
    if (!toolbar || !editor) return;

    toolbar.querySelectorAll('.toolbar-btn').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            editor.focus();
            var cmd = this.getAttribute('data-cmd');

            switch (cmd) {
                case 'bold': _envolverInline('strong'); break;
                case 'italic': _envolverInline('em'); break;
                case 'h2': _formatarBloco('h2'); break;
                case 'h3': _formatarBloco('h3'); break;
                case 'blockquote': _formatarBloco('blockquote'); break;
                case 'ul': document.execCommand('insertUnorderedList'); break;
                case 'ol': document.execCommand('insertOrderedList'); break;
                case 'link':
                    var url = window.prompt('URL do link:');
                    if (url && url.startsWith('https://'))
                    document.execCommand('createLink', false, url);
                    break;
            }

            atualizarPreview();
        });
    });

    editor.addEventListener('input',  atualizarPreview);
    editor.addEventListener('paste', function (){
        setTimeout(atualizarPreview, 50);
    });
}

function configurarToggleSecoes() {
    [['btnToggleConfig', 'configBody'], ['btnToggleEditor', 'editorBody']].forEach(function (par) {
        var btn = document.getElementById(par[0]);
        var body = document.getElementById(par[1]);
        if (!btn || !body) return;

        btn.addEventListener('click', function () {
            var fechado = body.style.display === 'none';
            body.style.display = fechado ? '' : 'none';
            btn.classList.toggle('fechado', !fechado);
            btn.setAttribute('aria-expanded', fechado ? 'true' : 'false');
        });
    });
}

function configurarUiConfig() {
    console.log('Executando configurarUiConfig...');

    var btnSalvar = document.getElementById('btnSalvarConfig');
    var btnTestar = document.getElementById('btnTestarConexao');
    var inputUrl = document.getElementById('adminApiUrl');
    var inputTok = document.getElementById('adminToken');
    var btnVerTok = document.getElementById('btnVerToken');

    console.log('Elementos encontrados:');
    console.log('-btnSalvar: ', btnSalvar ? 'OK' : 'NÃO ENCONTRADO');
    console.log('-btnTestar: ', btnTestar ? 'OK' : 'NÃO ENCONTRADO');
    console.log('-inputUrl: ', inputUrl ? 'OK' : 'NÃO ENCONTRADO');
    console.log('-inputTok: ', inputTok ? 'OK' : 'NÃO ENCONTRADO');
    console.log('-btnVerTok: ', btnVerTok ? 'OK' : 'NÃO ENCONTRADO');

    // Preenche valores salvos
    var cfg = lerCfgApi();
    if (inputUrl) inputUrl.value = cfg.url;
    if (inputTok) inputTok.value = cfg.token;

    if (btnSalvar) {
        btnSalvar.addEventListener('click', function () {
            var url = (inputUrl || {}).value || '';
            var token = (inputTok || {}).value || '';
            var ok = salvarCfgApi(url, token);
            if (ok) {
                mostrarFeedback('feedbackConfig', 'ok', '✅ Configuração salva! Recarregando posts...');
                recarregarLista();
            } else {
                mostrarFeedback('feedbackConfig', 'erro', '❌ URL inválida. Use uma URL do Google Apps Script (https://script.google.com/...).');
            }
        });
    }

    // Testar conexão com o Apps Script
    if (btnTestar) {
        btnTestar.addEventListener('click', function () {
            console.log('Botão testar conexão clicado');

            var url = (inputUrl || {}).value || '';
            var token = (inputTok || {}).value || '';

            console.log('URL: ' + url);
            console.log('Token length: ' + token.length);

            if (!url || !token) {
                mostrarFeedback('feedbackConfig', 'erro', '❌ Preencha a URL e o token para testar a conexão.');
                return;
            }

            // Salvar temorariamente
            salvarCfgApi(url, token);

            btnTestar.disabled = true;
            btnTestar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Testando...';

            console.log('Iniciando teste de conexão com o Apps Script...');

            // Tenta buscar posts para validar conexao e token
            carregarPostsAdmin(function (err, lista) {
                btnTestar.disabled = false;
                btnTestar.innerHTML = '<i class="fas fa-plug"></i> Testar Conexão';

                if (err) {
                    console.error('Erro ao testar conexão:', err);
                    var msgErro = err.message || ' Erro desconhecido';
                    if (msgErro.includes('CORS') || msgErro.includes('Failed to fetch')) {
                        mostrarFeedback('feedbackConfig', 'erro', '❌ Erro de CORS! O Apps Script não está configurado corretamente.');
                    } else if (msgErro.includes('Token inválido')) {
                        mostrarFeedback('feedbackConfig', 'erro', '❌ Token inválido! Verifique o token configurado no Apps Script e no painel.');
                    } else {
                        mostrarFeedback('feedbackConfig', 'erro', '❌ Erro: ' + msgErro);
                    }
                    return;
                }

                console.log('Conexão Ok! Posts encontrados: ' + lista.length);
                mostrarFeedback('feedbackConfig', 'ok', '✅ Conexão bem-sucedida! ' + lista.length + ' post(s) encontrado(s). Apps Script configurado corretamente.');
            });
        });
    }else {
        console.log('Botão testar conexão não encontrado');
    }

    // Mostrar/ocultar token
    if (btnVerTok && inputTok) {
        btnVerTok.addEventListener('click', function () {
            var mostrar = inputTok.type === 'password';
            inputTok.type = mostrar ? 'text' : 'password';
            var icone =  this.querySelector('i');
            if (icone) {
                icone.className = mostrar ? 'fas fa-eye-slash' : 'fas fa-eye';
                }
            this.setAttribute('aria-label', mostrar ? 'Ocultar token' : 'Mostrar token');        
        });
    }
}

function configurarFiltroLista() {
    var inputBusca = document.getElementById('adminBusca');
    var selectFiltro = document.getElementById('adminFiltroStatus');

    if (inputBusca) inputBusca.addEventListener('input', aplicarFiltroAdmin);
    if (selectFiltro) selectFiltro.addEventListener('change', aplicarFiltroAdmin);
}

document.addEventListener('DOMContentLoaded', function () {
    console.log('DOM carregado para página admin');

    // Debug: mostra todos os botoes na página
    var todosBotoes = document.querySelectorAll('button');
    console.log('Total de botões encontrados:', todosBotoes.length);
    console.log('IDs dos botões:', Array.from(todosBotoes).map(function (b) { return b.id || '(sem id)'; }));

    // Só inicializa se for a páginna admin
    document.getElementById('formPost')
    var formPost = document.getElementById('formPost');
    if (!formPost) {
        console.log('Não é a página admin, saindo...');
        return;
    }

    console.log('Inicializando página admin...');


    configurarUiConfig();
    configurarToggleSecoes();
    configurarToolbar();
    configurarFormulario();

    configurarUpload('imgFundo', 'nomeImgFundo', 'previewFundo', 'previewFundoImg', 'removerImgFundo', 'erroImgFundo');
    configurarUpload('imgLateral', 'nomeImgLateral', 'previewLateral', 'previewLateralImg', 'removerImgLateral', 'erroImgLateral');

    configurarFiltroLista();

    var btnNovo = document.getElementById('btnNovoPost');
    if (btnNovo) { 
        btnNovo.addEventListener('click', limparFormulario);
    } else {
        console.warn('Botão Novo Post não encontrado');
    }

    //Carrega posts da API (se configurada)
    recarregarLista();

    console.log('Inicialização completa!');
});
