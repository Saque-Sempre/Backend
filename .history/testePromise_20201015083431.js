function loginOffline(nome, senha) {
  return new Promise((resolve) => {
    resolve("foi!");
  });
}

async function logar() {
  loginOffline("myname", "mypassword").then((result) => {
    if (result) {
      console.log("Sim " + result);
    } else {
      console.log("Nao " + result);
    }
  });

  console.log("Fim do main()");
}

logar();
