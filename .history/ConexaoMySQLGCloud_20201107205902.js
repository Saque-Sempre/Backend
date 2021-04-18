var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var express = require("express");
var fs = require("fs");
var mysql = require("mysql");
var crypto = require("crypto");
var syncSQL = require("sync-sql");
var moment = require("moment");
var cors = require("cors");
var app = express();
var porta = 8080;
var bodyParser = require("body-parser");

app.use(bodyParser.json());
app.use(cors());

const configuracoes = {
  bancoURI:
    "jdbc:google:mysql://mysql-272316:us-central1:transacoes-saquesempre?useSSL=true",
  nomeBanco: "",
  tabelas: ["rede", "cliente", "parceiro"],
  bancoUsername: "root",
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
};

app.get("/", function (req, res) {
  // syncSQL
  var connection = mysql.createConnection({
    //    socketPath: "/cloudsql/mysql-272316:us-central1:transacoes-saquesempre",
    socketPath: "/cloudsql/backendsaquesempre:us-central1:bancoteste",
    //    host: configuracoes.ipBanco,
    //    port: configuracoes.porta,
    //    user: configuracoes.bancoUsername,
    //    password: configuracoes.bancoSenha,
    user: "root",
    password: "nutella",
    database: "teste",
    /*    ssl: {
      ca: fs.readFileSync(`${configuracoes.pastaChaves}/server-ca.pem`),
      key: fs.readFileSync(`${configuracoes.pastaChaves}/client-key.pem`),
      cert: fs.readFileSync(`${configuracoes.pastaChaves}/client-cert.pem`),
    },*/
  });
  connection.connect();
  connection.query(
    "SELECT * FROM acesso_aditum",
    (erro, resultados, campos) => {
      if (erro) {
      }
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Content-Type", "application/json");
      res.send(
        JSON.stringify({
          resultados: resultados,
          erro: erro,
          campos: campos,
          socketPath: String(connection.config.socketPath),
        })
      );
      console.log(resultados);
    }
  );
  connection.end();
  console.log("Fim da funcao externa.");

  //console.log("\n\n\n- - -\n");
  //console.log(connection.config.socketPath);
  //return;
});

app.listen(porta, function () {
  console.log(`\n\nServidor Saque Sempre escutando na porta ${porta}!\n\n`);
});
