/*function f(k) {
  return new Promise((resolve, reject) => {
    for (var i = 0; i < k; i++) {}
    resolve(i * 2);
  });
}

async function opa() {
  var v = await f();
  return v;
}

function foi() {
  opa()
    .then((e) => {
      console.log("Fim da Promise: " + e);
      return true;
    })
    .catch((e) => {
      console.log("Deu ruim na Promise: " + e);
      return false;
    });
}

var v = Promise.resolve(f(1000000000));
var v2;
v.then((e) => {
  console.log(e);
});
console.log(v2);
console.log("Fim do <main>");*/

let hello = async function () {
  return "Hello";
};
hello().then((e) => {
  {
    console.log(e);
  }
});

/*function resolveAfter2Seconds(x) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(x);
    }, 2000);
  });
}

async function f1() {
  var x = await resolveAfter2Seconds(10);
  console.log(x); // 10
  return x;
}

function funcaoCerta() {
  var t = 0;
  f1().finally((e) => {
    t = e;
  });
  return t;
}

console.log(funcaoCerta());
console.log("Fim do main");

let hello = async function () {
  return "Hello";
};
hello();*/
