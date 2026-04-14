/*  Codigo.gs - Google Apps Script para o Blog
    Copie este código no Google Apps Script e faça deploy
    como "Web App" com acesso "Qualquer pessoa".

    ESTRUTURA DA PLANILHA:
    Aba "posts" - colunas:
    A: id | B: titulo | C: conteudo | D: tema
    E: data | F: status | G: likes | H: dislikes
    I: img_fundo_b64 | J: img_lateral_b64 | K: img_lado

    Aba "config" - coluna A: chave | B: valor
    (ex: "token" | "sua_senha_secreta")
*/

/* UTILITARIOS */

var SHEET_ID = SpreadsheetApp.getActiveSpreadsheet().getId();
var ABA_POSTS = 'posts';
var ABA_CONFIG = 'config';

function getAba(nome) {
    var ss = SpreadsheetApp.openById(SHEET_ID);
    var aba = ss.getSheetByName(nome);
    if (!aba) {
        aba = ss.insertSheet(nome);
    if (nome === ABA_POSTS) {
        aba.getRange(1, 1, 1, 11).setValues([[
            'id', 'titulo', 'conteudo', 'tema', 'data', 'status', 'likes',
            'dislikes', 'img_fundo_b64', 'img_lateral_b64', 'img_lado'
        ]]);
    }
    if (nome === ABA_CONFIG) {
        aba.getRange(1, 1, 2, 2).setValues([['token', 'TROQUE_ESTA_SENHA'],['criado','sim']]);
    }
}
return aba;
}

function getToken() {
    var aba = getAba(ABA_CONFIG);
    var dados = aba.getDataRange().getValues();
    for (var i = 0; i < dados.length; i++) {
        if (dados[i][0] === 'token') return String(dados[i][1]);
    }
    return '';
}

function validarToken(token) {
    return token && token === getToken();
}

function gerarId() {
    return 'post_' + new Date().getTime() + '_' + Math.floor(Math.random() * 9999);
}

function jsonResponse(obj) {
    var output ContentService
        .createTextOutput(JSON.stringify(obj));
        output.setMimeType(ContentService.MimeType.JSON);
        // Headers CORS são adicionados automaticamente pelo Apps Script quando deployado com Web App
        return output;
}

function dadosParaObjeto(cabecalho, linha) {
    var obj = {};
    for (var c = 0; c < cabecalho.length; c++) {
        obj[cabecalho[c]] = linha[c] !== undefined ? linha[c] : '';
    }
    return obj;
}

/*  PROTEÇÃO BRUTE-FORCE (PropertiesService)
    Máx. 10 tentativas inválidas de token em 15 minutos.
*/

var _CHAVE_BF = 'bf_falhas';
var _CHAVE_VOTOS = 'votos_';
var _JANELA_BF_MS = 15 * 60 * 1000; // 15 minutos
var _MAX_FALHAS = 10;
var _MAX_VOTOS_DIA = 100; // por post por dia (UTC)

function _getProps() {
    return PropertiesService.getScriptProperties();
}

function _verificarBloqueio() {
    var agora = Date.now();
    var raw = _getProps().getProperty(_CHAVE_BF) || '[]';
    var falhas;
    try { falhas = JSON.parse(raw); } catch (e) { falhas = []; }
    var recentes = falhas.filter(function(t) { return agora - t < _JANELA_BF_MS; });
    return recentes.length >= _MAX_FALHAS;
}

function _registrarFalha() {
    var agora = Date.now();
    var props = _getProps();
    var raw = props.getProperty(_CHAVE_BF) || '[]';
    var falhas;
    try { falhas = JSON.parse(raw); } catch (e) { falhas = []; }
    falhas = falhas.filter(function(t) { return agora - t < _JANELA_BF_MS; });
    falhas.push(agora);
    props.setProperty(_CHAVE_BF, JSON.stringify(falhas));
}

function _resetarFalhas() {
    _getProps().deleteProperty(_CHAVE_BF);
}

/*  RATE-LIMIT DE VOTOS (PropertiesService)
    Máx. 100 votos por post por dia (data UTC).
*/

function _verificarRateVoto(postId) {
    var chave = _CHAVE_VOTOS + String(postId) + '_' + new Date().toISOString().slice(0, 10);
    var props = _getProps();
    var total = parseInt(props.getProperty(chave) || '0', 10);
    if (total >= _MAX_VOTOS_DIA) return false;
    props.setProperty(chave, String(total + 1));
    return true;
}

/*  doGet - leitura de posts
    Parâmetros:
    ?action=posts_publicados -> retorna lista de posts publicados
    ?action=post&id=XXX -> retorna post único por id
    ?action=todos&token=XXX -> retorna todos (admin)
*/

function doGet(e) {
    try {
        var params = e.parameter || {};
        var action = params.action || 'posts_publicados';
        var aba = getAba(ABA_POSTS);
        var dados = aba.getDataRange().getValues();
        var cabecalho = dados[0];
        var linhas = dados.slice(1);

        if (action === 'posts_publicados') {
            var publicados = linhas
                .filter(function(l) { return l[5] === 'publicado'; })
                .map(function(l) { return dadosParaObjeto(cabecalho, l); });
            return jsonResponse(publicados);
    }

    if (action === 'post') {
        var idBuscado = params.id || '';
        var encontrado = null;
        for (var i = 0; i < linhas.length; i++) {
            if (String(linhas[i][0]) === idBuscado && linhas[i][5] === 'publicado') {
                encontrado = dadosParaObjeto(cabecalho, linhas[i]);
                break;
            }
        }
        if (!encontrado) return jsonResponse({ erro: 'Post não encontrado' });
        return jsonResponse(encontrado);
    }

    if (action === 'todos') {
        if (_verificarBloqueio()) return jsonResponse({ erro: 'Muitas tentativas. Aguarde 15 minutos.' });
        if (!validarToken(params.token)) {
            _registrarFalha();
            return jsonResponse({ erro: 'Token inválido' });
        }
        _resetarFalhas();
        var todos = linhas.map(function(l) { return dadosParaObjeto(cabecalho, l); });  
        return jsonResponse(todos);
    }

    return jsonResponse({ erro: 'Ação desconhecida.' });

    } catch(err) {
        return jsonResponse({ erro: err.message });
    
    }
}

