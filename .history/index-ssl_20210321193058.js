var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var express = require("express");
var fs = require("fs");
var mysql = require("mysql");
var crypto = require("crypto");
var syncSQL = require("sync-sql");
var moment = require("moment");
var cors = require("cors");
var app = express();

var bodyParser = require("body-parser");
//const { resolve } = require("path");
//const { exception } = require("console");

if (process.argv[3] === undefined) {
  console.log("\n\tInforme a porta de execucao do servidor!\n");
  process.exit(1);
}

var porta = process.argv[3];

const mysql2promise = require("mysql2/promise");
const configuracoes = require("./configs");
const UtilsSS = require("./utilsSS");

// ---------------------
// Habilitando o HTTPs
//var http = require('http');
var https = require('https');
var privateKey = fs.readFileSync('ChavesHTTPs/chavePrivada.key', 'utf8');
var certificate = fs.readFileSync('ChavesHTTPs/certificado.crt', 'utf8');
var credentials = { key: privateKey, cert: certificate };
// ---------------------

var papeisColunasExtras = ["rede", "parceiro"];
var colunaExtra = "nomeCliente";

var configuracoesBanco = {
  user: "root",
  password: "dinheiro.rar0",
  database: "cadastro",
  socketPath: "/cloudsql/mysql-272316:us-central1:transacoes-saquesempre",
  ssl: {
    ca: fs.readFileSync(`${configuracoes.pastaChaves}/server-ca.pem`),
    key: fs.readFileSync(`${configuracoes.pastaChaves}/client-key.pem`),
    cert: fs.readFileSync(`${configuracoes.pastaChaves}/client-cert.pem`),
  },
};

app.use(bodyParser.json());
app.use(cors());

var aplicarHeader = (res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "application/json");
  return res;
};

const consoleRequisicao = (req) => {
  console.log("> " + req.method + " - " + req.url + " - " + String(new Date()));
};

// Todas essas tabelas referenciam colunas na nossa base de dados relacional. :(
var todasColunas = {
  cliente: [
    "saque_id",
    "saque_terminal",
    "saque_datahora",
    "saque_bandeira",
    "saque_cartao",
    "saque_comissao",
    "saque_montante",
    "saque_tipo",
    "saque_eclivredescontos",
    "saque_valor",
  ],
  rede: [
    "saque_id",
    "saque_comercio",
    "saque_datahora",
    "saque_bandeira",
    "saque_cartao",
    "saque_valor",
    "saque_taxa",
    "saque_comissao",
    "saque_tipo",
    "saque_eclivredescontos",
  ],
  parceiro: [
    "saque_comercio",
    "saque_datahora",
    "saque_bandeira",
    "saque_valor",
    "saque_comissao",
    "saque_tipo",
    "saque_eclivredescontos",
  ],
};

var sqlConSetup = {
  socketPath: configuracoesBanco.socketPath,
  user: configuracoesBanco.user,
  password: configuracoesBanco.password,
  database: configuracoesBanco.database,
  ssl: configuracoesBanco.certificadosBanco,
};

if (process.argv[2] === "local")
  sqlConSetup = {
    host: configuracoes.ipBanco,
    port: configuracoes.porta,
    user: configuracoesBanco.user,
    password: configuracoesBanco.password,
    database: configuracoesBanco.database,
    ssl: configuracoesBanco.certificadosBanco,
  };

configuracoes.arquivosChaves._serverSslCertificate = new UtilsSS().abrirArquivo(
  configuracoes.pastaChaves + "/server-ca.pem"
);
configuracoes.arquivosChaves._clientSslCertificate = new UtilsSS().abrirArquivo(
  configuracoes.pastaChaves + "/client-cert.pem"
);
configuracoes.arquivosChaves._clientSslKey = new UtilsSS().abrirArquivo(
  configuracoes.pastaChaves + "/client-key.pem"
);

const codigosAplicacao = {
  sucessoLogin: "SUCESSO_LOGIN",
  erroLogin: "ERRO_LOGIN",
  erroNaoIdentificado: "ERRO_NAO_IDENTIFICADO",
  erroInternoServidor: "ERRO_INTERNO_SERVIDOR",
  loginNaoEncontrado: "LOGIN_INEXISTENTE",
  loginEncontrado: "LOGIN_EXISTENTE",
};

