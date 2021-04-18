var p1 = new Promise(function (resolve, reject) {
  resolve("Success!");
  // or
  // reject ("Error!");
});

console.log("Promise criada e sendo executada.");

var f = () => {
var f2 = async () = {
  p1.then(
    function (value) {
      console.log(value); // Success!
    },
    function (reason) {
      console.log(reason); // Error!
    }
  );
};}

var r = await f();
console.log("Fim da thread principal.");
