function f() {
  return new Promise((resolve) => {
    for (var i = 0; i < 1000000; i++) {}
    resolve(10);
  });
}

async function opa() {
  var v = await f();
  return v;
}

opa().then((e) => {
  console.log("Fim do <main>: " + e);
});
