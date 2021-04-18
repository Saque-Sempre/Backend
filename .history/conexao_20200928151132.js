var express = require("express");
var fs = require("fs");
var mysql = require("mysql");

var app = express();
var port = 3001;

var bodyParser = require("body-parser");
app.use(bodyParser.json());

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

var conexao = mysql.createConnection({
  host: "35.232.117.185",
  port: "3306",
  user: "root",
  password: "dinheiro.rar0",
  ssl: {
    ca: fs.readFileSync("./ChavesMySQL/server-ca.pem"),
    key: fs.readFileSync("./ChavesMySQL/client-key.pem"),
    cert: fs.readFileSync("./ChavesMySQL/client-cert.pem"),
  },
});

console.log("Foi");
