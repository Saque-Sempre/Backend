let variavelMain = "Pending";

var p1 = new Promise(function (resolve, reject) {
  resolve("Success!");
});

p1.then(
  function (value) {
    variavelMain = "Sucesso";
    console.log(value); // Success!
  },
  function (reason) {
    variavelMain = "Insucesso";
    console.log(reason); // Error!
  }
);

console.log("Promise criada e sendo executada.");
console.log(p1);
console.log(variavelMain);
console.log("Fim da thread principal.");
