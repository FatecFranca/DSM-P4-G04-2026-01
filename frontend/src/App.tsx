import { BrowserRouter, Route, Routes } from 'react-router-dom'
import HomePage from './pages/home/home'
import DoorLocksPage from './pages/door-locks/doorLocksPage'
import DashboardPage from './pages/dashboard/DashboardPage'

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path='*' element={<HomePage />} />
        <Route path='/home' element={<HomePage />} />
        <Route path="/door-locks/:id" element={<DoorLocksPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
