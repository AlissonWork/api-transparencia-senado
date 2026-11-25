import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SeloSituacao } from './Senador'

describe('SeloSituacao', () => {
  it('titular no cargo: só o selo verde', () => {
    render(<SeloSituacao emExercicio suplenteDe={null} />)
    screen.getByText('No cargo hoje')
    expect(screen.queryByText(/Suplente/)).toBeNull()
  })

  it('suplente no cargo: mostra de quem é suplente', () => {
    render(<SeloSituacao emExercicio suplenteDe="Rodrigo Pacheco" />)
    screen.getByText('No cargo hoje')
    screen.getByText('Suplente de Rodrigo Pacheco')
  })

  it('suplente sem o nome do titular: só "Suplente"', () => {
    render(<SeloSituacao emExercicio suplenteDe="titular" />)
    screen.getByText('Suplente')
  })

  it('fora do cargo: não mostra o selo de suplente', () => {
    render(<SeloSituacao emExercicio={false} suplenteDe="Rodrigo Pacheco" />)
    screen.getByText('Fora do cargo')
    expect(screen.queryByText(/Suplente/)).toBeNull()
  })
})
