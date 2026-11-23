import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { resetDemoData } from '@/data/localRepository'
import { renderRoute } from '@/test/render'
import { TodayPage } from './TodayPage'

describe('TodayPage (modo demo)', () => {
  beforeEach(() => resetDemoData())

  it('muestra las tareas atrasadas y las de hoy del jardín de ejemplo', async () => {
    renderRoute(<TodayPage />)
    expect(await screen.findByRole('heading', { name: /Hoy en Huerto de ejemplo/ })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Atrasadas/ })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Para hoy/ })).toBeInTheDocument()
  })

  it('marca una tarea como hecha y permite deshacerla', async () => {
    const user = userEvent.setup()
    renderRoute(<TodayPage />)
    const button = await screen.findByRole('button', { name: 'Marcar como hecho: Abonar Rosal' })
    await user.click(button)

    const status = await screen.findByRole('status')
    expect(within(status).getByText(/Abonar Rosal/)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Marcar como hecho: Abonar Rosal' })).not.toBeInTheDocument()

    await user.click(within(status).getByRole('button', { name: 'Deshacer' }))
    expect(await screen.findByRole('button', { name: 'Marcar como hecho: Abonar Rosal' })).toBeInTheDocument()
  })
})
