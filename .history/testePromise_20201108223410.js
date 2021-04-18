import to from "await-to-js";

async function asyncTaskWithCb(cb) {
  let err, user, savedTask, notification;

  [err, user] = await to(UserModel.findById(1));
  if (!user) return cb("No user found");
}
