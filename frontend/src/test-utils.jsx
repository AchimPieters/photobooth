import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AppProvider } from './context/AppContext.jsx'

// Stub fetch so AppProvider doesn't try to hit a real backend
beforeEach(() => {
  global.fetch = vi.fn(() =>
    Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
  )
})

afterEach(() => {
  vi.restoreAllMocks()
})

export function renderWithProviders(ui, { route = '/', routes = [] } = {}) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <AppProvider>{ui}</AppProvider>
    </MemoryRouter>
  )
}
