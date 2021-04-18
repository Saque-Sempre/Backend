async function resolveAfter2Seconds(x) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(x);
    }, 2000);
  });
}

async function f1() {
  const x = await resolveAfter2Seconds(10);
  console.log(x); // 10
}

function f2() {
  f1();
}

f1()
  .then((e) => {
    console.log("Terminou!");
  })
  .catch((e) => {
    console.log("Deu merda!");
  });
console.log("Fim do main");
