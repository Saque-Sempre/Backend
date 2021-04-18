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
const util = require("util");

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

var config = {
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
};

function makeDb(config) {
  const connection = mysql.createConnection(config);
  return {
    query(sql, args) {
      return util.promisify(connection.query).call(connection, sql, args);
    },
    close() {
      return util.promisify(connection.end).call(connection);
    },
  };
}

async function main() {
  const db = makeDb(config);
  try {
    const someRows = await db.query("SELECT * FROM acesso_aditum");
    console.log(someRows);
  } catch (err) {
    // handle the error
  } finally {
    db.close();
  }
}

await main();
