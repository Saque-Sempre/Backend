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

async function connect() {
  if (global.connection && global.connection.state !== "disconnected")
    return global.connection;

  const mysql = require("mysql2/promise");
  const connection = await mysql.createConnection({
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

  console.log("Conectou no MySQL!");
  global.connection = connection;
  return connection;
}

async function selectCustomers() {
  const conn = await connect();
  console.log("Fazendo select...");
  const [rows] = await conn.query("SELECT * FROM rede;");
  console.log("select feito...");
  console.log(rows);
  return rows;
}

selectCustomers()
  .then(() => {
    console.log("Terminou");
  })
  .finally(() => {
    console.log("Fim do <main>");
  });
