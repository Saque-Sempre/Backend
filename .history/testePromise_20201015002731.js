let variavelMain = "Pending";

async function funcao() {
  var p1 = new Promise(function (resolve, reject) {
    resolve("Success!");
  });

  p1.then(
    await function (value) {
      console.log(value); // Success!
      variavelMain = "RetornoSucesso";
    },
    await function (reason) {
      console.log(reason); // Error!
      variavelMain = "RetornoInsucesso";
    }
  );
}

var valor = funcao();

console.log(valor);
console.log(variavelMain);
/*console.log("Promise criada e sendo executada.");
console.log(p1);
console.log(variavelMain);
console.log("Fim da thread principal.");*/
