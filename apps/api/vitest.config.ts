import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // Os arquivos de teste da API usam o MESMO banco (transparencia_teste)
    // e cada um apaga tudo no beforeAll. Rodando em paralelo, um apagaria
    // os dados do outro no meio do teste. Então: um arquivo por vez.
    fileParallelism: false,
  },
})
