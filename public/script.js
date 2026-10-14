
const API = "/podcasts";

const form = document.getElementById("formPodcast");
const lista = document.getElementById("listaPodcasts");
const mensagem = document.getElementById("mensagem");
const btnCancelar = document.getElementById("btnCancelar");

let podcasts = [];

function avisar(texto) {
    mensagem.textContent = texto;
}

async function requisicao(url, opcoes = {}) {
    const resposta = await fetch(url, opcoes);
    const dados = await resposta.json();

    if (!resposta.ok) {
        throw new Error(dados.mensagem || dados.erro || "Erro na operação");
    }

    return dados;
}

async function carregarPodcasts() {
    try {
        podcasts = await requisicao(API);
        lista.innerHTML = "";

        document.getElementById("total").textContent =
            `${podcasts.length} podcast(s)`;

        if (podcasts.length === 0) {
            const linha = lista.insertRow();
            const celula = linha.insertCell();
            celula.colSpan = 5;
            celula.textContent = "Nenhum podcast cadastrado.";
            return;
        }

        podcasts.forEach(podcast => {
            const linha = lista.insertRow();

            [
                podcast.nome,
                podcast.categoria,
                podcast.apresentador,
                podcast.quantidade_episodios
            ].forEach(valor => {
                const celula = linha.insertCell();
                celula.textContent = valor;
            });

            const acoes = linha.insertCell();

            const editar = document.createElement("button");
            editar.textContent = "Editar";
            editar.className = "editar";
            editar.onclick = () => editarPodcast(podcast.id);

            const excluir = document.createElement("button");
            excluir.textContent = "Excluir";
            excluir.className = "excluir";
            excluir.onclick = () => excluirPodcast(podcast.id);

            acoes.append(editar, excluir);
        });
    } catch (erro) {
        avisar("Erro ao carregar: " + erro.message);
    }
}

function editarPodcast(id) {
    const podcast = podcasts.find(p => p.id === id);
    if (!podcast) return;

    document.getElementById("podcastId").value = podcast.id;
    document.getElementById("nome").value = podcast.nome;
    document.getElementById("categoria").value = podcast.categoria;
    document.getElementById("apresentador").value = podcast.apresentador;
    document.getElementById("episodios").value =
        podcast.quantidade_episodios;

    document.getElementById("tituloFormulario").textContent =
        "Editar podcast";
    document.getElementById("btnSalvar").textContent =
        "Salvar alterações";

    btnCancelar.hidden = false;
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function limparFormulario() {
    form.reset();
    document.getElementById("podcastId").value = "";
    document.getElementById("tituloFormulario").textContent =
        "Cadastrar podcast";
    document.getElementById("btnSalvar").textContent =
        "Cadastrar podcast";
    btnCancelar.hidden = true;
}

form.addEventListener("submit", async evento => {
    evento.preventDefault();

    const id = document.getElementById("podcastId").value;

    const dados = {
        nome: document.getElementById("nome").value.trim(),
        categoria: document.getElementById("categoria").value.trim(),
        apresentador: document.getElementById("apresentador").value.trim(),
        quantidade_episodios: Number(
            document.getElementById("episodios").value
        )
    };

    try {
        await requisicao(id ? `${API}/${id}` : API, {
            method: id ? "PUT" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dados)
        });

        avisar(id ? "Podcast atualizado!" : "Podcast cadastrado!");
        limparFormulario();
        await carregarPodcasts();
    } catch (erro) {
        avisar("Erro: " + erro.message);
    }
});

async function excluirPodcast(id) {
    if (!confirm("Deseja realmente excluir este podcast?")) return;

    try {
        await requisicao(`${API}/${id}`, {
            method: "DELETE"
        });

        limparFormulario();
        avisar("Podcast excluído com sucesso!");
        await carregarPodcasts();
    } catch (erro) {
        avisar("Erro: " + erro.message);
    }
}

btnCancelar.addEventListener("click", limparFormulario);

carregarPodcasts();
