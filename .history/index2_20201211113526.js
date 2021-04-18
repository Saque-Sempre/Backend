var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var express = require("express");
var cors = require("cors");
var app = express();
var porta = 8080;
var bodyParser = require("body-parser");

app.use(bodyParser.json());
app.use(cors());

app.get("/test", function (req, res) {
  consoleRequisicao(req);

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "application/json");

  res.send(JSON.stringify("It's working!"));
});


app.listen(porta, function () {
  console.log(`\nServidor escutando na porta ${porta}!`);
});

console.log("Executando o servidor Saque Sempre!\n\n\n");