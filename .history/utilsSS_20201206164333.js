var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var fs = require("fs");

const configuracoes = require("./configs");

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

module.exports = UtilsSS;