function executarSQL(comando, nomeBD) {
  return syncSQL.mysql(
    {
      host: configuracoes.ipBanco,
      port: configuracoes.porta,
      user: configuracoes.bancoUsername,
      password: configuracoes.bancoSenha,
      database: nomeBD,
      ssl: configuracoesBanco.ssl
    },
    comando
  );
}

async function conectarMySQL2Promise(nomeBD) {
  if (global.connection && global.connection.state !== "disconnected")
    return global.connection;

  var connection = null;

  try {
    var sqlConSetupLocal = sqlConSetup;
    if (nomeBD !== "undefined") sqlConSetupLocal.database = nomeBD;
    console.log(sqlConSetupLocal);
    connection = await mysql2promise.createConnection(sqlConSetupLocal);
  } catch (e) {
    return null;
  }
  // console.log("Conectou no MySQL!");
  global.connection = connection;
  return connection;
}

async function conectarMySQL2Promise2(nomeBD) {
  if (global.connection && global.connection.state !== "disconnected")
    return global.connection;

  var connection = null;

  try {
    var sqlConSetupLocal = sqlConSetup;
    if (nomeBD !== "undefined") sqlConSetupLocal.database = nomeBD;
    console.log("sqlConSetupLocal");
    connection = await mysql2promise.createConnection(sqlConSetupLocal);
  } catch (e) {
    return String(e);
  }
  console.log("Conectou no MySQL!");
  global.connection = connection;
  return connection;
}

async function executarSQLPromise(comando, nomeBD) {
  var conexaoLocal = await conectarMySQL2Promise(nomeBD);
  console.log("Executando query");
  var [rows] = await conexaoLocal.query(comando);
  return rows;
}

class InterfaceBD {
  constructor(
    uriConexao,
    usuario,
    senha,
    arqSSLServCert,
    arqSSLCliCert,
    arqSSLCliKey
  ) {
    this.utils = new UtilsSS();
    this.uriConexao = uriConexao;
    this.usuario = usuario;
    this.senha = senha;
    this.arqSSLServCert = arqSSLServCert;
    this.arqSSLCliCert = arqSSLCliCert;
    this.arqSSLCliKey = arqSSLCliKey;
  }

  iniciarTransacao(listaComandosSQL) {
    try {
      var conexao = abrirConexao();
      conexao.setAutoCommit(false);

      var stmt = conexao.createStatement();

      for (indice = 0; indice < listaComandosSQL.length; indice++) {
        stmt.addBatch(listaComandosSQL[indice]);
      }

      stmt.executeBatch();
      conexao.commit();
      conexao.close();

      return true;
    } catch (e) {
      return false;
    }
  }

  insert(nomeBD, tabela, dadosInseriveis, callback) {
    var valores = Object.entries(dadosInseriveis)
      .map((e) => "?")
      .join(",");
    var colunas = Object.keys(dadosInseriveis).join(",");

    var templateSQL = `INSERT INTO ${nomeBD}.${tabela}(${colunas}) VALUES(${valores});`;
    var sql = mysql.format(templateSQL, Object.values(dadosInseriveis));

    var saida = executarSQL(sql, nomeBD);
    callback(saida);

    /*var connection = mysql.createConnection(sqlConSetup);
    connection.connect();
    connection.query(sql, (erro, resultados, campos) => {
      if (!erro) callback(resultados);
    });
    connection.end();*/
  }

  delete(nomeBD, tabela, argWhere, callback) {
    var clausuraWhereString = Object.keys(argWhere)
      .map((e) => e + "=?")
      .join(" AND ");
    var templateSQL = `DELETE FROM ${nomeBD}.${tabela} WHERE ${clausuraWhereString};`;
    var sql = mysql.format(templateSQL, Object.values(argWhere));

    var saida = executarSQL(sql, nomeBD);

    callback(saida);
  }

