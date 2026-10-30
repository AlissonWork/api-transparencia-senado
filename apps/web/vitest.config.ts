import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
export default defineConfig({
  plugins: [react()],
  test: {
    // Os testes rodam dentro do "navegador de mentira"
    environment: 'jsdom',
    // Roda este arquivo antes de cada arquivo de teste
    setupFiles: ['./src/testes/preparar.ts'],
  },
})
