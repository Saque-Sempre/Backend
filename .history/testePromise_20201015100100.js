function select() {
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
}
