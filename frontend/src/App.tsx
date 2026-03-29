
import { Outlet } from 'react-router-dom'
import './App.css'
import Navbar from './Components/Navbar/Navbar'
function App() {

  return (
    <div className='relative flex flex-col w-full min-h-[100vh] bg-gray-50'>
      <Navbar/>
      <Outlet/>
    </div>
  
  )
}

export default App
