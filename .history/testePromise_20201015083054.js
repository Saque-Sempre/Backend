function loginOffline(nome, senha) {
  return new Promise((resolve) => {
    resolve("foi!");
  });
}

loginOffline("myname", "mypassword").then((result) => {
  if (result) {
    //do something
  } else {
    //do something else
  }
});

console.log("Fim do main()");
