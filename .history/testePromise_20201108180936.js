function funcao1(callback) {
  return callback(24);
}

function retorno(v) {
  return v;
}

var valor = funcao1(retorno);
console.log(typeof valor);
console.log(valor);
