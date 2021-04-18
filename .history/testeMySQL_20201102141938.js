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

const configuracoes = {
  bancoURI:
    "jdbc:google:mysql://mysql-272316:us-central1:transacoes-saquesempre?useSSL=true",
  nomeBanco: "",
  pastaChaves: "./ChavesMySQL",
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

var papeisColunasExtras = ["rede", "parceiro"];
var colunaExtra = "nomeCliente";

const codigosAplicacao = {
  sucessoLogin: "SUCESSO_LOGIN",
  erroLogin: "ERRO_LOGIN",
  erroNaoIdentificado: "ERRO_NAO_IDENTIFICADO",
  erroInternoServidor: "ERRO_INTERNO_SERVIDOR",
  loginNaoEncontrado: "LOGIN_INEXISTENTE",
  loginEncontrado: "LOGIN_EXISTENTE",
};

class UtilsSS {
  constructor() {}

  abrirArquivo(n) {
    return fs.readFileSync(n, "utf8").toString();
  }

  gerarObjetoResposta(codigo, objSaida) {
    return { codigo: codigo, "data-hora": new Date(), conteudo: objSaida };
  }

  gerarObjetoErroLogin(papelUsuario) {
    return this.gerarObjetoResposta(codigosAplicacao.erroLogin, {
      obj: [],
      papel: papelUsuario,
    });
  }

  gerarTokenAleatorio() {}

  fazerRequisicaoHTTP(metodoHTTP, url) {
    const xmlHttpRequest = new XMLHttpRequest();
    var headers = { Authorization: configuracoes.apiInfinitePayKey };
    /*var options = {
      method: tipo,
      headers: headers,
    };*/

    xmlHttpRequest.open("GET", url, false); // false for synchronous request
    Object.entries(headers).map(([chave, valor, indice]) => {
      xmlHttpRequest.setRequestHeader(chave, valor);
    });

    xmlHttpRequest.send(null);
    return {
      code: xmlHttpRequest.status,
      content: xmlHttpRequest.responseText,
    };
  }
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

  /*
        ca: this.arqSSLServCert,
        key: this.arqSSLCliKey,
        cert: this.arqSSLCliCert,
*/

  abrirConexaoCriptografada() {
    var conexao = mysql.createConnection({
      host: configuracoes.ipBanco,
      port: configuracoes.porta,
      user: "root",
      password: "dinheiro.rar0",
      database: "cadastro",
      ssl: {
        ca: fs.readFileSync(`${configuracoes.pastaChaves}/server-ca.pem`),
        key: fs.readFileSync(`${configuracoes.pastaChaves}/client-key.pem`),
        cert: fs.readFileSync(`${configuracoes.pastaChaves}/client-cert.pem`),
      },
    });

    /*try {
      conexao = Jdbc.getCloudSqlConnection(this.uriConexao, {
        user: this.usuario,
        password: this.senha,
        _serverSslCertificate: this.arqSSLServCert,
        _clientSslCertificate: this.arqSSLCliCert,
        _clientSslKey: this.arqSSLCliKey,
      });
    } catch (e) {
      console.log(
        "\n\n@@@ Exception (abrirConexaoCriptografada()): " + String(e) + "\n\n"
      );
      return null;
    }*/
    console.log("Conexão aberta!");
    return conexao;
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

  insert(nomeBD, tabela, dadosInseriveis) {
    var valores = Object.entries(dadosInseriveis)
      .map((e) => "?")
      .join(",");
    var colunas = Object.keys(dadosInseriveis).join(",");

    var templateSQL = `INSERT INTO ${nomeBD}.${tabela}(${colunas}) VALUES(${valores});`;
    var sql = mysql.format(templateSQL, Object.values(dadosInseriveis));

    var saida = syncSQL.mysql(
      {
        host: configuracoes.ipBanco,
        port: configuracoes.porta,
        user: configuracoes.bancoUsername,
        password: configuracoes.bancoSenha,
        database: nomeBD,
        ssl: {
          ca: fs.readFileSync(`${configuracoes.pastaChaves}/server-ca.pem`),
          key: fs.readFileSync(`${configuracoes.pastaChaves}/client-key.pem`),
          cert: fs.readFileSync(`${configuracoes.pastaChaves}/client-cert.pem`),
        },
      },
      sql
    );

    return saida;
  }

  delete(nomeBD, tabela, argWhere) {
    var clausuraWhereString = Object.keys(argWhere)
      .map((e) => e + "=?")
      .join(" AND ");
    var templateSQL = `DELETE FROM ${nomeBD}.${tabela} WHERE ${clausuraWhereString};`;
    var sql = mysql.format(templateSQL, Object.values(argWhere));

    var saida = syncSQL.mysql(
      {
        host: configuracoes.ipBanco,
        port: configuracoes.porta,
        user: configuracoes.bancoUsername,
        password: configuracoes.bancoSenha,
        database: nomeBD,
        ssl: {
          ca: fs.readFileSync(`${configuracoes.pastaChaves}/server-ca.pem`),
          key: fs.readFileSync(`${configuracoes.pastaChaves}/client-key.pem`),
          cert: fs.readFileSync(`${configuracoes.pastaChaves}/client-cert.pem`),
        },
      },
      sql
    );

    return saida;
  }

  select(nomeBD, tabela, colunas, argWhere, limite) {
    var clausuraWhereString = Object.keys(argWhere)
      .map((e) => e + "=?")
      .join(" AND ");

    if (limite !== null) {
      limite = " LIMIT " + limite;
    } else {
      limite = "";
    }

    var templateSQL = `SELECT ${colunas} FROM ${nomeBD}.${tabela} WHERE ${clausuraWhereString} ${limite};`;
    var sql = mysql.format(templateSQL, Object.values(argWhere));

    var saida = syncSQL.mysql(
      {
        host: configuracoes.ipBanco,
        port: configuracoes.porta,
        user: configuracoes.bancoUsername,
        password: configuracoes.bancoSenha,
        database: nomeBD,
        ssl: {
          ca: fs.readFileSync(`${configuracoes.pastaChaves}/server-ca.pem`),
          key: fs.readFileSync(`${configuracoes.pastaChaves}/client-key.pem`),
          cert: fs.readFileSync(`${configuracoes.pastaChaves}/client-cert.pem`),
        },
      },
      sql
    );
    return saida.data.rows.map((registro) => Object.values(registro));
  }

  update(nomeBD, tabela, argUpdate, argWhere) {
    var clausuraWhereString = Object.keys(argWhere)
      .map((e) => e + "=?")
      .join(" AND ");
    var clausuraUpdateString = Object.keys(argUpdate)
      .map((e) => e + "='" + argUpdate[e] + "'")
      .join(" AND ");

    var templateSQL = `UPDATE ${nomeBD}.${tabela} SET ${clausuraUpdateString} WHERE ${clausuraWhereString};`;
    var sql = mysql.format(templateSQL, Object.values(argWhere));

    var saida = syncSQL.mysql(
      {
        host: configuracoes.ipBanco,
        port: configuracoes.porta,
        user: configuracoes.bancoUsername,
        password: configuracoes.bancoSenha,
        database: nomeBD,
        ssl: {
          ca: fs.readFileSync(`${configuracoes.pastaChaves}/server-ca.pem`),
          key: fs.readFileSync(`${configuracoes.pastaChaves}/client-key.pem`),
          cert: fs.readFileSync(`${configuracoes.pastaChaves}/client-cert.pem`),
        },
      },
      sql
    );
    return saida.success;
  }
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

    var interfaceBD = new InterfaceBD(
      configuracoes.bancoURI,
      configuracoes.bancoUsername,
      configuracoes.bancoSenha,
      configuracoes.arquivosChaves._serverSslCertificate,
      configuracoes.arquivosChaves._clientSslCertificate,
      configuracoes.arquivosChaves._clientSslKey
    );

    var argWhere = { saquesempre_carteira: carteiraUsuarioSS };

    var registros = interfaceBD.select(
      nomeBD,
      nomeTabela,
      colunas,
      argWhere,
      1
    );

    if (registros.length > 0)
      return {
        merchantIDAditum: registros[0][0],
        merchantTokenAditum: registros[0][1],
        walletSaqueSempre: registros[0][2],
      };
    return [];
  }

  obterTodasAsTransacoesBanco(carteiraUsuario, papelUsuario) {
    //select(nomeBD, tabela, colunas, argWhere, limite) {
    var nomeBD = "transacoessaquesempre";
    var tabelas = ["saque", "pagamento"];
    var saidaTransacoes = {
      saque: [],
      pagamento: [],
    };

    var colunas = todasColunas[papelUsuario];

    var argWhere = { saque_carteira: carteiraUsuario };
    var interfaceBD = new InterfaceBD(
      configuracoes.bancoURI,
      configuracoes.bancoUsername,
      configuracoes.bancoSenha,
      configuracoes.arquivosChaves._serverSslCertificate,
      configuracoes.arquivosChaves._clientSslCertificate,
      configuracoes.arquivosChaves._clientSslKey
    );

    tabelas.forEach((nomeTabela) => {
      saidaTransacoes[nomeTabela] = interfaceBD.select(
        nomeBD,
        nomeTabela,
        colunas,
        argWhere,
        null
      );
    });

    /*Object.keys(tabelas).forEach((tipoOperacao, indice) => {
      tabelas[tipoOperacao].map((nomeTabela) => {
        saidaTransacoes[tipoOperacao][nomeTabela] = interfaceBD.select(
          nomeBD,
          nomeTabela,
          colunas,
          argWhere,
          null
        );
      });
    });*/
    /*var saidaTransacoes = interfaceBD.select(
      nomeBD,
      tabela,
      colunas,
      argWhere,
      null
    );*/
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
    // var flag = 0;

    configuracoes.tabelas.forEach(function (nomeTabela, indice) {
      resLoginTemp = interfaceBD.select(
        bd,
        nomeTabela,
        colunasProjetadas,
        { nomeusuario: usuario, senha: hashSenha },
        1
      );

      //var resLoginTemp = registrosSaida;
      if (resLoginTemp != null) {
        resLogin = resLogin.concat(resLoginTemp);
        if (resLoginTemp.length && papelUsuario === "")
          papelUsuario = nomeTabela;
      }
    });

    if (resLogin != null && resLogin != []) {
      if (resLogin.length > 0) {
        return {
          estado: "aberta",
          conteudo: resLogin,
          papelUsuario: papelUsuario,
          carteiraUsuario:
            resLogin[0][colunasProjetadas.indexOf(nomeColunaCarteira)],
          horaAbertura: new Date(),
        };
      }
      /*return ContentService.createTextOutput(
        JSON.stringify({ nome: "isaias" })
      ).setMimeType(ContentService.MimeType.JSON);*/
    }

    return { estado: "fechada", conteudo: [], horaAbertura: new Date() };
  }

  fecharSessao() {}
}

configuracoes.arquivosChaves._serverSslCertificate = new UtilsSS().abrirArquivo(
  configuracoes.pastaChaves + "/server-ca.pem"
);
configuracoes.arquivosChaves._clientSslCertificate = new UtilsSS().abrirArquivo(
  configuracoes.pastaChaves + "/client-cert.pem"
);
configuracoes.arquivosChaves._clientSslKey = new UtilsSS().abrirArquivo(
  configuracoes.pastaChaves + "/client-key.pem"
);

interfaceBD = new InterfaceBD(
  configuracoes.bancoURI,
  configuracoes.bancoUsername,
  configuracoes.bancoSenha,
  configuracoes.arquivosChaves._serverSslCertificate,
  configuracoes.arquivosChaves._clientSslCertificate,
  configuracoes.arquivosChaves._clientSslKey
);

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

function acaoLogin(usuario, hashSenha) {
  objSessao = interfaceApp.abrirSessao("cadastro", usuario, hashSenha);
  saida = [objSessao];
  if (objSessao.estado == "aberta") {
    transacoesCarteira = interfaceApp.obterTodasAsTransacoesBanco(
      objSessao.carteiraUsuario,
      objSessao.papelUsuario
    );
    var objSaida = new UtilsSS().gerarObjetoResposta(
      codigosAplicacao.sucessoLogin,
      { obj: transacoesCarteira, papel: objSessao.papelUsuario }
    );
    return objSaida;
  } else {
    var objSaida = new UtilsSS().gerarObjetoErroLogin("");
    return objSaida;
  }
}

function acaoExtrato(usuario, hashSenha) {
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

    return new UtilsSS().gerarObjetoResposta(codigosAplicacao.sucessoLogin, {
      obj: objExtrato,
      papel: objSessao.papelUsuario,
    });
  } else {
    return new UtilsSS().gerarObjetoErroLogin("");
  }
}

