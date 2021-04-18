function loginOffline(nome, senha) {
  return new Promise((resolve) => {
    resolve("foi!");
  });
}

loginOffline("myname", "mypassword").then((result) => {
  if (result) {
    console.log("Sim");
  } else {
    console.log("Nao");
  }
});

console.log("Fim do main()");
