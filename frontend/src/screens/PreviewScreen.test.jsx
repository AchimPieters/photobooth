import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '../test-utils.jsx'
import PreviewScreen from './PreviewScreen'

const { mockNavigate } = vi.hoisted(() => ({ mockNavigate: vi.fn() }))
vi.mock('react-router-dom', async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: () => mockNavigate,
}))

describe('PreviewScreen', () => {
  afterEach(() => {
    sessionStorage.clear()
    mockNavigate.mockClear()
  })

  it('redirects to / when no photos in sessionStorage', () => {
    renderWithProviders(<PreviewScreen />)
    expect(mockNavigate).toHaveBeenCalledWith('/')
  })

  it('redirects to / when fewer than 4 photos are stored', () => {
    sessionStorage.setItem('photos', JSON.stringify(['data:image/jpeg;base64,a']))
    renderWithProviders(<PreviewScreen />)
    expect(mockNavigate).toHaveBeenCalledWith('/')
  })

  it('renders the strip label when 4 photos are present', () => {
    sessionStorage.setItem('photos', JSON.stringify(Array(4).fill('data:image/jpeg;base64,stub')))
    renderWithProviders(<PreviewScreen />)
    expect(screen.getByText(/jouw fotostrip/i)).toBeInTheDocument()
  })

  it('renders "Opnieuw" and "Printen" buttons', () => {
    sessionStorage.setItem('photos', JSON.stringify(Array(4).fill('data:image/jpeg;base64,stub')))
    renderWithProviders(<PreviewScreen />)
    expect(screen.getByRole('button', { name: /opnieuw/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /printen/i })).toBeInTheDocument()
  })

  it('"↩ Opnieuw" clears storage and navigates to /camera', () => {
    sessionStorage.setItem('photos', JSON.stringify(Array(4).fill('data:image/jpeg;base64,stub')))
    sessionStorage.setItem('strip', 'data:image/jpeg;base64,stub')
    const { getByRole } = renderWithProviders(<PreviewScreen />)
    fireEvent.click(getByRole('button', { name: /opnieuw/i }))
    expect(sessionStorage.getItem('photos')).toBeNull()
    expect(mockNavigate).toHaveBeenCalledWith('/camera')
  })
})
