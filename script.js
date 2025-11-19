// -------------------------------
// 1) LÓGICA DE CORES LITÚRGICAS
// -------------------------------
function getCorLiturgica(cor) {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    switch ((cor || '').toLowerCase()) {
        case 'verde': return isDark ? '#00AA00' : '#007700';
        case 'roxo': return isDark ? '#9370DB' : '#4B0082';
        case 'branco': return isDark ? '#E8E8E8' : '#DCDCDC';
        case 'vermelho': return isDark ? '#DC143C' : '#B22222';
        case 'rosa': return isDark ? '#FF69B4' : '#C71585';
        case 'preto': return isDark ? '#888888' : '#2C2C2C';
        case 'marrom': return isDark ? '#A0522D' : '#8B4513';
        default: return isDark ? '#A0522D' : '#8B4513';
    }
}

// -------------------------------
// 2) TEMA (modo claro por padrão; só muda quando o usuário alternar)
// -------------------------------
function aplicarTema(tema) {
    document.documentElement.setAttribute('data-theme', tema);
    localStorage.setItem('theme', tema);
    // Reaplica cor litúrgica quando mudar tema
    const corAtual = window.corLiturgicaAtual;
    if (corAtual) {
        const novaCor = getCorLiturgica(corAtual);
        document.documentElement.style.setProperty('--cor-primaria', novaCor);
        document.documentElement.style.setProperty('--cor-botao-hover', novaCor);
    }
}
const temaSalvo = localStorage.getItem('theme') || 'light';
aplicarTema(temaSalvo);

// -------------------------------
// 3) VERIFICAÇÃO DE COMPATIBILIDADE DE FALA
// -------------------------------

// Elementos do aviso de compatibilidade
const msgCompat = document.getElementById('mensagem-compatibilidade');
const textoCompat = document.getElementById('texto-compat');
const btnFecharCompat = document.getElementById('fechar-compat');
const btnAudio = document.getElementById('btn-audio');

const synthesis = window.speechSynthesis || null;

// Fechar aviso
btnFecharCompat.onclick = () => msgCompat.classList.add('hidden');

// -------------------------------
// ÁUDIO
// -------------------------------
let utterance = null;
let falando = false;

function configurarVozDoSistema(u) {
    const voices = synthesis.getVoices();
    const voice = voices.find(v => v.lang.includes('pt-BR')) ||
                  voices.find(v => v.lang.includes('pt')) ||
                  voices[0];
    u.voice = voice;
    u.lang = 'pt-BR';
    u.rate = 0.92;
    u.pitch = 1.0;
}

function pararLeitura() {
    if (falando && synthesis?.speaking) synthesis.cancel();
    falando = false;
    btnAudio.textContent = '🔊 Ouvir';
    btnAudio.classList.remove('stopping');
}

function lerPagina() {
    const pagina = document.querySelector('.pagina:not(.hidden)');
    if (!pagina) return;

    const texto = pagina.innerText.trim();
    if (!texto) return;

    pararLeitura();

    utterance = new SpeechSynthesisUtterance(texto);
    configurarVozDoSistema(utterance);

    utterance.onstart = () => {
        falando = true;
        btnAudio.textContent = '⏹ Parar';
        btnAudio.classList.add('stopping');
    };
    utterance.onend = pararLeitura;
    utterance.onerror = pararLeitura;

    synthesis.speak(utterance);
}

if (synthesis)
    synthesis.onvoiceschanged = () => utterance && configurarVozDoSistema(utterance);

// -------------------------------
// BOTÃO DE ÁUDIO (agora com aviso)
// -------------------------------

btnAudio.onclick = () => {
    if (!synthesis) {
        textoCompat.textContent = "⚠️ Seu navegador não suporta leitura em voz alta.";
        msgCompat.classList.remove('hidden');
        return;
    }

    falando ? pararLeitura() : lerPagina();
};

// -------------------------------
// Parar áudio ao navegar
// -------------------------------
['btn-anterior', 'btn-proximo'].forEach(id => {
    const el = document.getElementById(id);
    el && el.addEventListener('click', pararLeitura);
});

document.getElementById('abas-navegacao')
    ?.addEventListener('click', e => e.target.tagName === 'LI' && pararLeitura());

document.getElementById('rodape-nav')
    ?.addEventListener('click', e => e.target.tagName === 'LI' && pararLeitura());

// Função dummy para compatibilidade com o restante do código
function iniciarAudioAcessibilidade() { return true; }

