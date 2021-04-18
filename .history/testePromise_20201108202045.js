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

console.log(Promise.resolve(foi()));
console.log("Fim do <main>");
