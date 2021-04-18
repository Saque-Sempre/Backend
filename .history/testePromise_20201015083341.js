function loginOffline(nome, senha) {
  return new Promise((resolve) => {
    resolve("foi!");
  });
}

public async logar() {
loginOffline("myname", "mypassword").then((result) => {
  if (result) {
    console.log("Sim " + result);
  } else {
    console.log("Nao " + result);
  }
});

console.log("Fim do main()");
}