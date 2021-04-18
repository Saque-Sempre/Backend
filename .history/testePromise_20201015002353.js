let variavelMain = "Pending";

function funcao() {
  var p1 = new Promise(function (resolve, reject) {
    variavelMain = "Sucesso";
    resolve("Success!");
  });

  p1.then(
    function (value) {
      console.log(value); // Success!
    },
    function (reason) {
      console.log(reason); // Error!
    }
  );
}
console.log("Promise criada e sendo executada.");
console.log(p1);
console.log(variavelMain);
console.log("Fim da thread principal.");
