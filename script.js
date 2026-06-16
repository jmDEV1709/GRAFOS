const canvas = document.getElementById("grafo");
const ctx = canvas.getContext("2d");

// ===== BAIRROS DE MARICÁ (vértices) =====
const vertices = {
    "Itaipuaçu":   { x: 110, y: 380, label: "Itaipuaçu" },
    "Flamengo":    { x: 240, y: 200, label: "Flamengo" },
    "Inoã":        { x: 320, y: 380, label: "Inoã" },
    "São José":    { x: 470, y: 250, label: "São José" },
    "Centro":      { x: 470, y: 430, label: "Centro" },
    "Araçatiba":   { x: 620, y: 150, label: "Araçatiba" },
    "Bambuí":      { x: 650, y: 350, label: "Bambuí" },
    "Ponta Negra": { x: 800, y: 280, label: "Ponta Negra" }
};

// ===== ARESTAS (ruas) com 3 tipos de peso =====
// {distância em km, tempo em min, nível de trânsito 1-10}
const arestas = [
    { de: "Itaipuaçu",  para: "Flamengo",    distancia: 8,  tempo: 15, transito: 4 },
    { de: "Itaipuaçu",  para: "Inoã",        distancia: 6,  tempo: 12, transito: 3 },
    { de: "Flamengo",   para: "São José",    distancia: 7,  tempo: 14, transito: 5 },
    { de: "Flamengo",   para: "Araçatiba",   distancia: 12, tempo: 22, transito: 6 },
    { de: "Inoã",       para: "São José",    distancia: 5,  tempo: 10, transito: 4 },
    { de: "Inoã",       para: "Centro",      distancia: 9,  tempo: 18, transito: 7 },
    { de: "São José",   para: "Centro",      distancia: 4,  tempo: 8,  transito: 6 },
    { de: "São José",   para: "Araçatiba",   distancia: 6,  tempo: 11, transito: 3 },
    { de: "São José",   para: "Bambuí",      distancia: 7,  tempo: 13, transito: 5 },
    { de: "Centro",     para: "Bambuí",      distancia: 5,  tempo: 9,  transito: 4 },
    { de: "Araçatiba",  para: "Bambuí",      distancia: 6,  tempo: 12, transito: 3 },
    { de: "Araçatiba",  para: "Ponta Negra", distancia: 9,  tempo: 16, transito: 2 },
    { de: "Bambuí",     para: "Ponta Negra", distancia: 7,  tempo: 13, transito: 3 }
];

// ===== ESTADO =====
let modoAtual = "distancia";
let origem = null;
let destino = null;
let caminhoAtual = [];
let passosLog = [];

const unidades = {
    distancia: { sufixo: "km", nome: "Distância" },
    tempo:     { sufixo: "min", nome: "Tempo" },
    transito:  { sufixo: "", nome: "Trânsito" }
};

// ===== CONSTRÓI GRAFO PARA O MODO ATUAL =====
function construirGrafo() {
    const grafo = {};
    for (const v in vertices) grafo[v] = {};
    for (const a of arestas) {
        grafo[a.de][a.para] = a[modoAtual];
        grafo[a.para][a.de] = a[modoAtual];
    }
    return grafo;
}

// ===== DESENHO =====
function desenharAresta(v1, v2, peso, cor = "rgba(255,255,255,0.35)", largura = 3, destaque = false) {
    const a = vertices[v1];
    const b = vertices[v2];

    if (destaque) {
        ctx.shadowColor = "#FFC74B";
        ctx.shadowBlur = 20;
    }

    ctx.strokeStyle = cor;
    ctx.lineWidth = largura;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Caixa do peso
    const mx = (a.x + b.x) / 2;
    const my = (a.y + b.y) / 2;
    ctx.fillStyle = "#0C223E";
    ctx.strokeStyle = "#FFC74B";
    ctx.lineWidth = 1.5;
    const texto = `${peso}${unidades[modoAtual].sufixo}`;
    ctx.font = "bold 13px Arial";
    const largTexto = ctx.measureText(texto).width + 12;
    ctx.beginPath();
    ctx.roundRect(mx - largTexto/2, my - 11, largTexto, 22, 6);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#FFC74B";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(texto, mx, my);
}

