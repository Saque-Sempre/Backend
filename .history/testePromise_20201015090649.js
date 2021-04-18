function loginOffline(nome, senha) {
  return new Promise((resolve) => {
    for (var i = 0; i < 1000000; i++) {}
    resolve("Foi: " + i);
  });
}

async function logar() {
  await loginOffline("myname", "mypassword").then((result) => {
    if (result) {
      console.log("Sim. " + result);
    } else {
      console.log("Nao. " + result);
    }
  });
}

console.log("Antes de chamar a funcao logar()");

Promise.all([logar()]).finally((v) => {
  console.log("Resolucao da promisse.");
});

console.log("Depois de chamar a funcao logar()");