  select(nomeBD, tabela, colunas, argWhere, limite, callback) {
    var clausuraWhereString = Object.keys(argWhere)
      .map((e) => e + "=?")
      .join(" AND ");

    if (clausuraWhereString === "") clausuraWhereString = "'1'='1'";

    if (limite === null) {
      limite = "";
    } else {
      limite = " LIMIT " + limite;
    }

    var templateSQL = `SELECT ${colunas} FROM ${nomeBD}.${tabela} WHERE ${clausuraWhereString} ${limite};`;
    var sql = mysql.format(templateSQL, Object.values(argWhere));

    var saida = executarSQL(sql, nomeBD);
    if (callback !== null) callback(saida.data.rows);
    else return saida.data.rows;
  }

  async selectAsPromise(nomeBD, tabela, colunas, argWhere, limite, callback) {
    var clausuraWhereString = Object.keys(argWhere)
      .map((e) => e + "=?")
      .join(" AND ");

    if (clausuraWhereString === "") clausuraWhereString = "'1'='1'";

    if (limite === null) {
      limite = "";
    } else {
      limite = " LIMIT " + limite;
    }

    var templateSQL = `SELECT ${colunas} FROM ${nomeBD}.${tabela} WHERE ${clausuraWhereString} ${limite};`;
    var sql = mysql.format(templateSQL, Object.values(argWhere));

    var saida = await executarSQLPromise(sql, nomeBD);
    if (callback !== null) callback(saida);
    else return saida;
  }

  update(nomeBD, tabela, argUpdate, argWhere, callback) {
    var clausuraWhereString = Object.keys(argWhere)
      .map((e) => e + "=?")
      .join(" AND ");
    var clausuraUpdateString = Object.keys(argUpdate)
      .map((e) => e + "='" + argUpdate[e] + "'")
      .join(", ");

    var templateSQL = `UPDATE ${nomeBD}.${tabela} SET ${clausuraUpdateString} WHERE ${clausuraWhereString};`;
    var sql = mysql.format(templateSQL, Object.values(argWhere));
    var saida = executarSQL(sql, nomeBD);

    callback(saida);

    /*var connection = mysql.createConnection(sqlConSetup);
    connection.connect();
    connection.query(sql, (erro, resultados, campos) => {
      if (!erro) callback(resultados);
    });
    connection.end();*/
  }
}

function novaInterfaceBD() {
  return new InterfaceBD(
    configuracoes.bancoURI,
    configuracoes.bancoUsername,
    configuracoes.bancoSenha,
    configuracoes.arquivosChaves._serverSslCertificate,
    configuracoes.arquivosChaves._clientSslCertificate,
    configuracoes.arquivosChaves._clientSslKey
  );
}

class InterfaceApp {
  constructor() {
    this.utilsSS = new UtilsSS();
  }

  obterCredenciaisAditum(carteiraUsuarioSS) {
    var nomeBD = "cadastro";
    var nomeTabela = "acesso_aditum";
    var colunas = [
      "aditum_merchant_id",
      "aditum_merchant_token",
      "saquesempre_carteira",
    ];

    var saida;
    var interfaceBD = novaInterfaceBD();

    var argWhere = { saquesempre_carteira: carteiraUsuarioSS };

    interfaceBD.select(
      nomeBD,
      nomeTabela,
      colunas,
      argWhere,
      1,
      (registros) => {
        if (registros.length > 0) {
          saida = {
            merchantIDAditum: Object.values(registros[0])[0],
            merchantTokenAditum: Object.values(registros[0])[1],
            walletSaqueSempre: Object.values(registros[0])[2],
          };
        }
      }
    );

    return saida;
  }

  async obterTodasAsTransacoesBanco(carteiraUsuario, papelUsuario) {
    var colunas = todasColunas[papelUsuario];
    var interfaceBD = novaInterfaceBD();
    var nomeBD = "transacoessaquesempre";
    var argWhere = { saque_carteira: carteiraUsuario };
    var tabelas = ["saque", "pagamento"];
    var transacoes = {};

    transacoes["saque"] = await interfaceBD.selectAsPromise(
      nomeBD,
      "saque",
      colunas,
      argWhere,
      null,
      null
    );

    transacoes["pagamento"] = await interfaceBD.selectAsPromise(
      nomeBD,
      "pagamento",
      colunas,
      argWhere,
      null,
      null
    );

    transacoes["pagamento"] = transacoes["pagamento"].map((reg) =>
      Object.values(reg)
    );
    transacoes["saque"] = transacoes["saque"].map((reg) => Object.values(reg));

    return { transacoes: transacoes, colunas: colunas };
  }

