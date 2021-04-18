function f() {
  return new Promise((resolve) => {
    for (var i = 0; i < 1000000; i++) {}
    reject(i);
  });
}

async function opa() {
  var v = await f();
  return v;
}

f()
  .then((e) => {
    console.log("Fim da Promise: " + e);
  })
  .catch((e) => {
    console.log("Deu ruim na Promise: " + e);
  });

console.log("Fim do <main>");
