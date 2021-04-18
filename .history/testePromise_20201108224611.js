//import "await-to-js";
const to = require("await-to-js").default;

function funcao(n) {
  return n;
}

async function asyncTaskWithCb(cb) {
  const n = await to(funcao(1));
  if (n) return cb("No user found");
  else throw new Error("");
}

asyncTaskWithCb((e) => {
  console.log(e);
});
