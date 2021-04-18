function loginOffline(nome, senha) {
  return new Promise((resolve) => {
    for (var i = 0; i < 1000000; i++) {}
    resolve("Foi: " + i);
  });
}

async function logar() {
  await loginOffline("myname", "mypassword").then((result) => {
    if (result) {
      console.log("Sim " + result);
    } else {
      console.log("Nao " + result);
    }
  });

  console.log("Fim do main()");
}

console.log("Antes de chamar a funcao logar()");
logar();
console.log("Depois de chamar a funcao logar()");
