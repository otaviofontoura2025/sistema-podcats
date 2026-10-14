const mysql = require("mysql2");

const conexao = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "admin",
    database: "sistema_podcasts"
});

conexao.connect((erro) => {
    if (erro) {
        console.log("Erro na conexão:", erro.message);
    } else {
        console.log("Conectado ao MySQL com sucesso!");
    }
});

module.exports = conexao;

module.exports = conexao;