import re

login = ''
hashSenhaAntiga = ''
hashSenhaNova = ''

def acaoGerarSenha(login):
    return False

def acaoRedefinirSenha(login, hashSenhaNova):
    return False


if acaoGerarSenha(login) == True:
    print('acaoRedefinirSenha: ' + str(acaoRedefinirSenha(login, hashSenhaNova)))

print('\n\nFim do Script.')