function acaoAcessoAditum(usuario, hashSenha) {
  objSessao = interfaceApp.abrirSessao("cadastro", usuario, hashSenha);
  saida = [objSessao];
  if (objSessao.estado == "aberta") {
    //carteiraUsuario
    //var saida = interfaceApp.obterCredenciaisAditum(carteiraSS);
    var saida = interfaceApp.obterCredenciaisAditum(objSessao.carteiraUsuario);

    return new UtilsSS().gerarObjetoResposta(codigosAplicacao.sucessoLogin, {
      obj: saida,
    });
  } else {
    return new UtilsSS().gerarObjetoErroLogin("");
  }
}

function acaoGerarSenha(emailUsuario) {
  // insere registro ou atualizda
  // se data estiver defasada, delete
  var interfaceBD = new InterfaceBD(
    configuracoes.bancoURI,
    configuracoes.bancoUsername,
    configuracoes.bancoSenha,
    configuracoes.arquivosChaves._serverSslCertificate,
    configuracoes.arquivosChaves._clientSslCertificate,
    configuracoes.arquivosChaves._clientSslKey
  );

  var argWhere = { nomeusuario: emailUsuario };

  var saidaSelect = interfaceBD.select(
    "cadastro",
    "todosNomesUsuario",
    "nomeusuario",
    argWhere,
    1
  );

  if (saidaSelect.length === 0) {
    return new UtilsSS().gerarObjetoResposta(
      codigosAplicacao.loginNaoEncontrado,
      {
        obj: [],
      }
    );
  }

  var saidaDelecao = interfaceBD.delete(
    "cadastro",
    "token_redefinicao_senha",
    argWhere
  );

  var tokenTemporario = crypto.randomBytes(64).toString("hex").substring(0, 30);
  var dataCriacaoRegistro = moment(new Date()).format(
    configuracoes.padraoDataString
  );

  var dadosInseriveis = {
    nomeusuario: emailUsuario,
    token: tokenTemporario,
    datahora: dataCriacaoRegistro,
  };

  interfaceBD.insert("cadastro", "token_redefinicao_senha", dadosInseriveis);

  return new UtilsSS().gerarObjetoResposta(codigosAplicacao.loginEncontrado, {
    obj: [],
  });
}