function desenharVertice(nome, cor = "#FFFFFF") {
    const v = vertices[nome];

    // Brilho de fundo
    if (cor !== "#FFFFFF") {
        ctx.shadowColor = cor;
        ctx.shadowBlur = 25;
    }

    ctx.beginPath();
    ctx.arc(v.x, v.y, 28, 0, Math.PI * 2);
    ctx.fillStyle = cor;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#FFC74B";
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Label do bairro abaixo
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 13px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(v.label, v.x, v.y + 48);
}

function desenharGrafo() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Arestas normais
    for (const a of arestas) {
        const noCaminho = ehArestaDoCaminho(a.de, a.para);
        if (!noCaminho) {
            desenharAresta(a.de, a.para, a[modoAtual]);
        }
    }
    // Arestas do caminho por cima (destaque)
    for (const a of arestas) {
        if (ehArestaDoCaminho(a.de, a.para)) {
            desenharAresta(a.de, a.para, a[modoAtual], "#FFC74B", 6, true);
        }
    }

    // Vértices
    for (const v in vertices) {
        let cor = "#FFFFFF";
        if (v === origem) cor = "#4CAF50";
        else if (v === destino) cor = "#E53935";
        else if (caminhoAtual.includes(v)) cor = "#FFC74B";
        desenharVertice(v, cor);
    }
}

function ehArestaDoCaminho(v1, v2) {
    for (let i = 0; i < caminhoAtual.length - 1; i++) {
        if ((caminhoAtual[i] === v1 && caminhoAtual[i+1] === v2) ||
            (caminhoAtual[i] === v2 && caminhoAtual[i+1] === v1)) return true;
    }
    return false;
}

// Polyfill simples pra roundRect (alguns navegadores antigos)
if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
        this.beginPath();
        this.moveTo(x + r, y);
        this.arcTo(x + w, y, x + w, y + h, r);
        this.arcTo(x + w, y + h, x, y + h, r);
        this.arcTo(x, y + h, x, y, r);
        this.arcTo(x, y, x + w, y, r);
        this.closePath();
    };
}

// ===== ALGORITMO DE DIJKSTRA =====
function dijkstra(grafo, inicio, fim) {
    const dist = {};
    const prev = {};
    const visitados = new Set();
    const fila = [];
    passosLog = [];

    for (const v in grafo) {
        dist[v] = Infinity;
        prev[v] = null;
    }
    dist[inicio] = 0;
    fila.push(inicio);

    passosLog.push(`🚀 <b>Início:</b> partindo de <b>${inicio}</b>. Distância inicial = 0.`);

    while (fila.length > 0) {
        fila.sort((a, b) => dist[a] - dist[b]);
        const atual = fila.shift();
        if (visitados.has(atual)) continue;
        visitados.add(atual);

        passosLog.push(
            `📍 Visitando <b>${atual}</b> (distância acumulada: <b>${dist[atual]}${unidades[modoAtual].sufixo}</b>)`
        );

        for (const vizinho in grafo[atual]) {
            const nova = dist[atual] + grafo[atual][vizinho];
            if (nova < dist[vizinho]) {
                const antiga = dist[vizinho] === Infinity ? "∞" : dist[vizinho];
                dist[vizinho] = nova;
                prev[vizinho] = atual;
                fila.push(vizinho);
                passosLog.push(
                    `&nbsp;&nbsp;➡️ Atualizando <b>${vizinho}</b>: ${antiga} → <b>${nova}${unidades[modoAtual].sufixo}</b> (via ${atual})`
                );
            }
        }
        if (atual === fim) {
            passosLog.push(`🎯 <b>Destino ${fim} alcançado!</b>`);
            break;
        }
    }
    return { dist, prev };
}

