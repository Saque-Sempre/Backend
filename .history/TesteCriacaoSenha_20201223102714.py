import requests

login = ''
hashSenhaAntiga = ''
hashSenhaNova = ''

ipServer = 'localhost'
portServer = '8080'

v={
	"usuario":"cliente@cliente.com",
	"acao": "redefinirSenha",
	"tokenTemporario": "7753a6fe1c92671abe2868bf8d728e",
	"hashNovaSenha": "1ca7ac99f93195a24af8196225cb9004d3c43f2c"
}

v={
	"usuario":"cliente@cliente.com",
	"acao": "gerarSenha"
}


def acaoGerarSenha(login):
    return requests.post('http://' + ipServer + ':' + portServer, data = {'acao': 'gerarSenha', 'usuario': login})

def acaoRedefinirSenha(login, hashSenhaNova):
    return requests.post('http://' + ipServer + ':' + portServer, data = {
	"usuario":"cliente@cliente.com",
	"acao": "redefinirSenha",
	"tokenTemporario": "7753a6fe1c92671abe2868bf8d728e",
	"hashNovaSenha": "1ca7ac99f93195a24af8196225cb9004d3c43f2c"
})


saidaAcaoGerarSenha = acaoGerarSenha('cliente@cliente.com')
print(saidaAcaoGerarSenha)
#if acaoGerarSenha(login) == True:
#    print('acaoRedefinirSenha: ' + str(acaoRedefinirSenha(login, hashSenhaNova)))

print('\n\nFim do Script.')