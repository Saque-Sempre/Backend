var mysql = require("mysql");
var fs = require("fs");

const configuracoes = {
  bancoURI:
    "jdbc:google:mysql://mysql-272316:us-central1:transacoes-saquesempre?useSSL=true",
  nomeBanco: "",
  pastaChaves: "../ChavesMySQL",
  tabelas: ["rede", "cliente", "parceiro"],
  bancoUsername: "root",
  porta: 3306,
  ipBanco: "35.232.117.185",
  bancoSenha: "dinheiro.rar0",
  apiInfinitePayKey: "xx0pmTTBXwjvUxfCQ0t2cEzdsIakGZYF",
  arquivosChaves: {
    _serverSslCertificate: null,
    _clientSslCertificate: null,
    _clientSslKey: null,
  },
  urls: {
    urlTodasTransacoes: "https://api.infinitepay.io/v1/transactions",
    urlMerchantTransacoes:
      "https://api.infinitepay.io/v1/merchants/<wallet_id>/transactions",
  },
  padraoDataString: "YYYY-MM-DDTHH:MM:SSZ",
  janelaHorasMaxima: 5,
};

function select() {
  var saida = [];
  // syncSQL
  var connection = mysql.createConnection({
    host: configuracoes.ipBanco,
    port: configuracoes.porta,
    user: configuracoes.bancoUsername,
    password: configuracoes.bancoSenha,
    database: "cadastro",
    ssl: {
      ca: fs.readFileSync(`${configuracoes.pastaChaves}/server-ca.pem`),
      key: fs.readFileSync(`${configuracoes.pastaChaves}/client-key.pem`),
      cert: fs.readFileSync(`${configuracoes.pastaChaves}/client-cert.pem`),
    },
  });
  connection.connect();

  var consultar = async () => {
    connection.query(
      "SELECT * FROM acesso_aditum",
      (erro, resultados, campos) => {
        if (erro) {
        }
        console.log(resultados);
        saida = resultados;
      }
    );
    connection.end();
  };

  consultar();
}

console.log(select());
