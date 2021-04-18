//import to from "await-to-js";
const to = require("await-to-js").default;

async function funcao(n) {
  return true;
}

async function asyncTaskWithCb(cb) {
  let [err, num] = await to(funcao(1));
  console.log(JSON.stringify([err, num]));
  return cb("No user found");
}

var l = asyncTaskWithCb((e) => {
  console.log(e);
});
