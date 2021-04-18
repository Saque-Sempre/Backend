//import to from "await-to-js";
const to = require("await-to-js").default;

async function funcao(n) {
  return true;
}

async function asyncTaskWithCb(cb) {
  let [err, num] = await to(funcao(1));
  if (err) return cb("No user found");
}

asyncTaskWithCb((e) => {
  console.log(e);
});
