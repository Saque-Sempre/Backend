var express = require("express");
var fs = require("fs");
var mysql = require("mysql");

var app = express();
var port = 3001;

var bodyParser = require("body-parser");
app.use(bodyParser.json());

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

var papeisColunasExtras = ["rede", "parceiro"];
var colunaExtra = "nomeCliente";

const codigosAplicacao = {
  sucessoLogin: "SUCESSO_LOGIN",
  erroLogin: "ERRO_LOGIN",
  erroNaoIdentificado: "ERRO_NAO_IDENTIFICADO",
  erroInternoServidor: "ERRO_INTERNO_SERVIDOR",
};

class UtilsSS {
  constructor() {}

  abrirArquivo(n) {
    return fs.readFileSync(n, "utf8").toString();
  }

  gerarObjetoResposta(codigo, objSaida) {
    return { codigo: codigo, "data-hora": new Date(), conteudo: objSaida };
  }

  fazerRequisicaoHTTP(tipo, url) {
    var headers = { Authorization: configuracoes.apiInfinitePayKey };
    var options = {
      method: tipo,
      headers: headers,
    };
    var response = UrlFetchApp.fetch(url, options);
    return {
      code: response.getResponseCode(),
      content: response.getContentText(),
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
      host: "127.0.0.1",
      port: "3306",
      user: "root",
      password: "813",
      database:
        "teste" /*,
      ssl: {
        ca: fs.readFileSync("./ChavesMySQL/server-ca.pem"),
        key: fs.readFileSync("./ChavesMySQL/client-key.pem"),
        cert: fs.readFileSync("./ChavesMySQL/client-cert.pem"),
      }*/,
    });

    console.log(this.arqSSLServCert);
    console.log(this.arqSSLCliCert);
    console.log("---");

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

  select(nomeBD, tabela, colunas, argWhere, limite) {
    if (colunas == [] || colunas == null) colunas = "*";
    else colunas = colunas.join(",");

    var clausuraWhereString = Object.keys(argWhere)
      .map((e) => e + "=?")
      .join(" AND ");
    var templateSQL = `SELECT ${colunas} FROM ${nomeBD}.${tabela} WHERE ${clausuraWhereString};`;
    var conexao = this.abrirConexaoCriptografada();

    conexao.connect();

    if (conexao == null) {
      return null;
    }

    console.log(templateSQL);
    //var stmt = conexao.prepareStatement(templateSQL);
    //templateSQL = templateSQL.split('<tabela>').join(tabela);

    var listaParamsWhere = [];

    for (var iArg = 0; iArg < Object.keys(argWhere).length; iArg++)
      listaParamsWhere.push(argWhere[Object.keys(argWhere)[iArg]]);
    //stmt.setString(iArg + 1, argWhere[Object.keys(argWhere)[iArg]]);

    //if (!(limite in ["infinito", ""]) && limite != null) {
    //stmt.setMaxRows(limite);
    //}
    //var stmt = conexao.createStatement();
    console.log([templateSQL, listaParamsWhere]);

    conexao.query(templateSQL, listaParamsWhere, function (
      error,
      results,
      fields
    ) {
      console.log(fields);
    });
    console.log("Estou aqui...");

    //console.log(stmt);
    /*    var registrosSaida = [];
    var resultados = stmt.executeQuery();
    var registroLinha = [];
    var lenColunas = resultados.getMetaData().getColumnCount();

    while (resultados.next()) {
      registroLinha = [];
      for (var col = 0; col < lenColunas; col++) {
        registroLinha.push(resultados.getObject(col + 1));
      }
      registrosSaida.push(registroLinha);
    }*/

    return [];
  }