  async obterTodasAsTransacoesBanco2(carteiraUsuario, papelUsuario) {
    //select(nomeBD, tabela, colunas, argWhere, limite) {
    var nomeBD = "transacoessaquesempre";
    var tabelas = ["saque", "pagamento"];
    var saidaTransacoes = {
      saque: [],
      pagamento: [],
    };

    var colunas = todasColunas[papelUsuario];

    var argWhere = { saque_carteira: carteiraUsuario };
    var interfaceBD = novaInterfaceBD();

    // select(nomeBD, tabela, colunas, argWhere, limite, callback)
    var saidaTransacoes = {};

    /*    try {
      tabelas.forEach((nomeTabela) => {
        saidaTransacoes[nomeTabela] = interfaceBD.select(
          nomeBD,
          nomeTabela,
          colunas,
          argWhere,
          1000000,
          (saidaTransacoesLocal) => {
            if (saidaTransacoesLocal.length > 0)
              saidaTransacoes = saidaTransacoesLocal;
            throw "";
          }
        );
      });
    } catch (e) {}*/

    //try {
    tabelas.forEach(async (nomeTabela) => {
      saidaTransacoes[nomeTabela] = await interfaceBD
        .selectAsPromise(nomeBD, nomeTabela, colunas, argWhere, 3000, null)
        .map((registro) => Object.values(registro));
    }); /*
    } catch (e) {
      console.log("Exception! E: " + String(e));
    }*/

    //var s = interfaceBD.select(nomeBD, "saque", colunas, argWhere, 1000, null);
    return { transacoes: saidaTransacoes, colunas: colunas };
  }

  /*
curl -G -X GET "https://api.infinitepay.io/v1/merchants/$wallet_id/transactions" \
  -H "Authorization: suachavedeapi" \
  -d "page=1" \
  -d "limit=100"
*/
  obterTodasAsTransacoesAPI(carteiraUsuario) {
    //var indicePagina = 1;
    var params = { page: "1", limit: "100" };
    params = Object.entries(params)
      .map(([chave, valor], indice) => chave + "=" + valor)
      .join("&");
    var urlTransacoesMerchant =
      configuracoes.urls.urlMerchantTransacoes.replace(
        "<wallet_id>",
        carteiraUsuario
      ) +
      "?" +
      params;

    var retornoRequisicaoHTTP = "";

    while (urlTransacoesMerchant != "") {
      retornoRequisicaoHTTP = this.utilsSS.fazerRequisicaoHTTP(
        "GET",
        urlTransacoesMerchant
      );

      try {
        conteudoRequisicaoHTTP = JSON.parse(retornoRequisicaoHTTP.content);
        if ("next" in conteudoRequisicaoHTTP.pagination) {
          urlTransacoesMerchant = conteudoRequisicaoHTTP.pagination.next;
        } else {
          urlTransacoesMerchant = "";
        }
      } catch (exception) {
        urlTransacoesMerchant = "";
      }

      //var todosRegistrosTransacao = [];
    }
  }

  // select(nomeBD, tabela, colunas, argWhere, limite)
  abrirSessao(bd, usuario, hashSenha) {
    var resLogin = [];
    var resLoginTemp = [];
    var papelUsuario = "";
    var colunasProjetadas = ["nomeusuario", "senha", "carteira"];
    var nomeColunaCarteira = "carteira";
    var saida = [];
    // var flag = 0;

    configuracoes.tabelas.forEach(function (nomeTabela, indice) {
      interfaceBD.select(
        bd,
        nomeTabela,
        colunasProjetadas,
        { nomeusuario: usuario, senha: hashSenha },
        1,
        (resLoginTemp) => {
          if (resLoginTemp != null) {
            resLogin = resLogin.concat(resLoginTemp);
            if (resLoginTemp.length && papelUsuario === "")
              papelUsuario = nomeTabela;
          }

          if (resLogin != null && resLogin != []) {
            if (resLogin.length > 0) {
              var saidaLocal = {
                estado: "aberta",
                conteudo: resLogin,
                papelUsuario: papelUsuario,
                carteiraUsuario: resLogin[0][nomeColunaCarteira],
                horaAbertura: new Date(),
              };
              saida.push(saidaLocal);
              return saidaLocal;
            }
            /*return ContentService.createTextOutput(
        JSON.stringify({ nome: "isaias" })
      ).setMimeType(ContentService.MimeType.JSON);*/
          }
        }
      );
    });

    if (saida.length) return saida[0];

    return { estado: "fechada", conteudo: [], horaAbertura: new Date() };
  }

