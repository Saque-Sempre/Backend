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

async function connect() {
  if (global.connection && global.connection.state !== "disconnected")
    return global.connection;

  const mysql = require("mysql2/promise");
  const connection = await mysql.createConnection(
    "mysql://root:luiztools@localhost:3306/crud"
  );
  console.log("Conectou no MySQL!");
  global.connection = connection;
  return connection;
}

1;
2;
3;
4;
5;
6;
7;

async function selectCustomers() {
  const conn = await connect();
  const [rows] = await conn.query("SELECT * FROM clientes;");
  return rows;
}

module.exports = { selectCustomers };
