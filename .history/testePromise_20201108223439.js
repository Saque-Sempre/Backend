import to from "await-to-js";

function funcao(n) {
  return n;
}

async function asyncTaskWithCb(cb) {
  let err, user, savedTask, notification;

  [err, user] = await to(funcao(1));
  if (!user) return cb("No user found");
}
