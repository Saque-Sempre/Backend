let variavelMain = "Pending";

async function funcao() {
  var p1 = new Promise(function (resolve, reject) {
    resolve("Success!");
  });

  await p1.then(
    function (value) {
      console.log(value); // Success!
      variavelMain = "RetornoSucesso";
      console.log("PROMISE -> variavelMain: " + variavelMain);
    },
    function (reason) {
      console.log(reason); // Error!
      variavelMain = "RetornoInsucesso";
      console.log("PROMISE -> variavelMain: " + variavelMain);
    }
  );
}

var valor = funcao();

console.log("valor: " + valor);
console.log("variavelMain: " + variavelMain);
variavelMain = "MAIN ESCREVEU NA VARIAVEL";
/*console.log("Promise criada e sendo executada.");
console.log(p1);
console.log(variavelMain);
console.log("Fim da thread principal.");*/
