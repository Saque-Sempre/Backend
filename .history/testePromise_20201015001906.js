var p1 = new Promise(function (resolve, reject) {
  resolve("Success!");
  // or
  // reject ("Error!");
});

p1.then(
  function (value) {
    console.log(value); // Success!
  },
  function (reason) {
    console.log(reason); // Error!
  }
);

waitForPromise();
console.log("Promise criada e sendo executada.");
console.log("Fim da thread principal.");
