// Esconde parte do CPF (LGPD). CNPJ é de empresa e fica como está.
// "123.456.789-00" → "***.456.789-**"
export function mascararDocumento(documento: string) {
  const digitos = documento.replace(/\D/g, '') // \D = tudo que não é dígito

  if (digitos.length === 14) {
    return `${digitos.slice(0, 2)}.${digitos.slice(2, 5)}.${digitos.slice(5, 8)}/${digitos.slice(8, 12)}-${digitos.slice(12, 14)}` // Se tiver 14 dígitos, é CNPJ: formata com a pontuação correta (sem mascarar)
  }

  // mostra só os dígitos do meio, no formato do Portal da Transparência
  if (digitos.length === 11) {
    return `***.${digitos.slice(3, 6)}.${digitos.slice(6, 9)}-**`
  }

  return documento // vazio, lixo ou tamanho desconhecido: não mexe
}
