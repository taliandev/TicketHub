import { Outlet } from 'react-router-dom'
import Footer from '../ui/Footer'
import Navbar from '../ui/Navbar'

const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-black">
      <Navbar />
      <main className="flex-grow w-full">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default MainLayout 