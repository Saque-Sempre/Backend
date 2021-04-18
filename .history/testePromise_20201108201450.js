function f() {
  return new Promise((resolve, reject) => {
    for (var i = 0; i < 1; i++) {}
    resolve(i);
  });
}

async function opa() {
  var v = await f();
  return v;
}

var v = f()
  .then((e) => {
    console.log("Fim da Promise: " + e);
  })
  .catch((e) => {
    console.log("Deu ruim na Promise: " + e);
  });

console.log("Fim do <main>");
