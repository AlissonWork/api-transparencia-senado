import { describe, expect, it } from 'vitest'
import { mascararDocumento } from './mascarar.js'

describe('mascararDocumento', () => {
  it('mascara CPF com pontuação', () => {
    expect(mascararDocumento('123.456.789-00')).toBe('***.456.789-**')
  })

  it('mascara CPF sem pontuação', () => {
    expect(mascararDocumento('12345678900')).toBe('***.456.789-**')
  })

  it('nao mexe em CNPJ', () => {
    expect(mascararDocumento('00.000.000/0001-00')).toBe('00.000.000/0001-00')
  })

  it('nao mexe em CNPJ sem pontuaçao', () => {
    expect(mascararDocumento('00000000000100')).toBe('00.000.000/0001-00')
  })

  it('não mexe em valor vazio', () => {
    expect(mascararDocumento('')).toBe('')
  })
})