// ===== EXECUÇÃO =====
function executarDijkstra() {
    if (!origem || !destino) return;

    const grafo = construirGrafo();
    const { dist, prev } = dijkstra(grafo, origem, destino);

    // Reconstrói caminho
    const caminho = [];
    let atual = destino;
    while (atual) {
        caminho.unshift(atual);
        atual = prev[atual];
    }
    caminhoAtual = caminho;

    // Anima passos
    mostrarPassos();

    // Desenha caminho aresta por aresta com delay
    desenharGrafo();
    animarCaminho(caminho, () => {
        const total = dist[destino];
        document.getElementById("resultado").innerHTML =
            `✅ Menor caminho: <b>${caminho.join(" → ")}</b><br>` +
            `${unidades[modoAtual].nome}: <b>${total}${unidades[modoAtual].sufixo}</b>`;
    });
}

function animarCaminho(caminho, callback) {
    let i = 0;
    caminhoAtual = [caminho[0]];
    desenharGrafo();

    const interval = setInterval(() => {
        i++;
        if (i >= caminho.length) {
            clearInterval(interval);
            caminhoAtual = caminho;
            desenharGrafo();
            // Anima o carrinho
            animarCarrinho(caminho, callback);
            return;
        }
        caminhoAtual.push(caminho[i]);
        desenharGrafo();
    }, 500);
}

function animarCarrinho(caminho, callback) {
    let segmento = 0;
    let t = 0;
    const passos = 40;

    function frame() {
        if (segmento >= caminho.length - 1) {
            if (callback) callback();
            return;
        }
        const a = vertices[caminho[segmento]];
        const b = vertices[caminho[segmento + 1]];
        const x = a.x + (b.x - a.x) * (t / passos);
        const y = a.y + (b.y - a.y) * (t / passos);

        desenharGrafo();
        // Desenha o carrinho 🚗
        ctx.font = "32px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("🚗", x, y);

        t++;
        if (t > passos) { t = 0; segmento++; }
        requestAnimationFrame(frame);
    }
    frame();
}

function mostrarPassos() {
    const div = document.getElementById("passos");
    div.innerHTML = "";
    passosLog.forEach((p, idx) => {
        setTimeout(() => {
            const el = document.createElement("div");
            el.className = "passo";
            el.innerHTML = p;
            div.appendChild(el);
            div.scrollTop = div.scrollHeight;
        }, idx * 200);
    });
}

// ===== INTERAÇÃO COM O CANVAS =====
canvas.addEventListener("click", (e) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    for (const nome in vertices) {
        const v = vertices[nome];
        const dx = x - v.x;
        const dy = y - v.y;
        if (Math.sqrt(dx*dx + dy*dy) <= 30) {
            selecionarVertice(nome);
            return;
        }
    }
});

function selecionarVertice(nome) {
    if (!origem) {
        origem = nome;
        document.getElementById("instrucao").innerHTML =
            `✅ Origem: <b>${nome}</b><br>👉 Agora clique no <b>DESTINO</b>`;
    } else if (!destino && nome !== origem) {
        destino = nome;
        document.getElementById("instrucao").innerHTML =
            `✅ Origem: <b>${origem}</b> | 🎯 Destino: <b>${destino}</b><br>Clique em "Executar Dijkstra" ▶️`;
        document.getElementById("btnExecutar").disabled = false;
    }
    caminhoAtual = [];
    desenharGrafo();
}

// ===== BOTÕES =====
document.getElementById("btnExecutar").addEventListener("click", executarDijkstra);

document.getElementById("btnReset").addEventListener("click", () => {
    origem = null;
    destino = null;
    caminhoAtual = [];
    passosLog = [];
    document.getElementById("instrucao").innerHTML =
        `👉 Clique em um bairro para definir a <b>ORIGEM</b>`;
    document.getElementById("resultado").innerHTML =
        "Selecione origem e destino para começar";
    document.getElementById("passos").innerHTML =
        '<p class="vazio">Os passos do algoritmo aparecerão aqui após a execução.</p>';
    document.getElementById("btnExecutar").disabled = true;
    desenharGrafo();
});

document.querySelectorAll(".btn-modo").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".btn-modo").forEach(b => b.classList.remove("ativo"));
        btn.classList.add("ativo");
        modoAtual = btn.dataset.modo;
        caminhoAtual = [];
        document.getElementById("resultado").innerHTML =
            `Modo alterado para <b>${unidades[modoAtual].nome}</b>. Execute novamente!`;
        desenharGrafo();
    });
});

// Inicialização
desenharGrafo();