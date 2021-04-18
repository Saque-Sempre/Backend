import requests

login = ''
hashSenhaAntiga = ''
hashSenhaNova = ''

ipServer = 'localhost'
portServer = '8080'

def acaoGerarSenha(login):
    return requests.post(ipServer + ':' + portServer, data = {'acao': 'gerarSenha', 'usuario': login})

def acaoRedefinirSenha(login, hashSenhaNova):
    return False


if acaoGerarSenha(login) == True:
    print('acaoRedefinirSenha: ' + str(acaoRedefinirSenha(login, hashSenhaNova)))

print('\n\nFim do Script.')