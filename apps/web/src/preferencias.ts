// Guarda pequenas escolhas da pessoa no próprio navegador (localStorage).
// O try/catch existe porque alguns navegadores bloqueiam o localStorage
// (aba anônima, configurações de privacidade); aí só não lembramos.

export function lerPreferencia(chave: string, padrao: string) {
  try {
    return localStorage.getItem(chave) ?? padrao
  } catch {
    return padrao
  }
}

export function salvarPreferencia(chave: string, valor: string) {
  try {
    localStorage.setItem(chave, valor)
  } catch {
    // sem localStorage: a escolha vale só até fechar a página
  }
}