function acaoRedefinir(emailUsuario, hashSenha, tokenTemporario) {
  // insere registro ou atualizda
  // se data estiver defasada, delete
  var colunasProjetadas = ["nomeusuario", "datahora"];
  var nomeColunaCarteira = "carteira";

  console.log(emailUsuario);
  var saidaSelect = null;
  var argWhere = { nomeusuario: emailUsuario, token: tokenTemporario };

  try {
    resLoginTemp = interfaceBD.select(
      "cadastro",
      "token_redefinicao_senha",
      colunasProjetadas,
      argWhere,
      1
    );

    if (resLoginTemp.length !== 0) {
      saidaSelect = resLoginTemp;
      interfaceBD.delete("cadastro", "token_redefinicao_senha", argWhere);
      throw e;
    }
  } catch (e) {}

  if (saidaSelect !== null) {
    datahora = moment(saidaSelect[0][1], configuracoes.padraoDataString);
    agora = moment();
    diferencaHora = agora.diff(datahora, "hours");

    if (diferencaHora <= configuracoes.janelaHorasMaxima) {
      configuracoes.tabelas.forEach((tabela) => {
        try {
          interfaceBD.update(
            "cadastro",
            tabela,
            { senha: hashSenha },
            { nomeusuario: emailUsuario }
          );
        } catch (e) {}
      });
    } else {
    }

    return new UtilsSS().gerarObjetoResposta(codigosAplicacao.loginEncontrado, {
      obj: [],
    });
  }

  return new UtilsSS().gerarObjetoResposta(
    codigosAplicacao.erroNaoIdentificado,
    {
      obj: [],
    }
  );
}

