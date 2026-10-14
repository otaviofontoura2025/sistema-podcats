
const express = require("express");
const cors = require("cors");
const path = require("path");
const conexao = require("./database");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Página inicial
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// LISTAR PODCASTS
app.get("/podcasts", (req, res) => {
    conexao.query(
        "SELECT * FROM podcasts ORDER BY id DESC",
        (erro, resultados) => {
            if (erro) {
                return res.status(500).json({
                    mensagem: "Erro ao listar podcasts",
                    erro: erro.message
                });
            }

            res.json(resultados);
        }
    );
});

// BUSCAR PODCAST POR ID
app.get("/podcasts/:id", (req, res) => {
    const id = req.params.id;

    conexao.query(
        "SELECT * FROM podcasts WHERE id = ?",
        [id],
        (erro, resultados) => {
            if (erro) {
                return res.status(500).json({
                    mensagem: "Erro ao buscar podcast"
                });
            }

            if (resultados.length === 0) {
                return res.status(404).json({
                    mensagem: "Podcast não encontrado"
                });
            }

            res.json(resultados[0]);
        }
    );
});

// VALIDAR DADOS
function validarPodcast(dados) {
    return (
        dados &&
        typeof dados.nome === "string" &&
        dados.nome.trim().length > 0 &&
        typeof dados.categoria === "string" &&
        dados.categoria.trim().length > 0 &&
        typeof dados.apresentador === "string" &&
        dados.apresentador.trim().length > 0 &&
        Number.isInteger(dados.quantidade_episodios) &&
        dados.quantidade_episodios >= 0
    );
}

// CADASTRAR PODCAST
app.post("/podcasts", (req, res) => {
    if (!validarPodcast(req.body)) {
        return res.status(400).json({
            mensagem: "Preencha todos os campos corretamente!"
        });
    }

    const {
        nome,
        categoria,
        apresentador,
        quantidade_episodios
    } = req.body;

    const sql = `
        INSERT INTO podcasts
        (nome, categoria, apresentador, quantidade_episodios)
        VALUES (?, ?, ?, ?)
    `;

    conexao.query(
        sql,
        [nome, categoria, apresentador, quantidade_episodios],
        (erro, resultado) => {
            if (erro) {
                return res.status(500).json({
                    mensagem: "Erro ao cadastrar podcast",
                    erro: erro.message
                });
            }

            res.status(201).json({
                mensagem: "Podcast cadastrado com sucesso!",
                id: resultado.insertId
            });
        }
    );
});

// EDITAR PODCAST
app.put("/podcasts/:id", (req, res) => {
    if (!validarPodcast(req.body)) {
        return res.status(400).json({
            mensagem: "Preencha todos os campos corretamente!"
        });
    }

    const {
        nome,
        categoria,
        apresentador,
        quantidade_episodios
    } = req.body;

    const id = req.params.id;

    const sql = `
        UPDATE podcasts
        SET nome = ?,
            categoria = ?,
            apresentador = ?,
            quantidade_episodios = ?
        WHERE id = ?
    `;

    conexao.query(
        sql,
        [nome, categoria, apresentador, quantidade_episodios, id],
        (erro, resultado) => {
            if (erro) {
                return res.status(500).json({
                    mensagem: "Erro ao atualizar podcast",
                    erro: erro.message
                });
            }

            if (resultado.affectedRows === 0) {
                return res.status(404).json({
                    mensagem: "Podcast não encontrado"
                });
            }

            res.json({
                mensagem: "Podcast atualizado com sucesso!"
            });
        }
    );
});

// EXCLUIR PODCAST
app.delete("/podcasts/:id", (req, res) => {
    const id = req.params.id;

    conexao.query(
        "DELETE FROM podcasts WHERE id = ?",
        [id],
        (erro, resultado) => {
            if (erro) {
                return res.status(500).json({
                    mensagem: "Erro ao excluir podcast",
                    erro: erro.message
                });
            }

            if (resultado.affectedRows === 0) {
                return res.status(404).json({
                    mensagem: "Podcast não encontrado"
                });
            }

            res.json({
                mensagem: "Podcast excluído com sucesso!"
            });
        }
    );
});

// INICIAR SERVIDOR
const PORTA = 3002;

app.listen(PORTA, () => {
    console.log("----------------------------------");
    console.log("SISTEMA DE PODCASTS INICIADO!");
    console.log("Servidor na porta: " + PORTA);
    console.log("Acesse: http://localhost:" + PORTA);
    console.log("----------------------------------");
});