  update(nomeBD, tabela, argUpdate, argWhere) {
    var clausulaUpdate = [];
    var tamanhoClausulaUpdate = 0;

    Object.values(argUpdate).forEach(([chave, valor], indice) => {
      tamanhoClausulaUpdate += 2;
      clausulaUpdate.push("?=?");
    });

    var templateSQL =
      "UPDATE ? SET " + clausulaUpdate.join(", ") + " WHERE ?=? AND ?=?;";
    var stmt = conexao.prepareStatement(templateSQL);

    for (var indice = 0; indice < tamanhoClausulaUpdate; indice += 2) {
      stmt.setString(indice, argUpdate[indice / 2][0]);
      stmt.setString(indice + 1, argUpdate[indice / 2][1]);
    }

    stmt.setString(tamanhoClausulaUpdate, argUpdate[0][1]);
    stmt.setString(tamanhoClausulaUpdate + 1, argUpdate[1][1]);
    stmt.setString(tamanhoClausulaUpdate + 2, argUpdate[0][1]);
    stmt.setString(tamanhoClausulaUpdate + 3, argUpdate[1][1]);

    var conexao = this.abrirConexaoCriptografada();
    clausulaUpdate = clausulaUpdate.join(",");

    if (conexao.isClosed()) {
      return null;
    }
  }
}

class InterfaceApp {
  constructor() {
    this.utilsSS = new UtilsSS();
  }

  gerarSaidaBrowser(objeto) {}

  tratarAcao(paramsURL) {}

  obterDadosView(nomeUsuario, hashSenha) {
    return false;
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

    if (registros.length > 0) return registros[0];
    return [];
  }

