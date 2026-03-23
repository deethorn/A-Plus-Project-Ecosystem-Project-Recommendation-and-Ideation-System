import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import { useTheme } from "../../context/ThemeContext";

export default function Layout() {
  const { isDark } = useTheme()

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-black' : 'bg-gray-50'}`}>
      <Navbar />
      <main>
        <Outlet />
      </main>
    </div>
  )
}
