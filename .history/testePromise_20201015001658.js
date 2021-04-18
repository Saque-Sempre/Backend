var p1 = new Promise(function (resolve, reject) {
  resolve("Success!");
  // or
  // reject ("Error!");
});

var waitForPromise = async () => {
  // let result = await any Promise, like:
  let result = await Promise.resolve(p1);

  p1.then(
    function (value) {
      console.log(value); // Success!
    },
    function (reason) {
      console.log(reason); // Error!
    }
  );
};

console.log("Promise criada e sendo executada.");
console.log("Fim da thread principal.");
