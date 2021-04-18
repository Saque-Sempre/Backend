function funcao1(callback) {
  return callback(24);
}

function retorno(v) {
  return v;
}

console.log(funcao1(retorno));