  obterTodasAsTransacoesBanco(carteiraUsuario, papelUsuario) {
    //select(nomeBD, tabela, colunas, argWhere, limite) {
    var nomeBD = "transacoessaquesempre";
    var tabelas = {
      saque: ["saque"],
      pagamento: ["pagamento"],
    };
    var saidaTransacoes = {
      saque: { saque: [] },
      pagamento: { pagamento: [] },
    };

    /*
        var tabelas = {
      saque: ["saque"],
      pagamento: ["pagamento"],
    };
    var saidaTransacoes = {
      saque: { saque: [] },
      pagamento: { pagamento: [] },
    };
    */

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

    Object.keys(tabelas).forEach((tipoOperacao, indice) => {
      var nomesTabelasConsultadas = tabelas[tipoOperacao];
      tabelas[tipoOperacao].map((nomeTabela) => {
        saidaTransacoes[tipoOperacao][nomeTabela] = interfaceBD.select(
          nomeBD,
          nomeTabela,
          colunas,
          argWhere,
          null
        );
      });
    });
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
    var indicePagina = 1;
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

      var todosRegistrosTransacao = [];
    }
  }
  // select(nomeBD, tabela, colunas, argWhere, limite)
  abrirSessao(bd, usuario, hashSenha) {
    var resLogin = [];
    var papelUsuario = "";
    var colunasProjetadas = ["nomeusuario", "senha", "carteira"];
    var nomeColunaCarteira = "carteira";

    configuracoes.tabelas.forEach(function (nomeTabela, indice) {
      var resLoginTemp = interfaceBD.select(
        bd,
        nomeTabela,
        colunasProjetadas,
        { nomeusuario: usuario, senha: hashSenha },
        1
      );
      if (resLoginTemp != null) {
        resLogin = resLogin.concat(resLoginTemp);
        if (resLoginTemp.length && papelUsuario === "")
          papelUsuario = nomeTabela;
      }
      console.log(
        `A saida da tabela ${nomeTabela} foi: ${resLoginTemp}\nE possui comprimento de ${resLoginTemp.length}`
      );
    });

    console.log(
      `A saida das tabelas foi: ${resLogin}\nE possui comprimento de ${resLogin.length}`
    );

    if (resLogin != null && resLogin != {}) {
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
  "./ChavesMySQL/server-ca.pem"
);
configuracoes.arquivosChaves._clientSslCertificate = new UtilsSS().abrirArquivo(
  "./ChavesMySQL/client-cert.pem"
);
configuracoes.arquivosChaves._clientSslKey = new UtilsSS().abrirArquivo(
  "./ChavesMySQL/client-key.pem"
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

function main(usuario, hashSenha, acao) {
  saida = [];
  var saidaHTTP = new UtilsSS().gerarObjetoResposta(
    codigosAplicacao.erroNaoIdentificado,
    []
  );

  if (acao == "login") {
    // Abre sessão e já coleta objeto
    objSessao = interfaceApp.abrirSessao("cadastro", usuario, hashSenha);
    if (objSessao.estado == "aberta") {
      var objTransacoesCarteira = interfaceApp.obterTodasAsTransacoesBanco(
        objSessao.carteiraUsuario
      );
      saidaHTTP = new UtilsSS().gerarObjetoResposta(
        codigosAplicacao.sucessoLogin,
        objTransacoesCarteira
      );
      saidaHTTP = ContentService.createTextOutput(JSON.stringify(saidaHTTP));
      saidaHTTP.setMimeType(ContentService.MimeType.JSON);
      return saidaHTTP;
    } else {
      saidaHTTP = new UtilsSS().gerarObjetoResposta(
        codigosAplicacao.erroLogin,
        []
      );
    }
  }

  return HtmlService.createHtmlOutput(JSON.stringify(saidaHTTP));

  /*main();
  console.log(JSON.stringify(e));
  output = ContentService.createTextOutput(JSON.stringify(e.postData.contents));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;*/
}

function obterExtrato(carteira, nomeCliente, pagina, limite, papelUsuario) {
  var saidaFuncao = {};
  var urlsExtrato = {
    recebiveis: `https://api.infinitepay.io/v1/wallets/${carteira}/receivables/brl`,
    transferencias: `https://api.infinitepay.io/v1/wallets/${carteira}/bank_transfers`,
    faturamentos: `https://api.infinitepay.io/v1/wallets/${carteira}/billings`,
  };

  Object.entries(urlsExtrato).forEach(([operacao, urlIter], indice) => {
    //var objSaida = requisicaoHTTP(url, {});
    pagina = 1;
    limite = 100;
    var maximoPaginas = 1;

    // Iterando, rigorosamente, TODAS AS PAGINAS
    while (pagina <= maximoPaginas) {
      var url = urlIter + `?page=${pagina}&limit=${limite}`;
      var objSaida = JSON.parse(
        new UtilsSS().fazerRequisicaoHTTP("GET", url).content
      );
      maximoPaginas = objSaida.pagination.total_pages;

      // Iterando todos os registros
      for (
        var indiceRegistro = 0;
        indiceRegistro < objSaida.results.length;
        indiceRegistro++
      ) {
        data = objSaida.results[indiceRegistro]["payment_date"].slice(0, 10);
        var subObj = (({ payment_date, amount }) => ({ payment_date, amount }))(
          objSaida.results[indiceRegistro]
        );
        subObj["payment_date"] = subObj["payment_date"].slice(0, 10);
        subObj["operacao"] = operacao;

        if (papeisColunasExtras.includes(papelUsuario)) {
          subObj[colunaExtra] = nomeCliente;
        }

        colunas = Object.keys(subObj);

        if (!Object.keys(saidaFuncao).includes(data)) saidaFuncao[data] = [];
        saidaFuncao[data].push(subObj);
      }
      pagina++;
    }
  });

  return { transacoes: saidaFuncao, colunas: colunas };
}

app.post("/", function (req, res) {
  res.send("Olá Mundo!");
});

app.post("/login", function (req, res) {
  var objEntrada = req.body;
  var usuario = objEntrada.usuario;
  var hashSenha = objEntrada.token;
  /*var acao = objEntrada.acao;
  var pagina = objEntrada.pagina;
  var limite = objEntrada.limite;
  var carteiraSS = objEntrada.carteiraSS;*/

  console.log([usuario, hashSenha]);

  objSessao = interfaceApp.abrirSessao("cadastro", usuario, hashSenha);
  saida = [objSessao];
  /*if (objSessao.estado == "aberta") {
    transacoesCarteira = interfaceApp.obterTodasAsTransacoesBanco(
      objSessao.carteiraUsuario,
      objSessao.papelUsuario
    );
    var objSaida = new UtilsSS().gerarObjetoResposta(
      codigosAplicacao.sucessoLogin,
      { obj: transacoesCarteira, papel: objSessao.papelUsuario }
    );
    var saidaHTTP = ContentService.createTextOutput(JSON.stringify(objSaida));
    saidaHTTP.setMimeType(ContentService.MimeType.JSON);
    return saidaHTTP;
  }*/

  res.send("Vai");
});

app.post("/extrato", function (req, res) {
  res.send("Vai!");
});

app.post("/acessoAditum", function (req, res) {
  console.log("Got body:", req.body);
  res.send("Vai!");
});

app.listen(port, function () {
  console.log(`Servidor Saque Sempre escutando na porta ${port}!`);
});

console.log("Executando o servidor Saque Sempre!");
