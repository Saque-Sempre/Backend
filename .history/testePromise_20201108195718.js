function f() {
  return new Promise((resolve) => {
    for (var i = 0; i < 1000000; i++) {}
    resolve(10);
  });
}

async function opa() {
  return await f();
}

console.log(opa());
console.log("Fim do <main>");
