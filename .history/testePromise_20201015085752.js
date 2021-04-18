function loginOffline(nome, senha) {
  return new Promise((resolve) => {
    for (var i = 0; i < 10000; i++) {}
    resolve("foi!");
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

logar();
