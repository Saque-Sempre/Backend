var p1 = new Promise(function (resolve, reject) {
  resolve("Success!");
  // or
  // reject ("Error!");
});

var waitForPromise = async () => {
  // let result = await any Promise, like:
  let result = await Promise.resolve(p1);
};

console.log("Promise criada e sendo executada.");
p1.then(
  function (value) {
    console.log(value); // Success!
  },
  function (reason) {
    console.log(reason); // Error!
  }
);

var r = f();
console.log("Fim da thread principal.");