app.get("/", function (req, res) {
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

app.get("/mysql2", function (req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "application/json");
  res.send(JSON.stringify({ nome: "teste" }));
  return;
});

app.get("/mysql", async function (req, res) {
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

  connection.query("SELECT * FROM acesso_aditum", null, function (
    err,
    resultados
  ) {
    console.log(resultados);
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", "application/json");
    res.send(
      JSON.stringify({ tipo: typeof resultados, len: resultados.length })
    );
    return;
  });

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "application/json");
  res.send(JSON.stringify({}));
  return;
});

app.post("/", function (req, res) {
  var objEntrada = req.body;
  var usuario = objEntrada.usuario;
  var hashSenha = objEntrada.token;
  var tokenTemporario = objEntrada.tokenTemporario;
  var acao = objEntrada.acao;

  var tratadorRota = {
    extrato: acaoExtrato,
    login: acaoLogin,
    acessoAditum: acaoAcessoAditum,
    gerarSenha: acaoGerarSenha,
    redefinirSenha: acaoRedefinir,
  };

  // function acaoRedefinir(emailUsuario, token, hashSenha, hashSenhaReinserida) {
  //res.setHeader("Access-Control-Allow-Origin", "*");

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "application/json");

  if (acao in tratadorRota) {
    var objSaida = tratadorRota[acao](...[usuario, hashSenha, tokenTemporario]);
    res.send(JSON.stringify(objSaida));
    return;
  }

  var objSaida = {
    codigo: codigosAplicacao.erroNaoIdentificado,
    "data-hora": new Date(),
    conteudo: [],
  };

  res.send(JSON.stringify(objSaida));
  return;
});

