function f() {
  return new Promise((resolve) => {
    for (var i = 0; i < 1000000; i++) {}
  });
}

async function opa() {}
