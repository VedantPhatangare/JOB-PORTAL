
import { Outlet } from 'react-router-dom'
import './App.css'
import Navbar from './Components/Navbar/Navbar'
function App() {

  return (
    <div className='relative flex flex-col items-center w-full bg-[#f8f8f8]'>
      <Navbar/>
      <Outlet/>
    </div>
  
  )
}

export default App