app.post("/login", function (req, res) {
  var objEntrada = req.body;
  var usuario = objEntrada.usuario;
  var hashSenha = objEntrada.token;

  var objSaida = acaoLogin(usuario, hashSenha);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "application/json");
  res.send(JSON.stringify(objSaida));
  return;
});

app.post("/extrato", function (req, res) {
  var objEntrada = req.body;
  var usuario = objEntrada.usuario;
  var hashSenha = objEntrada.token;

  console.log([usuario, hashSenha]);

  var objSaida = acaoExtrato(usuario, hashSenha);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "application/json");
  res.send(JSON.stringify(objSaida));
  return;
});

app.post("/acessoAditum", function (req, res) {
  var objEntrada = req.body;
  var usuario = objEntrada.usuario;
  var hashSenha = objEntrada.token;

  var objSaida = acaoAcessoAditum(usuario, hashSenha);

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "application/json");
  res.send(JSON.stringify(objSaida));
  return;
});

app.get("/chave", function (req, res) {
  var chave = new UtilsSS().abrirArquivo("teste.txt");
  res.send(chave);
  return;
});

app.listen(porta, function () {
  console.log(`\n\nServidor Saque Sempre escutando na porta ${porta}!\n\n`);
});

console.log("\nExecutando o servidor Saque Sempre!\n");
