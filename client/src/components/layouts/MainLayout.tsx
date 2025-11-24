import { Outlet } from 'react-router-dom'
import Footer from '../ui/Footer'
import Navbar from '../ui/Navbar'
const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default MainLayout 