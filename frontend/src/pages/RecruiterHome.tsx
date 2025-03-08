import axios from "axios"
import { useEffect } from "react"

const RecruiterHome = () => {
  const getPostedjobs= async()=>{
      // await axios.
  }
  useEffect(() => {
    getPostedjobs();
  }, [])
  
  return (
    <div>
        home
    </div>
  )
}

export default RecruiterHome