// -------------------------------
// 4) VIEW SWITCH (rodapé)
// -------------------------------
const mainViews = document.querySelectorAll('main');
const rodapeNavItems = document.querySelectorAll('#rodape-nav li');
function switchMainView(viewId) {
    mainViews.forEach(v => v.classList.add('hidden'));
    const el = document.getElementById(viewId);
    if (el) el.classList.remove('hidden');
    rodapeNavItems.forEach(i => i.classList.toggle('active', i.dataset.view === viewId));
    pararLeitura(); 
}
rodapeNavItems.forEach(i => i.addEventListener('click', () => switchMainView(i.dataset.view)));

// -------------------------------
// 5) LÓGICA DA LITURGIA (base do primeiro código) COM ADIÇÃO DO SELETOR DE DATA
// -------------------------------
async function iniciarAppLiturgia() {
    const header = document.getElementById('cabecalho');
    const containerPaginas = document.getElementById('conteudo-paginas');
    const btnAnterior = document.getElementById('btn-anterior');
    const btnProximo = document.getElementById('btn-proximo');
    const contadorPaginaEl = document.getElementById('contador-pagina');
    const navegacaoEl = document.getElementById('navegacao');
    const btnBuscar = document.getElementById('btn-buscar');
    const campoData = document.getElementById('data-liturgia');

    // Função de busca: tenta dois formatos.
    async function buscarLiturgia(dateIso = null, usePathFormat = false) {
        // dateIso esperado: 'YYYY-MM-DD'
        let url;
        if (dateIso) {
            if (usePathFormat) {
                // Segunda versão do código usava /v2/DD-MM-AAAA
                const partes = dateIso.split('-'); // [YYYY,MM,DD]
                if (partes.length === 3) {
                    const dataFormatada = `${partes[2]}-${partes[1]}-${partes[0]}`; // DD-MM-YYYY
                    url = `https://liturgia.up.railway.app/v2/${dataFormatada}`;
                } else {
                    url = `https://liturgia.up.railway.app/v2/?date=${dateIso}`;
                }
            } else {
                url = `https://liturgia.up.railway.app/v2/?date=${dateIso}`;
            }
        } else {
            // Sem data: usa o formato de query param com a data atual (YYYY-MM-DD)
            url = `https://liturgia.up.railway.app/v2/?date=${new Date().toISOString().slice(0, 10)}`;
        }

        const loadingMessage = document.getElementById('loading-message');
        try {
            const resp = await fetch(url);
            if (!resp.ok) throw new Error(`Erro na API: ${resp.statusText}`);
            const data = await resp.json();
            if (loadingMessage) loadingMessage.style.display = 'none';
            return data;
        } catch (e) {
            console.error('Erro ao buscar liturgia com URL:', url, e);
            if (loadingMessage) loadingMessage.innerHTML = `<p>Não foi possível carregar a liturgia.</p><p><small>Verifique sua conexão ou tente novamente mais tarde.</small></p>`;
            return null;
        }
    }

    // Evento do botão Buscar (usa o formato de path para máxima compatibilidade)
    if (btnBuscar && campoData) {
        btnBuscar.addEventListener('click', async () => {
            const val = campoData.value; // formato YYYY-MM-DD
            if (!val) return;
            // tenta primeiro com o formato /v2/DD-MM-AAAA (como no segundo código)
            const novos = await buscarLiturgia(val, true);
            if (novos) {
                atualizarLiturgia(novos, val);
            } else {
                // fallback: tenta via query param YYYY-MM-DD
                const fallback = await buscarLiturgia(val, false);
                if (fallback) atualizarLiturgia(fallback, val);
            }
        });
    }

    // Buscar inicial (hoje)
    const dados = await buscarLiturgia();
    if (!dados) return;
    atualizarLiturgia(dados);

    // atualizarLiturgia agora pode receber selectedIso para sincronizar o campo de data
    function atualizarLiturgia(dados, selectedIso = null) {
        // guarda cor litúrgica globalmente (para reaplicar ao trocar tema)
        window.corLiturgicaAtual = dados.cor;
        const corLiturgica = getCorLiturgica(dados.cor);
        document.documentElement.style.setProperty('--cor-primaria', corLiturgica);
        document.documentElement.style.setProperty('--cor-botao-hover', corLiturgica);

        let paginaAtualHeader = 0;
        const paginasHeader = [];
        const titulosPaginasHeader = [];

        function formatarTextoComQuebras(texto) { return texto.replace(/\n/g, '<br>'); }

        header.innerHTML = `<h1>Liturgia Diária</h1><h2>${dados.data} - ${dados.cor}</h2><p><strong>${dados.liturgia}</strong></p><nav id="abas-navegacao"></nav>`;

        // Monta páginas (mesma estrutura do primeiro)
        titulosPaginasHeader.push('Ritos Iniciais');
        paginasHeader.push(`<div class="pagina"><h3>Antífona de Entrada</h3><p>${dados.antifonas.entrada}</p><h3>Oração da Coleta</h3><p>${dados.oracoes.coleta}</p></div>`);
        const pLeitura = dados.leituras.primeiraLeitura[0];
        titulosPaginasHeader.push('1ª Leitura');
        paginasHeader.push(`<div class="pagina"><h3>${pLeitura.titulo} (${pLeitura.referencia})</h3><p>${pLeitura.texto}</p></div>`);
        const salmo = dados.leituras.salmo[0];
        titulosPaginasHeader.push('Salmo');
        paginasHeader.push(`<div class="pagina"><h3>Salmo (${salmo.referencia})</h3><p class="refrao-salmo">R.: ${salmo.refrao}</p><p>${formatarTextoComQuebras(salmo.texto)}</p></div>`);
        if (dados.leituras.segundaLeitura.length > 0) {
            const sLeitura = dados.leituras.segundaLeitura[0];
            titulosPaginasHeader.push('2ª Leitura');
            paginasHeader.push(`<div class="pagina"><h3>${sLeitura.titulo} (${sLeitura.referencia})</h3><p>${sLeitura.texto}</p></div>`);
        }
        const evangelho = dados.leituras.evangelho[0];
        titulosPaginasHeader.push('Evangelho');
        paginasHeader.push(`<div class="pagina"><h3>${evangelho.titulo} (${evangelho.referencia})</h3><p>${evangelho.texto}</p></div>`);
        titulosPaginasHeader.push('Ritos Finais');
        paginasHeader.push(`<div class="pagina"><h3>Oração sobre as Oferendas</h3><p>${dados.oracoes.oferendas}</p><h3>Antífona da Comunhão</h3><p>${dados.antifonas.comunhao}</p><h3>Oração depois da Comunhão</h3><p>${dados.oracoes.comunhao}</p></div>`);

        const abasContainer = document.getElementById('abas-navegacao');

        function montarAbas() { abasContainer.innerHTML = `<ul>${titulosPaginasHeader.map((t, i) => `<li data-index="${i}">${t}</li>`).join('')}</ul>`; }

        function renderizarPagina() {
            containerPaginas.innerHTML = paginasHeader.join('');
            const paginasEls = containerPaginas.querySelectorAll('.pagina');
            paginasEls.forEach((pag, i) => pag.classList.toggle('hidden', i !== paginaAtualHeader));
            const abasLis = abasContainer.querySelectorAll('li');
            abasLis.forEach((aba, i) => aba.classList.toggle('active', i === paginaAtualHeader));
            contadorPaginaEl.textContent = `Página ${paginaAtualHeader + 1} de ${paginasHeader.length}`;
            btnAnterior.disabled = (paginaAtualHeader === 0);
            btnProximo.disabled = (paginaAtualHeader === paginasHeader.length - 1);
        }

        // evita múltiplos listeners ao re-renderizar
        abasContainer.addEventListener('click', e => { if (e.target.tagName === 'LI') { paginaAtualHeader = parseInt(e.target.dataset.index); renderizarPagina(); } });
        btnProximo.addEventListener('click', () => { if (paginaAtualHeader < paginasHeader.length - 1) { paginaAtualHeader++; renderizarPagina(); } });
        btnAnterior.addEventListener('click', () => { if (paginaAtualHeader > 0) { paginaAtualHeader--; renderizarPagina(); } });

        montarAbas();
        navegacaoEl.classList.remove('hidden');
        renderizarPagina();

        // Sincroniza o campo de data com a data selecionada (se houver)
        try {
            if (selectedIso && document.getElementById('data-liturgia')) {
                document.getElementById('data-liturgia').value = selectedIso;
            }
        } catch (e) { /* não crítico */ }

        // Inicializa áudio agora que a página existe
        iniciarAudioAcessibilidade();
    }
}

