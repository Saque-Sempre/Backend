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

function foi() {
  var v = opa()
    .then((e) => {
      console.log("Fim da Promise: " + e);
      return true;
    })
    .catch((e) => {
      console.log("Deu ruim na Promise: " + e);
      return false;
    });
  return v;
}

console.log(foi());
console.log("Fim do <main>");
