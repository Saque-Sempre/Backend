function f(k) {
  return new Promise((resolve, reject) => {
    for (var i = 0; i < k; i++) {}
    resolve(i);
  });
}

async function opa() {
  var v = await f();
  return v;
}

function foi() {
  opa()
    .then((e) => {
      console.log("Fim da Promise: " + e);
      return true;
    })
    .catch((e) => {
      console.log("Deu ruim na Promise: " + e);
      return false;
    });
}

console.log(Promise.resolve(f(1000000000)));
console.log("Fim do <main>");