/*  doPost - criação, edição, exclusão, votos
    PayLoad JSON no corpo da requisição (Content-Type: text/plain):
    Campos obrigatórios: action, token
*/

function doPost(e) {
    try {
        var corpo;
        try { corpo = JSON.parse(e.postData.contents); } 
        catch(x) { return jsonResponse({ erro: 'JSON inválido' }); }

        var action = corpo.action || '';
        
        // Votos não exigem token (ação pública)
        if (action === 'votar') {
            return processarVoto(corpo);
        }
        
        // Todas as outras ações exigem token
        if (_verificarBloqueio()) {
            return jsonResponse({ erro: 'Muitas tentativas. Aguarde 15 minutos.' });
        }
        if (!validarToken(corpo.token)) {
            _registrarFalha();
            return jsonResponse({ erro: 'Token inválido' });
        }
        _resetarFalhas();

        if (action === 'create') return criarPost(corpo);
        if (action === 'update') return atualizarPost(corpo);
        if (action === 'delete') return excluirPost(corpo);

        return jsonResponse({ erro: 'Ação desconhecida.' });

    } catch(err) {
        return jsonResponse({ erro: err.message });
    }
}

/*  VOTAR (like / dislike) */

function processarVoto(corpo) {
    var id = String(corpo.id || '');
    var tipo = String(corpo.tipo || '');

    if (!id || (tipo !== 'like' && tipo !== 'dislike')) {
        return jsonResponse({ erro: 'Parâmetros inválidos' });
    }

    if (!_verificarRateVoto(id)) {
        return jsonResponse({ erro: 'Limite de votos atingido por hoje.' });
    }

    var aba = getAba(ABA_POSTS);
    var dados = aba.getDataRange().getValues();
    for (var i = 1; i < dados.length; i++) {
        if (String(dados[i][0]) === id) {
            var colLike = 7; // coluna G (index 6) = likes
            var colDislike = 8; // coluna H (index 7) = dislikes
            var likes = parseInt(dados[i][6]) || '0';
            var dislikes = parseInt(dados[i][7]) || '0';

            if (tipo === 'like') {
                likes++;
                aba.getRange(i + 1, colLike + 1).setValue(likes);
                } else {
                dislikes++;
                aba.getRange(i + 1, colDislike).setValue(dislikes);
                }
            return jsonResponse({ ok: true, likes: likes, dislikes: dislikes });
        }
    }
    return jsonResponse({ erro: 'Post não encontrado' });
}


/*  CRIAR POST */

function criarPost(corpo) {
    var aba = getAba(ABA_POSTS);
    var id = gerarId();
    var agora = new Date().toISOString();

    aba.appendRow([
        id,
        String(corpo.titulo || ''),
        String(corpo.conteudo || ''),
        String(corpo.tema || 'Geral'),
        agora,
        String(corpo.status || 'publicado'),
        0, // likes
        0, // dislikes
        String(corpo.img_fundo_b64 || ''),
        String(corpo.img_lateral_b64 || ''),
        String(corpo.img_lado || 'esquerda')
    ]);
    return jsonResponse({ ok: true, id: id });
}
    
/*  ATUALIZAR POST */

function atualizarPost(corpo) {
    var id = String(corpo.id || '');
    var aba = getAba(ABA_POSTS);
    var dados = aba.getDataRange().getValues();

    for (var i = 1; i < dados.length; i++) {
        if (String(dados[i][0]) === id) {
            var linha = i + 1;
            // Atualiza apenas campos enviados
            if (corpo.titulo !== undefined) aba.getRange(linha, 2).setValue(String(corpo.titulo));
            if (corpo.conteudo !== undefined) aba.getRange(linha, 3).setValue(String(corpo.conteudo));
            if (corpo.tema !== undefined) aba.getRange(linha, 4).setValue(String(corpo.tema));
            if (corpo.status !== undefined) aba.getRange(linha, 6).setValue(String(corpo.status));
            if (corpo.img_fundo_b64 !== undefined) aba.getRange(linha, 9).setValue(String(corpo.img_fundo_b64));
            if (corpo.img_lateral_b64 !== undefined) aba.getRange(linha, 10).setValue(String(corpo.img_lateral_b64));
            if (corpo.img_lado !== undefined) aba.getRange(linha, 11).setValue(String(corpo.img_lado));
            return jsonResponse({ ok: true });
        }
    }
    return jsonResponse({ erro: 'Post não encontrado' });
}

/*  EXCLUIR POST */

function excluirPost(corpo) {
    var id = String(corpo.id || '');
    var aba = getAba(ABA_POSTS);
    var dados = aba.getDataRange().getValues();

    for (var i = 1; i < dados.length; i++) {
        if (String(dados[i][0]) === id) {
            aba.deleteRow(i + 1);
            return jsonResponse({ ok: true });
        }
    }
    return jsonResponse({ erro: 'Post não encontrado' });
}
            