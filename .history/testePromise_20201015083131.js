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

loginOffline("myname", "mypassword");
console.log("Fim do main()");
