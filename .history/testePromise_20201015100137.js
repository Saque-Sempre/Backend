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
      return resultados;
      console.log(resultados);
    }
  );
  connection.end();
}

select();