  fecharSessao() { }
}

interfaceBD = novaInterfaceBD();
interfaceApp = new InterfaceApp();

function obterExtrato(carteira, nomeCliente, pagina, limite, papelUsuario) {
  var incrementarAno = (d) => {
    var ano = d.getFullYear();
    var mes = d.getMonth();
    var dia = d.getDate();
    return new Date(ano + 1, mes, dia);
  };

  var dataInicio = new Date("01/01/2019");
  var dataFim = incrementarAno(new Date());
  var saidaFuncao = {};
  var urlsExtrato = {
    recebiveis: `https://api.infinitepay.io/v1/wallets/${carteira}/receivables/brl`,
    transferencias: `https://api.infinitepay.io/v1/wallets/${carteira}/bank_transfers`,
    faturamentos: `https://api.infinitepay.io/v1/wallets/${carteira}/billings`,
  };

  var colunas = [];

  //api.infinitepay.io/v1/wallets/accXXN48RTWRY2KC/receivables/brl?since=2018-10-10T03:00:00Z&until=2020-10-11T03:00:00Z

  Object.entries(urlsExtrato).forEach(([operacao, urlIter], indice) => {
    //var objSaida = requisicaoHTTP(url, {});
    //var maximoPaginas = 1;
    var continuarIteracao = true;
    // A API infinite pay só trabalha com esse padrão
    //var padrao = "YYYY-MM-DDTHH:MM:SSZ";
    var padrao = configuracoes.padraoDataString;

    var url =
      urlIter +
      `?since=${moment(dataInicio).format(padrao)}&until=${moment(
        dataFim
      ).format(padrao)}`;

    // Iterando, rigorosamente, TODAS AS PAGINAS
    while (continuarIteracao) {
      var objSaidaTexto = new UtilsSS().fazerRequisicaoHTTP("GET", url).content;

      if (objSaidaTexto !== undefined) var objSaida = JSON.parse(objSaidaTexto);
      else var objSaida = {};

      //maximoPaginas = objSaida.pagination.total_pages;

      continuarIteracao = false;

      if ("pagination" in objSaida)
        if ("next" in objSaida.pagination) {
          url = objSaida.pagination.next;
          continuarIteracao = true;
        }

      if ("results" in objSaida) {
        // Iterando todos os registros
        for (
          var indiceRegistro = 0;
          indiceRegistro < objSaida.results.length;
          indiceRegistro++
        ) {
          data = objSaida.results[indiceRegistro]["payment_date"].slice(0, 10);
          var subObj = (({ payment_date, amount }) => ({
            payment_date,
            amount,
          }))(objSaida.results[indiceRegistro]);
          subObj["payment_date"] = subObj["payment_date"].slice(0, 10);
          subObj["operacao"] = operacao;

          if (papeisColunasExtras.includes(papelUsuario)) {
            subObj[colunaExtra] = nomeCliente;
          }

          colunas = Object.keys(subObj);

          if (!Object.keys(saidaFuncao).includes(data)) saidaFuncao[data] = [];
          saidaFuncao[data].push(subObj);
        }
      }
    }
  });

  return { transacoes: saidaFuncao, colunas: colunas };
}

async function acaoLogin(usuario, hashSenha) {
  return new Promise(async (resolve, reject) => {
    setTimeout(() => {
      reject(
        new UtilsSS().gerarObjetoResposta(
          codigosAplicacao.erroNaoIdentificado,
          {}
        )
      );
    }, 10000);
    objSessao = interfaceApp.abrirSessao("cadastro", usuario, hashSenha);
    saida = [objSessao];
    if (objSessao.estado == "aberta") {
      transacoesCarteira = await interfaceApp.obterTodasAsTransacoesBanco(
        objSessao.carteiraUsuario,
        objSessao.papelUsuario
      );
      var objSaida = new UtilsSS().gerarObjetoResposta(
        codigosAplicacao.sucessoLogin,
        { obj: transacoesCarteira, papel: objSessao.papelUsuario }
      );
      resolve(objSaida);
    } else {
      var objSaida = new UtilsSS().gerarObjetoErroLogin("");
      resolve(objSaida);
    }
  });
}

