//import to from "await-to-js";
const to = require("await-to-js").default;

function funcao() {
  return [0, 0];
}

async function asyncTaskWithCb(cb) {
  const [err, numero] = await to(funcao());
  if (err) return cb("No user found");
  else throw new Error("");
}

asyncTaskWithCb(function t(e) {
  console.log(e);
});
