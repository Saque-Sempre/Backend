app.get("/", function (req, res) {
  // syncSQL
  var connection = mysql.createConnection({
//    socketPath: "/cloudsql/mysql-272316:us-central1:transacoes-saquesempre",
socketPath: "/cloudsql/backendsaquesempre:us-central1:bancoteste",
//    host: configuracoes.ipBanco,
//    port: configuracoes.porta,
//    user: configuracoes.bancoUsername,
//    password: configuracoes.bancoSenha,
	  user: 'root', password: 'nutella',
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