// -------------------------------
// 6) CATEQUESE (mantido do segundo código, com correção de strings de embed)
//-------------------------------

// ➜ Função auxiliar: converte "PT1M23S" para segundos
function parseISODuration(duration) {
    if (!duration) return 0; // se vier null, ignora

    const regex = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/;
    const parts = duration.match(regex);

    if (!parts) return 0; // se falhar o regex, retorna 0

    const hours = parseInt(parts[1] || 0);
    const minutes = parseInt(parts[2] || 0);
    const seconds = parseInt(parts[3] || 0);

    return (hours * 3600) + (minutes * 60) + seconds;
}


async function renderizarCatequeseView() {
    const API_KEY = "API_KEY";

    // ➜ Coloque aqui os 4 IDs dos canais
    const CHANNELS_IDS = [
        "UCP6L9TPS3pHccVRiDB_cvqQ",
        "UCCe8O_s9LIEkNJNzosfw7_A",
        "UCVUF9JPOd1hvDGawIhfHuGQ",
        "UCcKzq1UyCeNnzgAE26bwBOw"
    ];

    const videosContainer = document.getElementById("videos-container");
    videosContainer.innerHTML = "<p>Carregando vídeos...</p>";

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let resultadosFinais = [];

    try {
        for (let channelId of CHANNELS_IDS) {

            // ➜ 1. Buscar uploads playlist do canal
            const channelRes = await fetch(
                `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channelId}&key=${API_KEY}`
            );
            const channelData = await channelRes.json();

            const uploadsPlaylistId =
                channelData.items[0].contentDetails.relatedPlaylists.uploads;

            // ➜ 2. Buscar os 20 vídeos mais recentes
            const playlistRes = await fetch(
                `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=20&key=${API_KEY}`
            );
            const playlistData = await playlistRes.json();

            // Lista de videoIds
            const videoIds = playlistData.items.map(i => i.snippet.resourceId.videoId);

            // ➜ 3. Buscar detalhes dos vídeos (para pegar duração)
            const videosRes = await fetch(
                `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoIds.join(",")}&key=${API_KEY}`
            );
            const videosInfo = await videosRes.json();

            // ➜ 4. Filtrar Shorts (duração <= 60s)
            const videosComuns = videosInfo.items.filter(video => {
                const duration = video.contentDetails.duration;
                const seconds = parseISODuration(duration);
                return seconds > 180; // vídeo comum
            });

            // ➜ 5. Separar vídeos do mês atual
            const videosDoMes = videosComuns.filter(v => {
                const d = new Date(v.snippet.publishedAt);
                return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
            });

            let escolhido;

            if (videosDoMes.length > 0) {
                // pegar o mais recente do mês
                escolhido = videosDoMes.sort((a, b) =>
                    new Date(b.snippet.publishedAt) - new Date(a.snippet.publishedAt)
                )[0];
            } else {
                // fallback → pegar o mais recente geral
                escolhido = videosComuns.sort((a, b) =>
                    new Date(b.snippet.publishedAt) - new Date(a.snippet.publishedAt)
                )[0];
            }

            if (escolhido) resultadosFinais.push(escolhido);
        }

        // ➜ Renderizar
        videosContainer.innerHTML = "";

        resultadosFinais.forEach(video => {
            const videoId = video.id;
            const embedSrc = `https://www.youtube.com/embed/${videoId}`;

            videosContainer.innerHTML += `
                <div class="video-container">
                    <iframe 
                        src="${embedSrc}"
                        frameborder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowfullscreen>
                    </iframe>
                </div>
            `;
        });

    } catch (e) {
        console.error("Erro:", e);
        videosContainer.innerHTML = "<p>Erro ao carregar vídeos.</p>";
    }
}






// -------------------------------
// 7) CONFIGURAÇÕES (toggle de tema sincronizado)
// -------------------------------
function renderizarConfiguracoesView() {
    const configContainer = document.getElementById('config-container');
    configContainer.innerHTML = `
    <div class="theme-switch-wrapper">
        <span>Modo Escuro</span>
        <label class="theme-switch">
            <input type="checkbox" id="theme-switch-checkbox">
            <span class="slider round"></span>
        </label>
    </div>`;
    const themeCheckbox = document.getElementById('theme-switch-checkbox');
    themeCheckbox.checked = (localStorage.getItem('theme') === 'dark');
    themeCheckbox.addEventListener('change', e => aplicarTema(e.target.checked ? 'dark' : 'light'));
}

// -------------------------------
// 8) INICIALIZAÇÃO GERAL
// -------------------------------
iniciarAppLiturgia();
renderizarCatequeseView();
renderizarConfiguracoesView();
// Define a view inicial como Liturgia
switchMainView('view-liturgia');
