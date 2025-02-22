import { useEffect, useState } from "react"
import Jobcard from "../Components/Jobcard"
import { JobcardProps } from "../utils/types"
import axios from "axios";

const Home:React.FC=()=>{   
    const [jobs, setjobs] = useState([]);
    const getJobs = async()=>{
        const response= await axios.get('http://127.0.0.1:5000/api/jobs/getjobs');
        setjobs(response.data.jobs)
    }
    useEffect(() => {
        getJobs();
    }, [])

  return (
    <div className="relative w-full h-full flex justify-center items-center">
        <div className="w-[70%] h-full flex pt-8">
            <div className="w-[25%] h-full"></div>
            <div className="jobs w-[50%] h-full">
                {
                    jobs?
                    jobs.map((job:JobcardProps)=>
                        <Jobcard {...job}/>
                    )
                    : "No Jobs"
                }
                
            </div>
            <div className="w-[25%] h-full"></div>
        </div>
    </div>
  )
}

export default Home