async function acaoExtrato(usuario, hashSenha) {
  return new Promise(async (resolve, reject) => {
    objSessao = interfaceApp.abrirSessao("cadastro", usuario, hashSenha);
    saida = [objSessao];
    if (objSessao.estado == "aberta") {
      var objExtrato = obterExtrato(
        objSessao.carteiraUsuario,
        objSessao.nomeUsuario,
        1,
        100,
        objSessao.papelUsuario
      );

      resolve(
        new UtilsSS().gerarObjetoResposta(codigosAplicacao.sucessoLogin, {
          obj: objExtrato,
          papel: objSessao.papelUsuario,
        })
      );
    } else {
      resolve(new UtilsSS().gerarObjetoErroLogin(""));
    }
  });
}

function acaoAcessoAditum(usuario, hashSenha) {
  return new Promise(async (resolve, reject) => {
    objSessao = interfaceApp.abrirSessao("cadastro", usuario, hashSenha);
    saida = [objSessao];
    if (objSessao.estado == "aberta") {
      var saida = interfaceApp.obterCredenciaisAditum(
        objSessao.carteiraUsuario
      );
      if (saida === undefined)
        saida = {};
      resolve(
        new UtilsSS().gerarObjetoResposta(codigosAplicacao.sucessoLogin, {
          obj: Object.values(saida),
        })
      );
    } else {
      reject(UtilsSS().gerarObjetoErroLogin(""));
    }
  });
}

async function acaoGerarSenha(emailUsuario) {
  return new Promise(async (resolve, reject) => {
    // insere registro ou atualizda
    // se data estiver defasada, delete
    var interfaceBD = novaInterfaceBD();

    var argWhere = { nomeusuario: emailUsuario };
    var codigoSaida = codigosAplicacao.loginNaoEncontrado;
    var objSaida = [];

    interfaceBD.select(
      "cadastro",
      "todos_nomes_usuarios",
      "nomeusuario",
      argWhere,
      1,
      (saidaSelect) => {
        // Se nao ha usuario
        if (saidaSelect.length === 0) {
          reject(new UtilsSS().gerarObjetoResposta(
            codigosAplicacao.loginNaoEncontrado,
            {
              obj: [],
            }
          ));
        }

        interfaceBD.delete(
          "cadastro",
          "token_redefinicao_senha",
          argWhere,
          (saidaDelecao) => {
            var tokenTemporario = crypto
              .randomBytes(64)
              .toString("hex")
              .substring(0, 30);
            var dataCriacaoRegistro = moment(new Date()).format(
              configuracoes.padraoDataString
            );

            var dadosInseriveis = {
              nomeusuario: emailUsuario,
              token: tokenTemporario,
              datahora: dataCriacaoRegistro,
            };

            // insert(nomeBD, tabela, dadosInseriveis, callback)
            interfaceBD.insert(
              "cadastro",
              "token_redefinicao_senha",
              dadosInseriveis,
              (saidaInsercao) => {
                codigoSaida = codigosAplicacao.loginEncontrado;
                objSaida = [];
              }
            );
          }
        );
      }
    );

    resolve(new UtilsSS().gerarObjetoResposta(codigoSaida, {
      obj: objSaida,
    }));
  });
}

