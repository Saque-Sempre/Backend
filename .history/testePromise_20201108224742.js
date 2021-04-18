//import to from "await-to-js";
const to = require("await-to-js").default;

function funcao(n) {
  return n;
}

async function asyncTaskWithCb(cb) {
  const [err, numero] = await to(funcao(1));
  if (numero) return cb("No user found");
  else throw new Error("");
}

asyncTaskWithCb((e) => {
  console.log(e);
});
