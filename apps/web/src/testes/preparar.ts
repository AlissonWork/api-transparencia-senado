import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// Depois de cada teste, tira da "tela" o que ele desenhou.
// Sem isso, o componente do teste anterior continuaria lá,
// e uma busca poderia achar dois botões "Tentar de novo".
afterEach(() => {
  cleanup()
})