// (...[usuario, hashSenha, tokenTemporario]);
async function acaoRedefinir(emailUsuario, hashNovaSenha, tokenTemporario) {
  return new Promise(async (resolve, reject) => {
    // insere registro ou atualizda
    // se data estiver defasada, delete
    //var colunasProjetadas = ["nomeusuario", "datahora"];
    //var nomeColunaCarteira = "carteira";
    var saidaSelect = null;
    var argWhere = { nomeusuario: emailUsuario, token: tokenTemporario };
    var codigoSaida = codigosAplicacao.erroLogin;
    var objSaida = {
      obj: [],
    };

    // select(nomeBD, tabela, colunas, argWhere, limite, callback)
    interfaceBD.select(
      "cadastro",
      "token_redefinicao_senha",
      "datahora",
      argWhere,
      1,
      (saidaSelect) => {
        interfaceBD.delete(
          "cadastro",
          "token_redefinicao_senha",
          argWhere,
          (saidaDelete) => {
            if (saidaDelete.data.rows.affectedRows > 0) {
              datahora = moment(
                saidaSelect[0]["datahora"],
                configuracoes.padraoDataString
              );
              agora = moment();
              diferencaHora = agora.diff(datahora, "hours");

              try {
                if (diferencaHora <= configuracoes.janelaHorasMaxima) {
                  // update(nomeBD, tabela, argUpdate, argWhere, callback)
                  configuracoes.tabelas.forEach((tabela) => {
                    interfaceBD.update(
                      "cadastro",
                      tabela,
                      { senha: hashNovaSenha, nomeusuario: emailUsuario },
                      { nomeusuario: emailUsuario },
                      (saidaUpdate) => {
                        if (saidaUpdate.data.rows.affectedRows) {
                          codigoSaida = codigosAplicacao.sucessoLogin;
                          throw "Atualizacao concluida.";
                        }
                      }
                    );
                  });
                }
              } catch (e) { }
            }
          }
        );
      }
    );

    resolve(new UtilsSS().gerarObjetoResposta(codigoSaida, objSaida));
  });
}

app.post("/", function (req, res) {
  var objEntrada = req.body;
  var usuario = objEntrada.usuario;
  var hashSenha = objEntrada.token;
  var tokenTemporario = objEntrada.tokenTemporario;
  var acao = objEntrada.acao;

  consoleRequisicao(req);

  var tratadorRota = {
    extrato: acaoExtrato,
    login: acaoLogin,
    acessoAditum: acaoAcessoAditum,
    gerarSenha: acaoGerarSenha,
    redefinirSenha: acaoRedefinir,
  };

  res = aplicarHeader(res);

  if (acao in tratadorRota) {
    tratadorRota[acao](...[usuario, hashSenha, tokenTemporario])
      .then((objSaida) => {
        res.send(JSON.stringify(objSaida));
      })
      .catch((objExcecao) => {
        res.send(JSON.stringify(objExcecao));
      });
  }
});

app.post("/login", function (req, res) {
  var objEntrada = req.body;
  var usuario = objEntrada.usuario;
  var hashSenha = objEntrada.token;

  consoleRequisicao(req);

  res = aplicarHeader(res);

  acaoLogin(usuario, hashSenha)
    .then((objSaida) => {
      res.send(JSON.stringify(objSaida));
    })
    .catch((objExcecao) => {
      res.send(JSON.stringify(objExcecao));
    });
});

app.post("/extrato", function (req, res) {
  var objEntrada = req.body;
  var usuario = objEntrada.usuario;
  var hashSenha = objEntrada.token;

  consoleRequisicao(req);

  res = aplicarHeader(res);

  acaoExtrato(usuario, hashSenha)
    .then((objSaida) => {
      res.send(JSON.stringify(objSaida));
    })
    .catch((objExcecao) => {
      res.send(JSON.stringify(objExcecao));
    });
});

app.post("/acessoAditum", function (req, res) {
  var objEntrada = req.body;
  var usuario = objEntrada.usuario;
  var hashSenha = objEntrada.token;

  consoleRequisicao(req);

  res = aplicarHeader(res);

  acaoAcessoAditum(usuario, hashSenha)
    .then((objSaida) => {
      res.send(JSON.stringify(objSaida));
    })
    .catch((objExcecao) => {
      res.send(JSON.stringify(objExcecao));
    });
});

app.get("/", function (req, res) {
  //var resp = executarSQL("SELECT * FROM saque LIMIT 10", "transacoessaquesempre");
  consoleRequisicao(req);
  res = aplicarHeader(res);
  res.send(
    JSON.stringify({
      mensagem: "O servidor está sendo executado!",
      data: new Date(),
    })
  );
});

var httpsServer = https.createServer(credentials, app);

httpsServer.listen(porta, () => {
  console.log(`\n\tServidor escutando na porta ${porta}!\n\n`);
});

/*app.listen(porta, function () {
  console.log(`\n\nServidor escutando na porta ${porta}!\n\n`);
});*/
